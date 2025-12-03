import { getKioskProductDetails } from "@/lib/kiosk/actions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const result = await getKioskProductDetails(productId);
  return Response.json(result);
}
