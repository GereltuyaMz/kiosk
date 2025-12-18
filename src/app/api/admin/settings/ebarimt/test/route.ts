import { NextRequest, NextResponse } from "next/server";
import { testEbarimtConnection } from "@/lib/ebarimt/client";
import type { EbarimtSettingsInput } from "@/lib/admin/settings/schemas";

export async function POST(req: NextRequest) {
  try {
    const settings = (await req.json()) as EbarimtSettingsInput;

    const result = await testEbarimtConnection({
      merchantTin: settings.ebarimt_merchant_tin,
      posNo: settings.ebarimt_pos_no,
      branchNo: settings.ebarimt_branch_no,
      districtCode: settings.ebarimt_district_code,
      clientId: settings.ebarimt_client_id,
      clientSecret: settings.ebarimt_client_secret,
      isProduction: settings.ebarimt_env === "production",
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        merchantName: result.merchantName,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || "Connection test failed",
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
}
