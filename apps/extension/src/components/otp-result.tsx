import { useClipboard } from "@extension/hooks/use-clipboard";
import { Button } from "@ui/button";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

interface OtpResultProps {
  otp: string;
}

export function OtpResult({ otp }: OtpResultProps) {
  const { copyText } = useClipboard();

  return (
    <div className="mb-6 flex flex-col items-center gap-2">
      <h1 className="text-muted-foreground">Found code:</h1>
      <p className="font-mono text-4xl font-bold">{otp}</p>
      <Button
        onClick={() => {
          copyText(otp);
          toast.success("Copied code to clipboard!", {
            position: "top-center",
          });
        }}
        className="mt-2"
      >
        <CopyIcon /> Copy
      </Button>
    </div>
  );
}
