"use client";

import { useRouter } from "next/navigation";
import { OrderTypeSelection } from "@/components/kiosk/screens/OrderTypeSelection";

export default function OrderTypePage() {
  const router = useRouter();

  const handleSelectOrderType = (type: "eatIn" | "takeOut") => {
    router.push(`/kiosk/order?type=${type}`);
  };

  return <OrderTypeSelection onSelect={handleSelectOrderType} />;
}
