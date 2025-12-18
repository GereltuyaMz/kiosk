"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/actions";
import {
  sendEbarimtData,
  type EbarimtConfig,
} from "./client";
import type {
  EbarimtReceiptItem,
  EbarimtPayment,
  EbarimtSendDataRequest,
  EbarimtReceiptData,
} from "@/types/ebarimt";
import type { CreateOrderRequest } from "@/types/kiosk";

type PaymentSettings = {
  ebarimt_merchant_tin: string;
  ebarimt_pos_no: string;
  ebarimt_branch_no: string;
  ebarimt_district_code: string;
  ebarimt_client_id: string;
  ebarimt_client_secret: string;
  ebarimt_is_active: boolean;
  ebarimt_env: string;
};

export const getEbarimtSettings = async (
  tenantId: string
): Promise<PaymentSettings | null> => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payment_settings")
    .select(
      `
      ebarimt_merchant_tin,
      ebarimt_pos_no,
      ebarimt_branch_no,
      ebarimt_district_code,
      ebarimt_client_id,
      ebarimt_client_secret,
      ebarimt_is_active,
      ebarimt_env
    `
    )
    .eq("tenant_id", tenantId)
    .eq("ebarimt_is_active", true)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
};

const formatOrderToEbarimtRequest = (
  orderData: CreateOrderRequest,
  settings: PaymentSettings
): EbarimtSendDataRequest => {
  const totalAmount = orderData.total_amount;
  const vat = Math.round(totalAmount * 0.1);
  const cityTax = 0;

  const receipts: EbarimtReceiptItem[] = orderData.items.map((item) => {
    const itemTotalPrice =
      (item.base_price +
        item.variants.reduce((sum, v) => sum + v.price_modifier, 0) +
        item.addons.reduce((sum, a) => sum + a.price, 0)) *
      item.quantity;

    return {
      name: item.name,
      barCode: item.product_id,
      classificationCode: "5610101",
      taxProductCode: "1",
      measureUnit: "ш",
      qty: item.quantity,
      unitPrice: Math.round(
        item.base_price +
          item.variants.reduce((sum, v) => sum + v.price_modifier, 0) +
          item.addons.reduce((sum, a) => sum + a.price, 0)
      ),
      totalBonus: 0,
      totalVAT: Math.round(itemTotalPrice * 0.1),
      totalCityTax: 0,
      totalAmount: Math.round(itemTotalPrice),
    };
  });

  const payments: EbarimtPayment[] = [
    {
      code: orderData.payment_method === "qpay" ? "CARD" : "CARD",
      status: "PAID",
      paidAmount: totalAmount,
    },
  ];

  return {
    amount: totalAmount.toString(),
    vat: vat.toString(),
    cityTax: cityTax.toString(),
    districtCode: settings.ebarimt_district_code,
    posNo: settings.ebarimt_pos_no,
    customerNo: "",
    type: orderData.receipt_type,
    billType: "1",
    receipts,
    payments,
  };
};

export const generateEbarimtReceipt = async (
  orderData: CreateOrderRequest,
  tenantId: string
): Promise<EbarimtReceiptData | null> => {
  try {
    const settings = await getEbarimtSettings(tenantId);

    if (!settings) {
      return null;
    }

    const config: EbarimtConfig = {
      merchantTin: settings.ebarimt_merchant_tin,
      posNo: settings.ebarimt_pos_no,
      branchNo: settings.ebarimt_branch_no,
      districtCode: settings.ebarimt_district_code,
      clientId: settings.ebarimt_client_id,
      clientSecret: settings.ebarimt_client_secret,
      isProduction: settings.ebarimt_env === "production",
    };

    const ebarimtRequest = formatOrderToEbarimtRequest(orderData, settings);
    const response = await sendEbarimtData(config, ebarimtRequest);

    return {
      ebarimt_id: response.billId,
      ebarimt_lottery: response.lottery,
      ebarimt_qr_data: response.qrData,
      ebarimt_response: response as unknown as Record<string, unknown>,
      ebarimt_created_at: response.date,
    };
  } catch (error) {
    console.error("eBarimt receipt generation failed:", error);
    throw error;
  }
};

export const addToRetryQueue = async (
  orderId: string,
  tenantId: string,
  orderData: CreateOrderRequest,
  errorMessage: string
): Promise<void> => {
  const supabase = await createClient();

  const settings = await getEbarimtSettings(tenantId);
  if (!settings) return;

  const ebarimtRequest = formatOrderToEbarimtRequest(orderData, settings);

  await supabase.from("ebarimt_retry_queue").insert({
    order_id: orderId,
    tenant_id: tenantId,
    request_payload: ebarimtRequest as unknown as Record<string, unknown>,
    error_message: errorMessage,
    retry_count: 0,
    max_retries: 5,
    next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
};
