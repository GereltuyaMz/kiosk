import { EbarimtInfoAlert } from "./EbarimtInfoAlert";
import { EbarimtSettingsForm } from "./EbarimtSettingsForm";
import { EbarimtHelpCard } from "./EbarimtHelpCard";

export const EbarimtSettings = () => {
  return (
    <div className="space-y-6">
      <EbarimtInfoAlert />
      <EbarimtSettingsForm />
      <EbarimtHelpCard />
    </div>
  );
};
