import { getKioskProducts } from "@/lib/kiosk/actions";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("categoryId");

  const result = await getKioskProducts(category);
  return Response.json(result);
}