import { ConfirmEmailDelete } from "@extension/components/emails/confirm-delete";
import { useAccounts } from "@extension/hooks/use-accounts";
import { useDocumentTitle } from "@extension/hooks/use-document-title";
import { AccountConfig } from "@extension/utils/storage";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { CogIcon, MailIcon, PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/accounts/")({
  component: RouteComponent,
});

function RouteComponent() {
  useDocumentTitle("Email Accounts");

  const { accounts } = useAccounts();

  const [showDelete, setShowDelete] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountConfig>();

  return (
    <>
      <ConfirmEmailDelete
        open={showDelete}
        setOpen={() => setShowDelete(false)}
        selectedAccount={selectedAccount}
      />

      <Link to="/settings" className="absolute right-4 top-4">
        <Button size="icon" variant="ghost">
          <CogIcon className="size-5" />
        </Button>
      </Link>

      <div className="flex max-w-[90vw] flex-col items-center sm:max-w-xs">
        <h1 className="text-center text-4xl font-bold tracking-tight">
          Email Accounts
        </h1>
        <p className="text-muted-foreground mt-4 text-center text-sm">
          Here you can manage all email accounts you have connected to AuthFill
          and connect new accounts.
        </p>
        <Button as="link" to="/setup" size="lg" className="mt-8">
          <PlusIcon /> Add new Account
        </Button>
        {accounts?.length ? (
          <div className="mt-12 flex w-full flex-col gap-4">
            {accounts?.map((account) => (
              <div key={account.id} className="flex items-center gap-3">
                <div className="bg-foreground/5 border-foreground/20 flex size-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                  <MailIcon className="size-5" />
                </div>
                <div className="min-w-0 grow">
                  <h2 className="truncate text-base font-medium tracking-tight">
                    {account.email}
                  </h2>
                  <p className="text-muted-foreground -mt-0.5 text-sm">
                    {"host" in account.credentials
                      ? account.credentials.host
                      : ""}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedAccount(account);
                    setShowDelete(true);
                  }}
                  size="icon"
                  variant="secondary"
                  className="ml-auto"
                >
                  <TrashIcon />
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
