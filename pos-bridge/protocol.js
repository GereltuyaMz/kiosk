/**
 * WizarPOS OPC Protocol Handler
 *
 * Packet Format:
 * STX(0x02) + VERSION(1) + CTRL(4) + LEN(2) + CONTENT(JSON) + ETX(0x03) + BCC(1)
 *
 * CTRL bytes:
 *   [0] = Message type (0xF1=Handshake, 0x01=Transaction, etc.)
 *   [1] = Reserved (0x00)
 *   [2] = Sequence high byte
 *   [3] = Sequence low byte
 */

const STX = 0x02;
const ETX = 0x03;
const VERSION = 0x02;

// Message types (CTRL byte 0) - Adjust based on your OPC PDF
const MSG_TYPE = {
  HANDSHAKE_REQ: 0xf1,
  HANDSHAKE_RESP: 0xf2,
  TRANSACTION_REQ: 0x01,
  TRANSACTION_RESP: 0x02,
};

// Transaction types for CONTENT JSON
const TRANS_TYPE = {
  PURCHASE: "Purchase",
  VOID: "Void",
  REFUND: "Refund",
  CANCEL: "Cancel",
  INQUIRY: "Inquiry",
};

// Response codes
const RESULT_CODES = {
  "00": "APPROVED",
  "01": "REFER_TO_ISSUER",
  "03": "INVALID_MERCHANT",
  "05": "DO_NOT_HONOR",
  12: "INVALID_TRANSACTION",
  51: "INSUFFICIENT_FUNDS",
  54: "EXPIRED_CARD",
  55: "INCORRECT_PIN",
  91: "ISSUER_NOT_AVAILABLE",
};

// Sequence counter
let sequenceNumber = 1;

/**
 * Calculate BCC (Block Check Character)
 * XOR from VERSION to ETX (inclusive)
 */
function calcBCC(buf) {
  let bcc = 0x00;
  // XOR from index 1 (VERSION) to second-to-last byte (ETX)
  for (let i = 1; i < buf.length; i++) {
    bcc ^= buf[i];
  }
  return bcc & 0xff;
}

/**
 * Build OPC packet
 * @param {Buffer|Object} content - Content buffer or JSON object
 * @param {number} msgType - CTRL byte 0 (message type)
 */
function buildOpcPacket(content, msgType) {
  // Convert JSON object to buffer if needed
  const contentBuf =
    Buffer.isBuffer(content)
      ? content
      : Buffer.from(JSON.stringify(content), "utf8");

  // CTRL: 4 bytes
  const CTRL = Buffer.alloc(4);
  CTRL[0] = msgType; // Message type
  CTRL[1] = 0x00; // Reserved
  CTRL[2] = (sequenceNumber >> 8) & 0xff; // Seq high
  CTRL[3] = sequenceNumber & 0xff; // Seq low
  sequenceNumber = (sequenceNumber + 1) % 0xffff;

  // LEN: 2 bytes (content length)
  const LEN = Buffer.alloc(2);
  const len = contentBuf.length;
  LEN[0] = (len >> 8) & 0xff;
  LEN[1] = len & 0xff;

  // Build packet without BCC first
  const packetWithoutBCC = Buffer.concat([
    Buffer.from([STX, VERSION]),
    CTRL,
    LEN,
    contentBuf,
    Buffer.from([ETX]),
  ]);

  // Calculate BCC
  const bcc = calcBCC(packetWithoutBCC);

  // Final packet with BCC
  return Buffer.concat([packetWithoutBCC, Buffer.from([bcc])]);
}

/**
 * Build Handshake Request packet
 * Content: 4 bytes random value
 */
function buildHandshakePacket() {
  const random = Buffer.alloc(4);
  random.writeUInt32BE(Math.floor(Math.random() * 0xffffffff), 0);

  return buildOpcPacket(random, MSG_TYPE.HANDSHAKE_REQ);
}

/**
 * Build Purchase (Sale) packet
 */
function buildSalePacket({ amount, orderId, currency = "496" }) {
  const content = {
    TransType: TRANS_TYPE.PURCHASE,
    TransAmount: String(amount),
    CurrencyCode: currency, // 496 = MNT
    TransIndexCode: orderId,
  };

  return buildOpcPacket(content, MSG_TYPE.TRANSACTION_REQ);
}

/**
 * Build Void packet
 */
function buildVoidPacket({ originalTxnId, amount }) {
  const content = {
    TransType: TRANS_TYPE.VOID,
    TransAmount: String(amount),
    OriginalTransIndexCode: originalTxnId,
  };

  return buildOpcPacket(content, MSG_TYPE.TRANSACTION_REQ);
}

/**
 * Build Refund packet
 */
function buildRefundPacket({ originalTxnId, amount, currency = "496" }) {
  const content = {
    TransType: TRANS_TYPE.REFUND,
    TransAmount: String(amount),
    CurrencyCode: currency,
    OriginalTransIndexCode: originalTxnId,
  };

  return buildOpcPacket(content, MSG_TYPE.TRANSACTION_REQ);
}

/**
 * Build Cancel packet
 */
function buildCancelPacket() {
  const content = {
    TransType: TRANS_TYPE.CANCEL,
  };

  return buildOpcPacket(content, MSG_TYPE.TRANSACTION_REQ);
}

/**
 * Build Inquiry packet
 */
function buildInquiryPacket({ orderId }) {
  const content = {
    TransType: TRANS_TYPE.INQUIRY,
    TransIndexCode: orderId,
  };

  return buildOpcPacket(content, MSG_TYPE.TRANSACTION_REQ);
}

/**
 * Extract complete packets from buffer
 * Returns { packets: Buffer[], remaining: Buffer }
 */
function extractPackets(buffer) {
  const packets = [];
  let offset = 0;

  while (offset < buffer.length) {
    // Find STX
    const stxIndex = buffer.indexOf(STX, offset);
    if (stxIndex === -1) break;

    // Need at least 10 bytes: STX(1) + VERSION(1) + CTRL(4) + LEN(2) + ETX(1) + BCC(1)
    if (buffer.length - stxIndex < 10) break;

    // Read content length
    const lenHigh = buffer[stxIndex + 6];
    const lenLow = buffer[stxIndex + 7];
    const contentLen = (lenHigh << 8) + lenLow;

    // Total packet length: 8 (header) + contentLen + 1 (ETX) + 1 (BCC)
    const packetLen = 8 + contentLen + 2;

    if (buffer.length - stxIndex < packetLen) break;

    // Verify ETX
    const etxPos = stxIndex + 8 + contentLen;
    if (buffer[etxPos] === ETX) {
      packets.push(buffer.slice(stxIndex, stxIndex + packetLen));
      offset = stxIndex + packetLen;
    } else {
      // Invalid packet, skip this STX
      offset = stxIndex + 1;
    }
  }

  return {
    packets,
    remaining: buffer.slice(offset),
  };
}

/**
 * Parse received packet
 */
function parsePacket(buf) {
  if (buf.length < 10) {
    return { error: "INVALID_PACKET_LENGTH" };
  }

  const stx = buf[0];
  const version = buf[1];

  // CTRL: 4 bytes
  const ctrl = {
    msgType: buf[2],
    reserved: buf[3],
    seqHigh: buf[4],
    seqLow: buf[5],
  };

  // LEN: 2 bytes
  const contentLen = (buf[6] << 8) + buf[7];

  // Content
  const contentStart = 8;
  const contentEnd = contentStart + contentLen;
  const contentBuf = buf.slice(contentStart, contentEnd);

  const etx = buf[contentEnd];
  const bcc = buf[contentEnd + 1];

  if (stx !== STX) {
    return { error: "INVALID_STX" };
  }

  if (etx !== ETX) {
    return { error: "INVALID_ETX" };
  }

  // Verify BCC
  const packetWithoutBCC = buf.slice(0, contentEnd + 1);
  const calculatedBCC = calcBCC(packetWithoutBCC);
  if (calculatedBCC !== bcc) {
    console.warn(
      `BCC mismatch: expected ${bcc.toString(16)}, got ${calculatedBCC.toString(16)}`
    );
  }

  // Determine packet type
  let type = "UNKNOWN";
  if (ctrl.msgType === MSG_TYPE.HANDSHAKE_RESP) {
    type = "HANDSHAKE_RESP";
  } else if (ctrl.msgType === MSG_TYPE.TRANSACTION_RESP) {
    type = "TRANSACTION_RESP";
  }

  // Try to parse content as JSON
  let contentJson = null;
  let raw = contentBuf.toString("utf8");
  try {
    contentJson = JSON.parse(raw);
  } catch {
    // Content might not be JSON (e.g., handshake response)
  }

  // Extract result info from JSON if available
  let resultCode = "00";
  let message = "OK";
  let txnId = "";
  let approvalCode = "";
  let cardNumber = "";
  let cardType = "";

  if (contentJson) {
    resultCode = contentJson.ResponseCode || contentJson.RespCode || "00";
    message =
      contentJson.ResponseMessage ||
      contentJson.RespMsg ||
      RESULT_CODES[resultCode] ||
      "UNKNOWN";
    txnId =
      contentJson.TransIndexCode ||
      contentJson.RRN ||
      contentJson.RetrievalRefNo ||
      "";
    approvalCode = contentJson.ApprovalCode || contentJson.AuthCode || "";
    cardNumber = contentJson.MaskedPAN || contentJson.CardNo || "";
    cardType = contentJson.CardType || contentJson.CardBrand || "";
  }

  return {
    type,
    version,
    ctrl,
    contentLen,
    raw,
    contentJson,
    resultCode,
    message,
    txnId,
    approvalCode,
    cardNumber,
    cardType,
    bcc,
  };
}

module.exports = {
  STX,
  ETX,
  VERSION,
  MSG_TYPE,
  TRANS_TYPE,
  RESULT_CODES,
  calcBCC,
  buildOpcPacket,
  buildHandshakePacket,
  buildSalePacket,
  buildVoidPacket,
  buildRefundPacket,
  buildCancelPacket,
  buildInquiryPacket,
  extractPackets,
  parsePacket,
};
