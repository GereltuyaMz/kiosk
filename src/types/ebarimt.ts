export type EbarimtReceiptItem = {
  name: string;
  barCode: string;
  classificationCode: string;
  taxProductCode: string;
  measureUnit: string;
  qty: number;
  unitPrice: number;
  totalBonus: number;
  totalVAT: number;
  totalCityTax: number;
  totalAmount: number;
};

export type EbarimtPayment = {
  code: string;
  status: string;
  paidAmount: number;
};

export type EbarimtSendDataRequest = {
  amount: string;
  vat: string;
  cityTax: string;
  districtCode: string;
  posNo: string;
  customerNo: string;
  type: string;
  billType: string;
  receipts: EbarimtReceiptItem[];
  payments: EbarimtPayment[];
};

export type EbarimtSendDataResponse = {
  id: string;
  status: string;
  message: string;
  qrData: string;
  billId: string;
  date: string;
  lottery: string;
  amount: number;
};

export type EbarimtReceiptData = {
  ebarimt_id: string;
  ebarimt_lottery: string;
  ebarimt_qr_data: string;
  ebarimt_response: Record<string, unknown>;
  ebarimt_created_at: string;
};
