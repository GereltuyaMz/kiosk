import { useEffect, useRef, useState, useCallback } from "react";

export type PaymentState = "idle" | "connecting" | "processing" | "success" | "error";

export type OPCStatus = {
  connected: boolean;
  address?: string;
};

export type PaymentResult = {
  success: boolean;
  resultCode: string;
  message: string;
  txnId?: string;
  approvalCode?: string;
  cardNumber?: string;
  cardType?: string;
};

type MessageType =
  | "opc-status"
  | "opc-response"
  | "opc-error"
  | "purchase-result"
  | "cancel-result"
  | "void-result"
  | "refund-result"
  | "error"
  | "info";

type OPCResponsePayload = {
  type: string;
  version?: number;
  ctrl?: {
    msgType: number;
    reserved: number;
    seqHigh: number;
    seqLow: number;
  };
  contentLen?: number;
  raw?: string;
  contentJson?: Record<string, unknown>;
  resultCode?: string;
  message?: string;
  txnId?: string;
  approvalCode?: string;
  cardNumber?: string;
  cardType?: string;
  bcc?: number;
};

type BridgeMessage = {
  type: MessageType;
  connected?: boolean;
  address?: string;
  error?: string;
  payload?: OPCResponsePayload;
  success?: boolean;
  resultCode?: string;
  message?: string;
  txnId?: string;
  approvalCode?: string;
  cardNumber?: string;
  cardType?: string;
};

const WS_URL = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_POS_BRIDGE_URL || "ws://localhost:8080")
  : "";

export const usePOSBridge = () => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectRef = useRef<(() => void) | null>(null);

  const [wsConnected, setWsConnected] = useState(false);
  const [opcStatus, setOpcStatus] = useState<OPCStatus>({ connected: false });
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [result, setResult] = useState<PaymentResult | null>(null);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[POS Bridge] Connected to bridge");
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg: BridgeMessage = JSON.parse(event.data);
          console.log("[POS Bridge] Received:", msg.type);

          switch (msg.type) {
            case "opc-status":
              setOpcStatus({
                connected: msg.connected || false,
                address: msg.address,
              });
              break;

            case "opc-response":
              console.log("[POS Bridge] OPC response:", msg.payload);
              break;

            case "purchase-result":
              setResult({
                success: msg.success || false,
                resultCode: msg.resultCode || "ERR",
                message: msg.message || "Unknown error",
                txnId: msg.txnId,
                approvalCode: msg.approvalCode,
                cardNumber: msg.cardNumber,
                cardType: msg.cardType,
              });
              setPaymentState(msg.success ? "success" : "error");
              break;

            case "cancel-result":
              console.log("[POS Bridge] Cancel result:", msg);
              setPaymentState("idle");
              break;

            case "error":
              console.error("[POS Bridge] Error:", msg.message);
              setResult({
                success: false,
                resultCode: "ERR",
                message: msg.message || "Unknown error",
              });
              setPaymentState("error");
              break;

            case "opc-error":
              console.error("[POS Bridge] OPC Error:", msg.error);
              break;
          }
        } catch (e) {
          console.error("[POS Bridge] Parse error:", e);
        }
      };

      ws.onclose = () => {
        console.log("[POS Bridge] Disconnected from bridge");
        setWsConnected(false);
        setOpcStatus({ connected: false });

        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("[POS Bridge] Attempting to reconnect...");
          connectRef.current?.();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error("[POS Bridge] WebSocket error:", error);
      };
    } catch (error) {
      console.error("[POS Bridge] Connection error:", error);
    }
  }, []);

  // Store connect function in ref so it can call itself (done in effect to avoid render-time ref access)
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const sendCommand = useCallback((cmd: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(cmd));
      console.log("[POS Bridge] Sent command:", cmd);
    } else {
      console.error("[POS Bridge] WebSocket not connected");
    }
  }, []);

  const processPurchase = useCallback(
    ({ amount, orderId }: { amount: number; orderId: string }) => {
      setPaymentState("processing");
      setResult(null);
      sendCommand({
        cmd: "purchase",
        amount,
        orderId,
        currency: "496", // MNT
      });
    },
    [sendCommand]
  );

  const cancelTransaction = useCallback(() => {
    sendCommand({ cmd: "cancel" });
    setPaymentState("idle");
    setResult(null);
  }, [sendCommand]);

  const resetPayment = useCallback(() => {
    setPaymentState("idle");
    setResult(null);
  }, []);

  const checkStatus = useCallback(() => {
    sendCommand({ cmd: "status" });
  }, [sendCommand]);

  // Initialize connection
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    wsConnected,
    opcStatus,
    paymentState,
    result,
    processPurchase,
    cancelTransaction,
    resetPayment,
    checkStatus,
  };
};
