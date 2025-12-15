"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EbarimtCredentialsFields } from "./EbarimtCredentialsFields";
import { EbarimtFormActions } from "./EbarimtFormActions";
import {
  ebarimtSettingsSchema,
  type EbarimtSettingsInput,
} from "@/lib/admin/settings/schemas";

type TestResult = {
  success: boolean;
  message: string;
} | null;

export const EbarimtSettingsForm = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EbarimtSettingsInput>({
    resolver: zodResolver(ebarimtSettingsSchema),
    defaultValues: {
      ebarimt_merchant_tin: "",
      ebarimt_pos_no: "",
      ebarimt_branch_no: "000",
      ebarimt_district_code: "",
      ebarimt_client_id: "",
      ebarimt_client_secret: "",
      ebarimt_is_active: false,
      ebarimt_env: "staging",
    },
  });

  const isActive = watch("ebarimt_is_active");
  const environment = watch("ebarimt_env");

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings/ebarimt");
        if (response.ok) {
          const data = await response.json();
          if (data.settings) {
            reset({
              ebarimt_merchant_tin: data.settings.ebarimt_merchant_tin || "",
              ebarimt_pos_no: data.settings.ebarimt_pos_no || "",
              ebarimt_branch_no: data.settings.ebarimt_branch_no || "000",
              ebarimt_district_code: data.settings.ebarimt_district_code || "",
              ebarimt_client_id: data.settings.ebarimt_client_id || "",
              ebarimt_client_secret: data.settings.ebarimt_client_secret || "",
              ebarimt_is_active: data.settings.ebarimt_is_active || false,
              ebarimt_env: data.settings.ebarimt_env || "staging",
            });
          }
        }
      } catch (error) {
        console.error("Failed to load eBarimt settings:", error);
        toast.error("Тохиргоо татахад алдаа гарлаа");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [reset]);

  const onTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const formData = watch();
      const response = await fetch("/api/admin/settings/ebarimt/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setTestResult({
          success: true,
          message: `Холболт амжилттай! Мерчант: ${result.merchantName}`,
        });
      } else {
        setTestResult({
          success: false,
          message: `Алдаа: ${result.error}`,
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Холболт шалгахад алдаа гарлаа",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (data: EbarimtSettingsInput) => {
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/settings/ebarimt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Тохиргоо амжилттай хадгалагдлаа!");
      } else {
        toast.error(`Алдаа: ${result.error}`);
      }
    } catch (error) {
      toast.error("Хадгалахад алдаа гарлаа");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Татаж байна...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>eBarimt API Тохиргоо</CardTitle>
        <CardDescription>
          Татварын албанаас авсан мэдээллүүдийг оруулна уу
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Environment Selection */}
          <div className="space-y-2">
            <Label htmlFor="environment">Орчин (Environment)</Label>
            <Select
              value={environment}
              onValueChange={(value: "staging" | "production") =>
                setValue("ebarimt_env", value)
              }
            >
              <SelectTrigger id="environment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staging">🧪 Туршилт (Staging)</SelectItem>
                <SelectItem value="production">
                  🚀 Бодит (Production)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Эхлээд &quot;Туршилт&quot; сонгож тест хийнэ үү
            </p>
          </div>

          {/* Credentials Fields */}
          <EbarimtCredentialsFields register={register} errors={errors} />

          {/* Active Toggle */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">eBarimt идэвхжүүлэх</Label>
              <p className="text-sm text-muted-foreground">
                Идэвхжүүлсний дараа захиалга бүрт eBarimt үүсгэнэ
              </p>
            </div>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue("ebarimt_is_active", checked)
              }
            />
          </div>

          {/* Test Result & Actions */}
          <EbarimtFormActions
            testResult={testResult}
            isTesting={isTesting}
            isSaving={isSaving}
            hasMerchantTin={!!watch("ebarimt_merchant_tin")}
            onTestConnection={onTestConnection}
          />
        </form>
      </CardContent>
    </Card>
  );
};
