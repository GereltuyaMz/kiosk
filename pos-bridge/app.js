/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * POS Bridge Service (WebSocket + TCP Client)
 *
 * OPC = Socket Server (port 6031)
 * Bridge = TCP Client (connects to OPC)
 *
 * Architecture:
 * [Kiosk Browser] --WS :8080--> [Bridge] --TCP Client--> [OPC :6031]
 */

const WebSocket = require("ws");
const net = require("net");
const protocol = require("./protocol");

// Configuration
const config = {
  WS_PORT: parseInt(process.env.WS_PORT) || 8080,
  OPC_HOST: process.env.OPC_HOST || "192.168.0.98", // OPC терминалын IP
  OPC_PORT: parseInt(process.env.OPC_PORT) || 6031,
  TIMEOUT_MS: parseInt(process.env.TIMEOUT_MS) || 60000,
  RECONNECT_MS: parseInt(process.env.RECONNECT_MS) || 5000,
};

// State
let opcSocket = null;
let opcConnected = false;
let kioskClients = new Set();
let pendingTransaction = null;
let reconnectTimer = null;

console.log("POS Bridge Configuration:", config);

// ============================================
// TCP Client - Connect to OPC
// ============================================
function connectToOPC() {
  if (opcSocket) {
    opcSocket.destroy();
  }

  console.log(`\nConnecting to OPC at ${config.OPC_HOST}:${config.OPC_PORT}...`);

  opcSocket = new net.Socket();

  opcSocket.connect(config.OPC_PORT, config.OPC_HOST, () => {
    console.log(`>>> Connected to OPC: ${config.OPC_HOST}:${config.OPC_PORT}`);
    opcConnected = true;

    // Notify all kiosk clients
    broadcast({
      type: "opc-status",
      connected: true,
      address: `${config.OPC_HOST}:${config.OPC_PORT}`,
    });

    // Clear reconnect timer
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  });

  let buffer = Buffer.alloc(0);

  opcSocket.on("data", (data) => {
    console.log("<<< OPC raw:", data.toString("hex"));
    console.log("<<< OPC text:", data.toString("utf8"));

    buffer = Buffer.concat([buffer, data]);

    // Extract complete packets
    const { packets, remaining } = protocol.extractPackets(buffer);
    buffer = remaining;

    for (const packet of packets) {
      const parsed = protocol.parsePacket(packet);
      console.log("<<< Parsed:", JSON.stringify(parsed, null, 2));

      // Send to all kiosk clients
      broadcast({
        type: "opc-response",
        payload: parsed,
      });

      // Resolve pending transaction
      if (pendingTransaction) {
        if (
          parsed.type === "TRANSACTION_RESP" ||
          parsed.type === pendingTransaction.expectedType ||
          parsed.contentJson // Any JSON response
        ) {
          clearTimeout(pendingTransaction.timeout);
          pendingTransaction.resolve({
            success: parsed.resultCode === "00",
            resultCode: parsed.resultCode,
            message: parsed.message,
            txnId: parsed.txnId,
            approvalCode: parsed.approvalCode,
            cardNumber: parsed.cardNumber,
            cardType: parsed.cardType,
            contentJson: parsed.contentJson,
          });
          pendingTransaction = null;
        }
      }
    }
  });

  opcSocket.on("error", (err) => {
    console.error("!!! OPC error:", err.message);
    broadcast({ type: "opc-error", error: err.message });
  });

  opcSocket.on("close", () => {
    console.log("<<< OPC connection closed");
    opcConnected = false;
    opcSocket = null;
    broadcast({ type: "opc-status", connected: false });

    if (pendingTransaction) {
      pendingTransaction.reject({
        success: false,
        message: "OPC disconnected",
      });
      pendingTransaction = null;
    }

    // Auto reconnect
    scheduleReconnect();
  });
}

function scheduleReconnect() {
  if (reconnectTimer) return;

  console.log(`Reconnecting in ${config.RECONNECT_MS}ms...`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectToOPC();
  }, config.RECONNECT_MS);
}

// Start OPC connection
connectToOPC();

// ============================================
// WebSocket Server - Kiosk connects here
// ============================================
const wss = new WebSocket.Server({ port: config.WS_PORT });

wss.on("connection", (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`\n>>> Kiosk connected: ${clientIP}`);

  kioskClients.add(ws);

  // Send current OPC status
  ws.send(
    JSON.stringify({
      type: "opc-status",
      connected: opcConnected,
      address: opcConnected ? `${config.OPC_HOST}:${config.OPC_PORT}` : null,
    })
  );

  ws.on("message", async (msg) => {
    let data;
    try {
      data = JSON.parse(msg.toString());
    } catch {
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      return;
    }

    console.log(">>> Kiosk cmd:", data);

    switch (data.cmd) {
      case "purchase":
        await handlePurchase(ws, data);
        break;
      case "void":
        await handleVoid(ws, data);
        break;
      case "refund":
        await handleRefund(ws, data);
        break;
      case "cancel":
        await handleCancel(ws);
        break;
      case "inquiry":
        await handleInquiry(ws, data);
        break;
      case "status":
        ws.send(
          JSON.stringify({
            type: "opc-status",
            connected: opcConnected,
            address: `${config.OPC_HOST}:${config.OPC_PORT}`,
          })
        );
        break;
      case "reconnect":
        connectToOPC();
        ws.send(JSON.stringify({ type: "info", message: "Reconnecting..." }));
        break;
      case "raw":
        await handleRaw(ws, data);
        break;
      default:
        ws.send(
          JSON.stringify({ type: "error", message: `Unknown cmd: ${data.cmd}` })
        );
    }
  });

  ws.on("close", () => {
    console.log(`<<< Kiosk disconnected: ${clientIP}`);
    kioskClients.delete(ws);
  });

  ws.on("error", (err) => {
    console.error("Kiosk WS error:", err.message);
    kioskClients.delete(ws);
  });
});

console.log(
  `WebSocket Server listening on port ${config.WS_PORT} (Kiosk connects here)`
);

// ============================================
// Command Handlers
// ============================================

async function handlePurchase(ws, data) {
  const { amount, orderId, currency = "496" } = data;

  if (!amount || !orderId) {
    ws.send(
      JSON.stringify({ type: "error", message: "amount and orderId required" })
    );
    return;
  }

  try {
    const packet = protocol.buildSalePacket({ amount, orderId, currency });
    const result = await sendToOPC(packet);
    ws.send(JSON.stringify({ type: "purchase-result", ...result }));
  } catch (err) {
    ws.send(JSON.stringify({ type: "purchase-result", ...err }));
  }
}

async function handleVoid(ws, data) {
  const { originalTxnId, amount } = data;

  if (!originalTxnId) {
    ws.send(
      JSON.stringify({ type: "error", message: "originalTxnId required" })
    );
    return;
  }

  try {
    const packet = protocol.buildVoidPacket({ originalTxnId, amount });
    const result = await sendToOPC(packet);
    ws.send(JSON.stringify({ type: "void-result", ...result }));
  } catch (err) {
    ws.send(JSON.stringify({ type: "void-result", ...err }));
  }
}

async function handleRefund(ws, data) {
  const { originalTxnId, amount, currency = "496" } = data;

  if (!originalTxnId) {
    ws.send(
      JSON.stringify({ type: "error", message: "originalTxnId required" })
    );
    return;
  }

  try {
    const packet = protocol.buildRefundPacket({
      originalTxnId,
      amount,
      currency,
    });
    const result = await sendToOPC(packet);
    ws.send(JSON.stringify({ type: "refund-result", ...result }));
  } catch (err) {
    ws.send(JSON.stringify({ type: "refund-result", ...err }));
  }
}

async function handleCancel(ws) {
  try {
    const packet = protocol.buildCancelPacket();
    const result = await sendToOPC(packet);
    ws.send(JSON.stringify({ type: "cancel-result", ...result }));
  } catch (err) {
    ws.send(JSON.stringify({ type: "cancel-result", ...err }));
  }
}

async function handleInquiry(ws, data) {
  const { orderId } = data;

  try {
    const packet = protocol.buildInquiryPacket({ orderId });
    const result = await sendToOPC(packet);
    ws.send(JSON.stringify({ type: "inquiry-result", ...result }));
  } catch (err) {
    ws.send(JSON.stringify({ type: "inquiry-result", ...err }));
  }
}

async function handleRaw(ws, data) {
  const { hex } = data;

  if (!hex) {
    ws.send(JSON.stringify({ type: "error", message: "hex required" }));
    return;
  }

  try {
    const packet = Buffer.from(hex, "hex");
    const result = await sendToOPC(packet);
    ws.send(JSON.stringify({ type: "raw-result", ...result }));
  } catch (err) {
    ws.send(JSON.stringify({ type: "raw-result", ...err }));
  }
}

// ============================================
// Send to OPC
// ============================================
function sendToOPC(packet, expectedType = "TRANSACTION_RESP") {
  return new Promise((resolve, reject) => {
    if (!opcConnected || !opcSocket) {
      return reject({
        success: false,
        resultCode: "NC",
        message: "OPC not connected",
      });
    }

    const timeout = setTimeout(() => {
      pendingTransaction = null;
      reject({
        success: false,
        resultCode: "TO",
        message: "Transaction timeout",
      });
    }, config.TIMEOUT_MS);

    pendingTransaction = {
      resolve,
      reject,
      expectedType,
      timeout,
    };

    console.log(">>> Sending to OPC:", packet.toString("hex"));
    opcSocket.write(packet);
  });
}

// ============================================
// Broadcast to Kiosk clients
// ============================================
function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of kioskClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  }
}

// ============================================
// Startup
// ============================================
console.log("");
console.log("===========================================");
console.log("   POS Bridge (TCP Client Mode)");
console.log("===========================================");
console.log(`WebSocket: ws://localhost:${config.WS_PORT}  (Kiosk)`);
console.log(`OPC Target: ${config.OPC_HOST}:${config.OPC_PORT}`);
console.log(`Timeout: ${config.TIMEOUT_MS}ms`);
console.log("");
console.log("Commands:");
console.log('  { "cmd": "purchase", "amount": 10000, "orderId": "ORD-1" }');
console.log('  { "cmd": "cancel" }');
console.log('  { "cmd": "status" }');
console.log('  { "cmd": "reconnect" }');
console.log("===========================================");
console.log("");
