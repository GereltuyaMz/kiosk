import {
  type EbarimtSendDataRequest,
  type EbarimtSendDataResponse,
} from "@/types/ebarimt";

export type EbarimtConfig = {
  merchantTin: string;
  posNo: string;
  branchNo: string;
  districtCode: string;
  clientId: string;
  clientSecret: string;
  isProduction: boolean;
};

type TokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};

type MerchantInfo = {
  name: string;
  tin: string;
};

const STAGING_AUTH_URL = "";
const PRODUCTION_AUTH_URL = "";
const API_BASE_URL = "";

const getAuthUrl = (isProduction: boolean): string => {
  return isProduction ? PRODUCTION_AUTH_URL : STAGING_AUTH_URL;
};

export const getEbarimtToken = async (
  config: EbarimtConfig
): Promise<string> => {
  const response = await fetch(getAuthUrl(config.isProduction), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Authentication failed: ${error}`);
  }

  const data: TokenResponse = await response.json();
  return data.access_token;
};

export const getMerchantInfo = async (
  merchantTin: string
): Promise<MerchantInfo> => {
  const response = await fetch(
    `${API_BASE_URL}/api/info/check/getInfo?tin=${merchantTin}`,
    { method: "GET" }
  );

  if (!response.ok) {
    throw new Error("Failed to get merchant info");
  }

  const data = await response.json();
  return {
    name: data.name,
    tin: data.tin,
  };
};

export const testEbarimtConnection = async (
  config: EbarimtConfig
): Promise<{ success: boolean; merchantName?: string; error?: string }> => {
  try {
    await getEbarimtToken(config);
    const merchantInfo = await getMerchantInfo(config.merchantTin);

    return {
      success: true,
      merchantName: merchantInfo.name,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const sendEbarimtData = async (
  config: EbarimtConfig,
  data: EbarimtSendDataRequest
): Promise<EbarimtSendDataResponse> => {
  const token = await getEbarimtToken(config);

  const response = await fetch(`${API_BASE_URL}/api/put`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send eBarimt data: ${error}`);
  }

  return response.json();
};
