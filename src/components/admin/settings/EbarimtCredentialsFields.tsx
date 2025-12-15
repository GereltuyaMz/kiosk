import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/common";
import type { EbarimtSettingsInput } from "@/lib/admin/settings/schemas";

type EbarimtCredentialsFieldsProps = {
  register: UseFormRegister<EbarimtSettingsInput>;
  errors: FieldErrors<EbarimtSettingsInput>;
};

export const EbarimtCredentialsFields = ({
  register,
  errors,
}: EbarimtCredentialsFieldsProps) => {
  return (
    <>
      {/* Merchant TIN */}
      <FormField
        label="Татвар төлөгчийн дугаар (ТТД)"
        htmlFor="merchantTin"
        error={errors.ebarimt_merchant_tin?.message}
        hint="11 эсвэл 14 оронтой тоо"
      >
        <Input
          id="merchantTin"
          placeholder="37900846788"
          maxLength={14}
          {...register("ebarimt_merchant_tin")}
        />
      </FormField>

      {/* POS Number */}
      <FormField
        label="POS дугаар"
        htmlFor="posNo"
        error={errors.ebarimt_pos_no?.message}
        hint="Дотоод кассын дугаар"
      >
        <Input
          id="posNo"
          placeholder="POS-001"
          {...register("ebarimt_pos_no")}
        />
      </FormField>

      {/* Branch & District Code */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          label="Салбарын дугаар"
          htmlFor="branchNo"
          error={errors.ebarimt_branch_no?.message}
        >
          <Input
            id="branchNo"
            placeholder="000"
            maxLength={3}
            {...register("ebarimt_branch_no")}
          />
        </FormField>

        <FormField
          label="Дүүргийн код"
          htmlFor="districtCode"
          error={errors.ebarimt_district_code?.message}
          hint="4 оронтой тоо (жишээ: 3501)"
        >
          <Input
            id="districtCode"
            placeholder="3501"
            maxLength={4}
            {...register("ebarimt_district_code")}
          />
        </FormField>
      </div>

      {/* Client Credentials */}
      <FormField
        label="Client ID"
        htmlFor="clientId"
        error={errors.ebarimt_client_id?.message}
        hint="API хандалтын мэдээлэл"
      >
        <Input
          id="clientId"
          placeholder="your-client-id"
          {...register("ebarimt_client_id")}
        />
      </FormField>

      <FormField
        label="Client Secret"
        htmlFor="clientSecret"
        error={errors.ebarimt_client_secret?.message}
      >
        <Input
          id="clientSecret"
          type="password"
          placeholder="your-client-secret"
          {...register("ebarimt_client_secret")}
        />
      </FormField>
    </>
  );
};
