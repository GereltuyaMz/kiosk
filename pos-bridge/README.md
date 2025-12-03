# POS Bridge Service

This service acts as a bridge between the kiosk web application and the WizarPOS payment terminal.

## Architecture

```
[Kiosk Browser] --WebSocket--> [Bridge :8080] --TCP--> [OPC Terminal :6031]
```

## Setup

1. Install dependencies:
```bash
npm install
# or
bun install
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env`:
- `OPC_HOST`: IP address of the WizarPOS terminal (default: 192.168.0.98)
- `OPC_PORT`: Port of the OPC terminal (default: 6031)
- `WS_PORT`: WebSocket server port (default: 8080)
- `TIMEOUT_MS`: Transaction timeout in milliseconds (default: 60000)

## Running

```bash
npm start
# or for development with auto-reload:
npm run dev
# or with bun:
bun run app.js
```

## Testing

From the kiosk application, when a user selects "Bank Card" payment:
1. The kiosk connects to `ws://localhost:8080`
2. Sends: `{cmd: 'purchase', amount: 10000, orderId: 'ORD-123', currency: '496'}`
3. User taps card on the POS terminal
4. Bridge receives response and forwards to kiosk
5. Kiosk shows success/error page

## Commands

- `purchase`: Process payment
- `cancel`: Cancel current transaction
- `status`: Check OPC connection status
- `void`: Void a transaction
- `refund`: Refund a transaction

## Troubleshooting

- **"OPC not connected"**: Check that the OPC terminal is powered on and the IP address in `.env` is correct
- **"WebSocket error"**: Ensure the bridge service is running on port 8080
- **Transaction timeout**: Check network connection to OPC terminal
