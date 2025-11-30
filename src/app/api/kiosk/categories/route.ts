import { getKioskCategories } from "@/lib/kiosk/actions";

export async function GET() {
  const result = await getKioskCategories();
  return Response.json(result);
}
