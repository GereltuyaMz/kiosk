# eBarimt Implementation Guide for Multi-Tenant Kiosk Platform

## Table of Contents
1. [Overview](#1-overview)
2. [Architecture - Who Does What](#2-architecture---who-does-what)
3. [For Merchants - eBarimt Setup Guide](#3-for-merchants---ebarimt-setup-guide)
4. [Database Schema](#4-database-schema)
5. [Admin Panel - eBarimt Settings](#5-admin-panel---ebarimt-settings)
6. [Backend Integration](#6-backend-integration)
7. [Kiosk UI - Success Screen](#7-kiosk-ui---success-screen)
8. [Testing](#8-testing)
9. [Merchant Onboarding Checklist](#9-merchant-onboarding-checklist)

---

## 1. Overview

### Your Platform Structure

```
┌─────────────────────────────────────────────────────────────┐
│  YOUR COMPANY (Экспонд майнд) - Platform Developer         │
│  ✗ Does NOT generate eBarimt                                │
│  ✓ Builds the kiosk software                               │
│  ✓ Provides integration code                                │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   Merchant A    │ │   Merchant B    │ │   Merchant C    │
│   (Restaurant)  │ │   (Cafe)        │ │   (Fast Food)   │
│                 │ │                 │ │                 │
│ Their own:      │ │ Their own:      │ │ Their own:      │
│ • TIN           │ │ • TIN           │ │ • TIN           │
│ • POS Number    │ │ • POS Number    │ │ • POS Number    │
│ • Credentials   │ │ • Credentials   │ │ • Credentials   │
│                 │ │                 │ │                 │
│ eBarimt shows:  │ │ eBarimt shows:  │ │ eBarimt shows:  │
│ "Restaurant A"  │ │ "Cafe B"        │ │ "Fast Food C"   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### Key Principle

> **Each merchant is responsible for their own eBarimt.**
> Your platform just provides the integration.

---

## 2. Architecture - Who Does What

### Your Responsibility (Platform Developer)

| Task | Description |
|------|-------------|
| ✅ Build Admin Panel | Settings page for merchants to enter credentials |
| ✅ Build Integration | Code that calls eBarimt API |
| ✅ Store Credentials | Securely store each tenant's eBarimt settings |
| ✅ Display Receipt | Show eBarimt QR code on success screen |
| ✅ Handle Errors | Retry failed receipts, show error messages |
| ✅ Documentation | Guide merchants on how to get eBarimt access |

### Merchant's Responsibility

| Task | Description |
|------|-------------|
| ✅ Register with Tax Authority | Get their company registered for eBarimt |
| ✅ Get API Credentials | Apply for POS API access |
| ✅ Enter Credentials | Input their settings in your Admin Panel |
| ✅ Legal Compliance | They are responsible for tax reporting |

---

## 3. For Merchants - eBarimt Setup Guide

**Give this guide to your merchants when they sign up!**

---

### Merchant Guide: How to Set Up eBarimt for Your Kiosk

#### Step 1: Register on eBarimt System

1. Go to **https://ebarimt.mn**
2. Click **"БИЗНЕС ЭРХЛЭГЧ"** (Business Operator)
3. Log in with your company credentials:
   - Татвар төлөгчийн дугаар (TIN)
   - Хэрэглэгчийн нэр (Username) - usually your registration number
   - Нууц үг (Password) - from tax office

**Don't have access?** Visit your local tax office with:
- Business registration certificate
- Director's ID
- Contact: Tax Hotline **1800-1288**

#### Step 2: Get POS API Access

1. Go to **https://e-invoice.ebarimt.mn**
2. Log in with same credentials
3. Navigate to: **PosAPI систем** → **ПОС холболтын бүртгэл**
4. Register your POS device
5. Note down:
   - **POS Number** (Посын дугаар)
   - **Branch Number** (Салбарын дугаар) - usually "000"

#### Step 3: Get API Credentials

**Option A: Through Existing Provider (Easier)**
- Contact an authorized ХСН provider:
  - OdooTech LLC: info@odootech.mn
  - Other POS software companies
- They will provide Client ID & Secret

**Option B: Apply for Own Access (Takes longer)**
1. Go to **Хүсэлт** → **Хэрэглэгчийн систем нийлүүлэгчийн эрх авах**
2. Fill out the application
3. Wait for approval (2-4 weeks)
4. Receive credentials via email

#### Step 4: Get Your District Code

Your district code depends on your business location:

| Location | Code |
|----------|------|
| Баянзүрх | 3401-3428 |
| Сүхбаатар | 3501-3520 |
| Чингэлтэй | 3301-3319 |
| Хан-Уул | 3201-3216 |
| Баянгол | 3601-3623 |
| Сонгинохайрхан | 3101-3132 |

Full list: https://api.ebarimt.mn/api/info/check/getBranchInfo

#### Step 5: Enter Credentials in Kiosk Admin Panel

Log in to your Kiosk Admin Panel and go to **Settings → eBarimt**

Enter:
- Merchant TIN (ТТД): Your 11 or 14 digit tax ID
- POS Number: From Step 2
- Branch Number: Usually "000"
- District Code: From Step 4
- Client ID: From Step 3
- Client Secret: From Step 3

Click **"Test Connection"** to verify, then **"Save"**.

---

## 4. Database Schema

### Update Your Existing Schema

```sql
-- =====================================================
-- EBARIMT SETTINGS PER TENANT
-- =====================================================

-- Add eBarimt fields to payment_settings table
-- (Each tenant has their own eBarimt configuration)

ALTER TABLE payment_settings 
ADD COLUMN IF NOT EXISTS ebarimt_merchant_tin text,
ADD COLUMN IF NOT EXISTS ebarimt_pos_no text,
ADD COLUMN IF NOT EXISTS ebarimt_branch_no text DEFAULT '000',
ADD COLUMN IF NOT EXISTS ebarimt_district_code text,
ADD COLUMN IF NOT EXISTS ebarimt_client_id text,
ADD COLUMN IF NOT EXISTS ebarimt_client_secret text,
ADD COLUMN IF NOT EXISTS ebarimt_is_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS ebarimt_env text DEFAULT 'staging' CHECK (ebarimt_env IN ('staging', 'production'));

-- =====================================================
-- EBARIMT DATA ON ORDERS
-- =====================================================

-- Add eBarimt receipt data to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS ebarimt_id text,
ADD COLUMN IF NOT EXISTS ebarimt_lottery text,
ADD COLUMN IF NOT EXISTS ebarimt_qr_data text,
ADD COLUMN IF NOT EXISTS ebarimt_response jsonb,
ADD COLUMN IF NOT EXISTS ebarimt_error text,
ADD COLUMN IF NOT EXISTS ebarimt_created_at timestamptz;

-- Index for looking up orders by eBarimt ID
CREATE INDEX IF NOT EXISTS idx_orders_ebarimt_id ON orders(ebarimt_id);

-- =====================================================
-- PRODUCT CLASSIFICATION CODES
-- =====================================================

-- Add classification code for eBarimt reporting
-- Default: 5610101 = Restaurant food service
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS classification_code bigint DEFAULT 5610101;

-- Common codes for F&B:
-- 5610101 - Restaurants and mobile food service
-- 5610201 - Event catering
-- 5630001 - Beverage serving (bars, cafes)

-- =====================================================
-- RETRY QUEUE FOR FAILED RECEIPTS
-- =====================================================

CREATE TABLE IF NOT EXISTS ebarimt_retry_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
    tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
    request_payload jsonb NOT NULL,
    error_message text,
    retry_count int DEFAULT 0,
    max_retries int DEFAULT 5,
    next_retry_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index for finding orders to retry
CREATE INDEX IF NOT EXISTS idx_ebarimt_retry_pending 
ON ebarimt_retry_queue(next_retry_at) 
WHERE retry_count < max_retries;
```

---

## 5. Admin Panel - eBarimt Settings

### Settings Page Component

```tsx
// app/admin/settings/ebarimt/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Info } from 'lucide-react';

interface EbarimtSettings {
  ebarimt_merchant_tin: string;
  ebarimt_pos_no: string;
  ebarimt_branch_no: string;
  ebarimt_district_code: string;
  ebarimt_client_id: string;
  ebarimt_client_secret: string;
  ebarimt_is_active: boolean;
  ebarimt_env: 'staging' | 'production';
}

export default function EbarimtSettingsPage() {
  const [settings, setSettings] = useState<EbarimtSettings>({
    ebarimt_merchant_tin: '',
    ebarimt_pos_no: '',
    ebarimt_branch_no: '000',
    ebarimt_district_code: '',
    ebarimt_client_id: '',
    ebarimt_client_secret: '',
    ebarimt_is_active: false,
    ebarimt_env: 'staging',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  // Load existing settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/admin/settings/ebarimt');
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            setSettings(prev => ({ ...prev, ...data.settings }));
          }
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Test connection
  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/admin/settings/ebarimt/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      const result = await response.json();
      setTestResult({
        success: result.success,
        message: result.success 
          ? `Холболт амжилттай! Мерчант: ${result.merchantName}`
          : `Алдаа: ${result.error}`,
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Холболт шалгахад алдаа гарлаа',
      });
    } finally {
      setTesting(false);
    }
  };

  // Save settings
  const handleSave = async () => {
    setSaving(true);
    setSaveResult(null);
    
    try {
      const response = await fetch('/api/admin/settings/ebarimt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      const result = await response.json();
      setSaveResult({
        success: result.success,
        message: result.success 
          ? 'Тохиргоо амжилттай хадгалагдлаа!'
          : `Алдаа: ${result.error}`,
      });
    } catch (error) {
      setSaveResult({
        success: false,
        message: 'Хадгалахад алдаа гарлаа',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">eBarimt Тохиргоо</h1>
        <p className="text-muted-foreground mt-2">
          Цахим баримт үүсгэхийн тулд өөрийн компанийн eBarimt мэдээллийг оруулна уу.
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          eBarimt credential авахын тулд{' '}
          <a 
            href="https://e-invoice.ebarimt.mn" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            e-invoice.ebarimt.mn
          </a>
          {' '}сайтад бүртгүүлнэ үү. Тусламж: 1800-1288
        </AlertDescription>
      </Alert>

      {/* Main Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>API Тохиргоо</CardTitle>
          <CardDescription>
            Татварын албанаас авсан мэдээллүүдийг оруулна уу
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Environment Selection */}
          <div className="space-y-2">
            <Label>Орчин (Environment)</Label>
            <Select
              value={settings.ebarimt_env}
              onValueChange={(value: 'staging' | 'production') => 
                setSettings({ ...settings, ebarimt_env: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staging">🧪 Туршилт (Staging)</SelectItem>
                <SelectItem value="production">🚀 Бодит (Production)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Эхлээд "Туршилт" сонгож тест хийнэ үү
            </p>
          </div>

          {/* Merchant TIN */}
          <div className="space-y-2">
            <Label htmlFor="merchantTin">
              Татвар төлөгчийн дугаар (ТТД) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="merchantTin"
              value={settings.ebarimt_merchant_tin}
              onChange={(e) => setSettings({ ...settings, ebarimt_merchant_tin: e.target.value })}
              placeholder="11 эсвэл 14 оронтой тоо"
              maxLength={14}
            />
          </div>

          {/* POS Number */}
          <div className="space-y-2">
            <Label htmlFor="posNo">
              POS дугаар <span className="text-red-500">*</span>
            </Label>
            <Input
              id="posNo"
              value={settings.ebarimt_pos_no}
              onChange={(e) => setSettings({ ...settings, ebarimt_pos_no: e.target.value })}
              placeholder="Дотоод кассын дугаар"
            />
          </div>

          {/* Branch & District */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branchNo">Салбарын дугаар</Label>
              <Input
                id="branchNo"
                value={settings.ebarimt_branch_no}
                onChange={(e) => setSettings({ ...settings, ebarimt_branch_no: e.target.value })}
                placeholder="000"
                maxLength={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="districtCode">
                Дүүргийн код <span className="text-red-500">*</span>
              </Label>
              <Input
                id="districtCode"
                value={settings.ebarimt_district_code}
                onChange={(e) => setSettings({ ...settings, ebarimt_district_code: e.target.value })}
                placeholder="4 оронтой тоо"
                maxLength={4}
              />
            </div>
          </div>

          {/* Client Credentials */}
          <div className="space-y-2">
            <Label htmlFor="clientId">
              Client ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="clientId"
              value={settings.ebarimt_client_id}
              onChange={(e) => setSettings({ ...settings, ebarimt_client_id: e.target.value })}
              placeholder="API Client ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientSecret">
              Client Secret <span className="text-red-500">*</span>
            </Label>
            <Input
              id="clientSecret"
              type="password"
              value={settings.ebarimt_client_secret}
              onChange={(e) => setSettings({ ...settings, ebarimt_client_secret: e.target.value })}
              placeholder="API Client Secret"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>eBarimt идэвхжүүлэх</Label>
              <p className="text-sm text-muted-foreground">
                Идэвхжүүлсний дараа захиалга бүрт eBarimt үүсгэнэ
              </p>
            </div>
            <Switch
              checked={settings.ebarimt_is_active}
              onCheckedChange={(checked) => 
                setSettings({ ...settings, ebarimt_is_active: checked })
              }
            />
          </div>

          {/* Test Result */}
          {testResult && (
            <Alert variant={testResult.success ? 'default' : 'destructive'}>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}

          {/* Save Result */}
          {saveResult && (
            <Alert variant={saveResult.success ? 'default' : 'destructive'}>
              {saveResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{saveResult.message}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button 
              variant="outline" 
              onClick={handleTest}
              disabled={testing || !settings.ebarimt_merchant_tin}
            >
              {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Холболт шалгах
            </Button>
            <Button 
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Хадгалах
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Тусламж</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            <strong>ТТД:</strong> Татварын албанд бүртгэлтэй татвар төлөгчийн дугаар
          </p>
          <p>
            <strong>POS дугаар:</strong> e-invoice.ebarimt.mn → PosAPI систем → ПОС холболтын бүртгэл
          </p>
          <p>
            <strong>Дүүргийн код:</strong> Байршлын код (жишээ: Сүхбаатар = 3501)
          </p>
          <p>
            <strong>Client ID/Secret:</strong> API хандалтын мэдээлэл (ХСН-ээс авна)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

### API Routes for Settings

```typescript
// app/api/admin/settings/ebarimt/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';

// GET - Load eBarimt settings for current tenant
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();
    
    const { data: settings, error } = await supabase
      .from('payment_settings')
      .select(`
        ebarimt_merchant_tin,
        ebarimt_pos_no,
        ebarimt_branch_no,
        ebarimt_district_code,
        ebarimt_client_id,
        ebarimt_client_secret,
        ebarimt_is_active,
        ebarimt_env
      `)
      .eq('tenant_id', session.tenantId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ settings: settings || null });
  } catch (error) {
    console.error('Failed to load eBarimt settings:', error);
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

// POST - Save eBarimt settings
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const supabase = createClient();

    // Upsert payment settings
    const { error } = await supabase
      .from('payment_settings')
      .upsert({
        tenant_id: session.tenantId,
        ebarimt_merchant_tin: body.ebarimt_merchant_tin,
        ebarimt_pos_no: body.ebarimt_pos_no,
        ebarimt_branch_no: body.ebarimt_branch_no || '000',
        ebarimt_district_code: body.ebarimt_district_code,
        ebarimt_client_id: body.ebarimt_client_id,
        ebarimt_client_secret: body.ebarimt_client_secret,
        ebarimt_is_active: body.ebarimt_is_active,
        ebarimt_env: body.ebarimt_env || 'staging',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'tenant_id',
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save eBarimt settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
```

```typescript
// app/api/admin/settings/ebarimt/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EbarimtClient } from '@/lib/ebarimt/client';

export async function POST(req: NextRequest) {
  try {
    const settings = await req.json();

    // Create a temporary client with provided settings
    const client = new EbarimtClient({
      merchantTin: settings.ebarimt_merchant_tin,
      posNo: settings.ebarimt_pos_no,
      branchNo: settings.ebarimt_branch_no,
      districtCode: settings.ebarimt_district_code,
      clientId: settings.ebarimt_client_id,
      clientSecret: settings.ebarimt_client_secret,
      isProduction: settings.ebarimt_env === 'production',
    });

    // Test by fetching merchant info
    const merchantInfo = await client.getMerchantInfo();

    return NextResponse.json({
      success: true,
      merchantName: merchantInfo.name,
      merchantTin: merchantInfo.tin,
    });
  } catch (error: any) {
    console.error('eBarimt test failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Connection failed',
    });
  }
}
```

---

## 6. Backend Integration

### eBarimt Client (Multi-Tenant)

```typescript
// lib/ebarimt/client.ts

interface EbarimtConfig {
  merchantTin: string;
  posNo: string;
  branchNo: string;
  districtCode: string;
  clientId: string;
  clientSecret: string;
  isProduction: boolean;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  vatAmount: number;
  cityTaxAmount: number;
  classificationCode?: number;
}

interface CreateReceiptInput {
  items: ReceiptItem[];
  paymentMethod: string;
  totalAmount: number;
}

interface ReceiptResponse {
  id: string;
  lottery: string;
  qrData: string;
  totalAmount: number;
  totalVat: number;
  totalCityTax: number;
  createdAt: string;
}

export class EbarimtClient {
  private config: EbarimtConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  private readonly STAGING_AUTH_URL = 'https://st.auth.itc.gov.mn/auth/realms/Staging/protocol/openid-connect/token';
  private readonly PRODUCTION_AUTH_URL = 'https://auth.itc.gov.mn/auth/realms/Production/protocol/openid-connect/token';
  private readonly API_BASE_URL = 'https://api.ebarimt.mn';

  constructor(config: EbarimtConfig) {
    this.config = config;
  }

  private get authUrl(): string {
    return this.config.isProduction ? this.PRODUCTION_AUTH_URL : this.STAGING_AUTH_URL;
  }

  // Get access token (with caching)
  private async getToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch(this.authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
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

  // Get merchant info (for testing connection)
  async getMerchantInfo(): Promise<{ name: string; tin: string }> {
    const response = await fetch(
      `${this.API_BASE_URL}/api/info/check/getInfo?tin=${this.config.merchantTin}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error('Failed to get merchant info');
    }

    const data = await response.json();
    return {
      name: data.name,
      tin: data.tin,
    };
  }

  // Create eBarimt receipt
  async createReceipt(input: CreateReceiptInput): Promise<ReceiptResponse> {
    const token = await this.getToken();

    const VAT_RATE = 0.10;
    const CITY_TAX_RATE = 0.01;

    // Calculate totals
    let totalVat = 0;
    let totalCityTax = 0;

    const receiptItems = input.items.map(item => {
      const basePrice = item.totalAmount / (1 + VAT_RATE + CITY_TAX_RATE);
      const vatAmount = Math.round(basePrice * VAT_RATE * 100) / 100;
      const cityTaxAmount = Math.round(basePrice * CITY_TAX_RATE * 100) / 100;

      totalVat += vatAmount;
      totalCityTax += cityTaxAmount;

      return {
        name: item.name,
        barCodeType: 'UNDEFINED',
        classificationCode: item.classificationCode || 5610101,
        measureUnit: 'p',
        qty: item.quantity,
        unitPrice: item.unitPrice,
        totalAmount: item.totalAmount,
        totalVat: vatAmount,
        totalCityTax: cityTaxAmount,
      };
    });

    const receiptRequest = {
      totalAmount: input.totalAmount,
      totalVat: Math.round(totalVat * 100) / 100,
      totalCityTax: Math.round(totalCityTax * 100) / 100,
      branchNo: this.config.branchNo,
      districtCode: this.config.districtCode,
      merchantTin: this.config.merchantTin,
      posNo: this.config.posNo,
      type: 'B2C_RECEIPT',
      receipts: [{
        totalAmount: input.totalAmount,
        totalVat: Math.round(totalVat * 100) / 100,
        totalCityTax: Math.round(totalCityTax * 100) / 100,
        vatType: 'VAT_ABLE',
        merchantTin: this.config.merchantTin,
        items: receiptItems,
      }],
      payments: [{
        code: this.mapPaymentMethod(input.paymentMethod),
        status: 'PAID',
        paidAmount: input.totalAmount,
      }],
    };

    const response = await fetch(`${this.API_BASE_URL}/api/tpi/receipt/put`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(receiptRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create receipt');
    }

    const data = await response.json();

    return {
      id: data.id,
      lottery: data.lottery || '',
      qrData: data.qrData || data.id,
      totalAmount: data.totalAmount,
      totalVat: data.totalVat,
      totalCityTax: data.totalCityTax,
      createdAt: new Date().toISOString(),
    };
  }

  private mapPaymentMethod(method: string): string {
    const mapping: Record<string, string> = {
      'qpay': 'MOBILE',
      'cash': 'CASH',
      'card': 'CARD',
      'transfer': 'TRANSFER',
    };
    return mapping[method.toLowerCase()] || 'MOBILE';
  }
}

// Factory function to create client from tenant settings
export async function createEbarimtClientForTenant(tenantId: string): Promise<EbarimtClient | null> {
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = createClient();

  const { data: settings } = await supabase
    .from('payment_settings')
    .select('*')
    .eq('tenant_id', tenantId)
    .single();

  if (!settings || !settings.ebarimt_is_active) {
    return null;
  }

  return new EbarimtClient({
    merchantTin: settings.ebarimt_merchant_tin,
    posNo: settings.ebarimt_pos_no,
    branchNo: settings.ebarimt_branch_no || '000',
    districtCode: settings.ebarimt_district_code,
    clientId: settings.ebarimt_client_id,
    clientSecret: settings.ebarimt_client_secret,
    isProduction: settings.ebarimt_env === 'production',
  });
}
```

### Order Completion with eBarimt

```typescript
// app/api/orders/complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createEbarimtClientForTenant } from '@/lib/ebarimt/client';

export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentReference } = await req.json();
    const supabase = createClient();

    // 1. Get order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          quantity,
          base_price,
          total_price
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Try to create eBarimt receipt
    let ebarimtData = null;
    let ebarimtError = null;

    try {
      const ebarimtClient = await createEbarimtClientForTenant(order.tenant_id);

      if (ebarimtClient) {
        // Calculate total
        const totalAmount = order.order_items.reduce(
          (sum: number, item: any) => sum + item.total_price,
          0
        );

        // Create receipt
        const receipt = await ebarimtClient.createReceipt({
          items: order.order_items.map((item: any) => ({
            name: item.product_name,
            quantity: item.quantity,
            unitPrice: item.base_price,
            totalAmount: item.total_price,
            vatAmount: 0, // Calculated in client
            cityTaxAmount: 0, // Calculated in client
          })),
          paymentMethod: order.payment_method || 'qpay',
          totalAmount,
        });

        ebarimtData = receipt;
      }
    } catch (error: any) {
      console.error('eBarimt creation failed:', error);
      ebarimtError = error.message;

      // Add to retry queue
      await supabase.from('ebarimt_retry_queue').insert({
        order_id: orderId,
        tenant_id: order.tenant_id,
        request_payload: {
          items: order.order_items,
          payment_method: order.payment_method,
        },
        error_message: ebarimtError,
      });
    }

    // 3. Update order
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        is_paid: true,
        payment_reference: paymentReference,
        status: 'NEW',
        // eBarimt fields
        ebarimt_id: ebarimtData?.id || null,
        ebarimt_lottery: ebarimtData?.lottery || null,
        ebarimt_qr_data: ebarimtData?.qrData || null,
        ebarimt_response: ebarimtData || null,
        ebarimt_error: ebarimtError,
        ebarimt_created_at: ebarimtData ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) throw updateError;

    // 4. Return response
    return NextResponse.json({
      success: true,
      order: {
        id: orderId,
        orderNumber: order.order_number,
        status: 'NEW',
      },
      ebarimt: ebarimtData ? {
        receiptId: ebarimtData.id,
        lottery: ebarimtData.lottery,
        qrData: ebarimtData.qrData,
        totalAmount: ebarimtData.totalAmount,
        vatAmount: ebarimtData.totalVat,
      } : null,
      ebarimtError: ebarimtError,
    });

  } catch (error: any) {
    console.error('Order completion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete order' },
      { status: 500 }
    );
  }
}
```

---

## 7. Kiosk UI - Success Screen

```tsx
// components/kiosk/PaymentSuccess.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface EbarimtData {
  receiptId: string;
  lottery: string;
  qrData: string;
  totalAmount: number;
  vatAmount: number;
}

interface PaymentSuccessProps {
  orderNumber: number;
  ebarimt: EbarimtData | null;
  ebarimtError?: string | null;
}

export function PaymentSuccess({ orderNumber, ebarimt, ebarimtError }: PaymentSuccessProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(30);

  // Auto-redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/kiosk');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white p-8">
      
      {/* Success Icon */}
      <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
        <CheckCircle className="w-14 h-14 text-white" />
      </div>

      {/* Success Message */}
      <h1 className="text-4xl font-bold text-gray-800 mb-2">
        Захиалга амжилттай!
      </h1>
      <p className="text-6xl font-bold text-green-600 mb-8">
        #{orderNumber}
      </p>

      {/* eBarimt Receipt */}
      {ebarimt ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">
            Цахим баримт / eBarimt
          </h2>

          {/* QR Code */}
          <div className="flex justify-center mb-6 p-4 bg-white rounded-lg">
            <QRCodeSVG
              value={ebarimt.qrData}
              size={180}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Receipt Details */}
          <div className="space-y-3 text-sm border-t pt-4">
            <div className="flex justify-between">
              <span className="text-gray-500">ДДТД:</span>
              <span className="font-mono text-xs text-right max-w-[200px] break-all">
                {ebarimt.receiptId}
              </span>
            </div>

            {ebarimt.lottery && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Сугалааны дугаар:</span>
                <span className="font-bold text-lg text-green-600">
                  {ebarimt.lottery}
                </span>
              </div>
            )}

            <hr className="my-3" />

            <div className="flex justify-between text-base">
              <span className="text-gray-600">Нийт дүн:</span>
              <span className="font-bold text-lg">
                {ebarimt.totalAmount.toLocaleString()}₮
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">НӨАТ (10%):</span>
              <span>{ebarimt.vatAmount.toLocaleString()}₮</span>
            </div>
          </div>

          {/* Scan Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800 text-center">
              📱 QR кодыг <strong>ebarimt</strong> апп-аар уншуулж
              <br />сугалаанд бүртгүүлээрэй!
            </p>
          </div>
        </div>
      ) : ebarimtError ? (
        /* eBarimt Error */
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md w-full">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">
                Цахим баримт үүсгэхэд алдаа гарлаа
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Таны захиалга амжилттай хадгалагдсан.
                Цахим баримтыг дараа илгээх болно.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* eBarimt Not Configured */
        <div className="bg-gray-50 rounded-xl p-6 max-w-md w-full text-center">
          <p className="text-gray-500">
            Цахим баримт тохируулагдаагүй байна
          </p>
        </div>
      )}

      {/* Countdown */}
      <p className="mt-8 text-gray-400">
        {countdown} секундын дараа эхлэл рүү шилжинэ...
      </p>

      {/* Manual Return Button */}
      <button
        onClick={() => router.push('/kiosk')}
        className="mt-4 text-green-600 hover:text-green-700 font-medium"
      >
        Эхлэл рүү буцах →
      </button>
    </div>
  );
}
```

---

## 8. Testing

### Test in Staging First

1. **Set environment to "Туршилт" (Staging)** in Admin Panel

2. **Use test credentials:**
   - Test Merchant TIN: `37900846788`
   - Staging Auth URL: `https://st.auth.itc.gov.mn/`

3. **Create test orders** and verify:
   - eBarimt ID is generated
   - QR code displays correctly
   - Lottery number appears

4. **Check at staging portal:**
   - Go to: `https://stg-invoice.ebarimt.mn/`
   - Verify receipts appear in the system

### Switch to Production

1. Merchant changes environment to **"Бодит" (Production)**
2. Enter real production credentials
3. Test with small real transaction
4. Verify receipt on `https://e-invoice.ebarimt.mn/`

---

## 9. Merchant Onboarding Checklist

### Give this to merchants when they sign up:

```markdown
## eBarimt Тохиргооны Checklist

### Шаардлагатай мэдээлэл:

- [ ] Татвар төлөгчийн дугаар (ТТД) - 11 эсвэл 14 орон
- [ ] POS дугаар - e-invoice.ebarimt.mn-ээс авна
- [ ] Салбарын дугаар - ихэвчлэн "000"
- [ ] Дүүргийн код - байршлаас хамаарна
- [ ] Client ID - API хандалт
- [ ] Client Secret - API хандалт

### Алхамууд:

1. [ ] e-invoice.ebarimt.mn-д нэвтрэх
2. [ ] PosAPI систем → ПОС холболтын бүртгэл
3. [ ] POS бүртгүүлэх
4. [ ] API credential авах (ХСН-ээс)
5. [ ] Kiosk Admin Panel → eBarimt тохиргоо
6. [ ] Мэдээлэл оруулах
7. [ ] "Холболт шалгах" дарах
8. [ ] "Хадгалах" дарах
9. [ ] "Туршилт" орчинд тест хийх
10. [ ] "Бодит" орчинд шилжих

### Тусламж:
- Татварын лавлах: 1800-1288
- eBarimt вэб: https://ebarimt.mn
```

---

## Summary

| Component | Description |
|-----------|-------------|
| **Admin Panel** | Each merchant enters their own eBarimt credentials |
| **Database** | Store credentials per tenant in `payment_settings` |
| **Backend** | Use merchant's credentials to create receipts |
| **Kiosk UI** | Display QR code and lottery number on success |
| **Your Role** | Build the integration, not manage eBarimt |
| **Merchant's Role** | Get their own eBarimt access and credentials |

This approach keeps you (the platform developer) out of the tax/legal responsibility while giving merchants full control over their eBarimt setup.
