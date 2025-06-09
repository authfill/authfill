import { useBackground } from "@extension/hooks/use-background";
import { AccountConfig } from "@extension/utils/storage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ui/alert-dialog";
import { Button } from "@ui/button";

interface ConfirmEmailDeleteProps {
  open: boolean;
  setOpen: (to: boolean) => void;
  selectedAccount?: AccountConfig;
}

export function ConfirmEmailDelete({
  open,
  setOpen,
  selectedAccount,
}: ConfirmEmailDeleteProps) {
  const queryClient = useQueryClient();
  const { sendToBackground } = useBackground();

  const { mutate, isPending } = useMutation({
    mutationKey: ["accounts", "delete"],
    mutationFn: async () => {
      if (!selectedAccount) return;

      return await sendToBackground("accounts.delete", {
        accountId: selectedAccount.id,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });

      setOpen(false);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="sm:max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the email account with the email
            address {selectedAccount?.email}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={() => mutate()} loading={isPending}>
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
