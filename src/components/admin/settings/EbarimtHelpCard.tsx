import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const EbarimtHelpCard = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Тусламж</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <strong>ТТД:</strong> Татварын албанд бүртгэлтэй татвар төлөгчийн
          дугаар
        </div>
        <div>
          <strong>POS дугаар:</strong> e-invoice.ebarimt.mn → PosAPI систем →
          ПОС холболтын бүртгэл
        </div>
        <div>
          <strong>Дүүргийн код:</strong> Байршлын код (жишээ: Сүхбаатар =
          3501)
        </div>
        <div>
          <strong>Client ID/Secret:</strong> API хандалтын мэдээлэл (ХСН-ээс
          авна)
        </div>
      </CardContent>
    </Card>
  );
};
