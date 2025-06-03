import { useBackground } from "@extension/hooks/use-background";
import { useClipboard } from "@extension/hooks/use-clipboard";
import { usePort } from "@extension/hooks/use-port";
import { usePortListener } from "@extension/hooks/use-port-listener";
import { Email } from "@extension/types/email";
import { Button } from "@ui/button";
import { motion } from "framer-motion";
import { CopyIcon, ExternalLinkIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import browser from "webextension-polyfill";

interface EmailListProps {
  setOtp: (otp: string | null) => void;
}

export function EmailList({ setOtp }: EmailListProps) {
  const { sendToPort } = usePort();
  const { copyText } = useClipboard();

  const [mounted] = useState(new Date());
  const [emails, setEmails] = useState<Email[]>([]);
  const { sendToBackground } = useBackground();

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    sendToPort("emails.load");
  }, [initialized]);

  usePortListener(
    "emails.update",
    (data) => {
      setEmails(data.emails);

      for (const email of data.emails) {
        if (new Date(email.date).getTime() < mounted.getTime() - 1000 * 60 * 5)
          continue;

        if (email.otp) {
          setOtp(email.otp);

          copyText(email.otp);

          sendToBackground("notification.show", {
            title: "Code copied to clipboard!",
            message: "We've succesfully copied the code to your clipboard.",
          });

          break;
        } else if (email.link) {
          window.open(email.link);
          break;
        }
      }
    },
    [mounted, setOtp],
  );

  if (!emails.length) return null;
  return (
    <motion.div
      initial={{ marginTop: 0 }}
      animate={{ marginTop: "0.5rem" }}
      className="flex w-full flex-col"
    >
      {emails.map((email, index) => (
        <motion.div
          animate={{
            opacity: [0, 0, 1],
            marginTop: ["0rem", "1rem", "1rem"],
            height: ["0rem", "2.25rem", "2.25rem"],
            x: ["30%", "30%", "0%"],
          }}
          transition={{
            ease: "linear",
            duration: 0.3,
            delay: index * 0.1,
          }}
          style={{
            // Fixes a bug where the animation
            // doesn't work on the first render
            opacity: 0,
          }}
          key={email.id}
          className="flex justify-between gap-4 overflow-hidden"
        >
          <button
            onClick={() =>
              window.open(
                `${browser.runtime.getURL(`index.html#/emails/${email.id}`)}`,
              )
            }
            className="flex min-w-0 max-w-full grow flex-col items-start text-left hover:cursor-pointer"
          >
            <p className="max-w-full truncate whitespace-nowrap text-sm">
              {email.subject}
            </p>
            <p className="text-muted-foreground text-xs">To: {email.to}</p>
          </button>
          {email.otp || email.link ? (
            <div className="flex-shrink-0">
              {email.otp ? (
                <Button
                  onClick={() => {
                    copyText(email.otp || "");
                    toast.success("Copied code to clipboard!", {
                      position: "top-center",
                    });
                  }}
                  size="icon"
                  variant="secondary"
                >
                  <CopyIcon />
                </Button>
              ) : email.link ? (
                <>
                  <Button
                    onClick={() => window.open(email.link)}
                    size="icon"
                    variant="secondary"
                  >
                    <ExternalLinkIcon />
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}
        </motion.div>
      ))}
    </motion.div>
  );
}
