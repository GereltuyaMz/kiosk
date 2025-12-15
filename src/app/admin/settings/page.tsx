"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EbarimtSettings } from "@/components/admin/settings";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and application settings
        </p>
      </div>

      <Tabs defaultValue="ebarimt" className="w-full">
        <TabsList className="grid w-full grid-cols-1 lg:w-auto lg:grid-cols-4">
          <TabsTrigger value="ebarimt">eBarimt</TabsTrigger>
          <TabsTrigger value="branding" disabled>
            Branding
          </TabsTrigger>
          <TabsTrigger value="payment" disabled>
            Payment
          </TabsTrigger>
          <TabsTrigger value="general" disabled>
            General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ebarimt" className="mt-6">
          <EbarimtSettings />
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Branding settings will be available soon
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Payment settings will be available soon
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="general" className="mt-6">
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                General settings will be available soon
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
