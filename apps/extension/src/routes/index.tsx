import { AccountsEmpty } from "@extension/components/accounts-empty";
import { EmailList } from "@extension/components/emails/list";
import { OtpResult } from "@extension/components/otp-result";
import { PopupLoader } from "@extension/components/popup-loader";
import { PopupNavigation } from "@extension/components/popup-navigation";
import { useAccounts } from "@extension/hooks/use-accounts";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const initialized = useRef(false);

  const { accounts, isLoading } = useAccounts();

  const [otp, setOtp] = useState<string | null>(null);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
  }, [initialized]);

  return (
    <div className="w-100 flex flex-col p-7 pt-5">
      <PopupNavigation />
      <div className="mt-6 flex flex-col items-center">
        {otp ? (
          <OtpResult otp={otp} />
        ) : !isLoading && !accounts?.length ? (
          <AccountsEmpty />
        ) : (
          <PopupLoader />
        )}
      </div>
      <EmailList setOtp={setOtp} />
    </div>
  );
}
