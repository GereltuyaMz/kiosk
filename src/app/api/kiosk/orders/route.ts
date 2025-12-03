import { createOrder } from "@/lib/kiosk/actions";
import type { CreateOrderRequest } from "@/types/kiosk";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateOrderRequest;

    if (!body.dine_type || !body.receipt_type || !body.payment_method || !body.items || body.items.length === 0) {
      return Response.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const result = await createOrder(body);
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}
