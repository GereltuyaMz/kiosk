"use client";

import { useRouter } from "next/navigation";
import { TouchToStart } from "@/components/kiosk/screens/TouchToStart";

export default function KioskPage() {
  const router = useRouter();

  const handleStartOrder = () => {
    router.push("/kiosk/order-type");
  };

  return <TouchToStart onStart={handleStartOrder} />;
}
