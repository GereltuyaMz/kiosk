"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { OrderSuccessPage } from "@/components/kiosk/screens/OrderSuccessPage";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumberParam = searchParams.get("orderNumber");
  const orderNumber = orderNumberParam ? `#${orderNumberParam}` : "#0000";

  const handleRestart = () => {
    router.push("/kiosk");
  };

  return (
    <OrderSuccessPage orderNumber={orderNumber} onRestart={handleRestart} />
  );
}
