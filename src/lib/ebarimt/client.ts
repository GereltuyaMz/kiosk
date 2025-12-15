type EbarimtConfig = {
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

export class EbarimtClient {
  private config: EbarimtConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  private readonly STAGING_AUTH_URL =
    "https://st.auth.itc.gov.mn/auth/realms/Staging/protocol/openid-connect/token";
  private readonly PRODUCTION_AUTH_URL =
    "https://auth.itc.gov.mn/auth/realms/Production/protocol/openid-connect/token";
  private readonly API_BASE_URL = "https://api.ebarimt.mn";

  constructor(config: EbarimtConfig) {
    this.config = config;
  }

  private get authUrl(): string {
    return this.config.isProduction
      ? this.PRODUCTION_AUTH_URL
      : this.STAGING_AUTH_URL;
  }

  private async getToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch(this.authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Authentication failed: ${error}`);
    }

    const data: TokenResponse = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);

    return this.accessToken;
  }

  async getMerchantInfo(): Promise<MerchantInfo> {
    const response = await fetch(
      `${this.API_BASE_URL}/api/info/check/getInfo?tin=${this.config.merchantTin}`,
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
  }

  async testConnection(): Promise<{ success: boolean; merchantName?: string; error?: string }> {
    try {
      // Try to get token first
      await this.getToken();

      // Try to get merchant info
      const merchantInfo = await this.getMerchantInfo();

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
  }
}

export const createEbarimtClient = (config: EbarimtConfig): EbarimtClient => {
  return new EbarimtClient(config);
};
