import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@ui/input-otp";
import { Loader } from "@ui/loader";
import { cn } from "@ui/utils/class";
import { AuthFillLogo } from "@web/components/icons/authfill";
import { CheckIcon, UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Tilt from "react-parallax-tilt";

const slotClassName =
  "bg-foreground/5 dark:bg-foreground/10 border-foreground/20 px-2 py-5 text-lg font-mono";

function generateOTP() {
  return new Array(6)
    .fill(null)
    .map((_) => Math.floor(Math.random() * 10))
    .join("");
}

export function Demo() {
  const [otp, setOTP] = useState(generateOTP());
  const [value, setValue] = useState("");
  const [popup, setPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    animate();
    const interval = setInterval(animate, 10000);
    return () => clearInterval(interval);
  }, []);

  async function animate() {
    const otp = generateOTP();

    setValue("");
    setPopup(false);
    setOTP(otp);
    setSuccess(false);
    setLoading(false);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setPopup(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setPopup(false);

    await new Promise((resolve) => setTimeout(resolve, 200));
    for (const char of otp.split("")) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setValue((value) => value + char);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    setSuccess(true);
  }

  return (
    <Tilt
      tiltReverse={true}
      transitionSpeed={1500}
      tiltMaxAngleY={3}
      tiltMaxAngleX={8}
      trackOnWindow={true}
    >
      <div className="bg-foreground/10 mt-26 mx-auto mb-24 flex aspect-square w-full max-w-[90vw] flex-col justify-between overflow-hidden rounded-3xl lg:container sm:aspect-video">
        <div className="bg-foreground/10 flex h-12 w-full items-center justify-between px-4">
          <div className="flex items-center gap-2 pl-1">
            <div className="size-3.5 rounded-full bg-red-500 dark:bg-red-400"></div>
            <div className="size-3.5 rounded-full bg-yellow-500 dark:bg-yellow-400"></div>
            <div className="size-3.5 rounded-full bg-green-500 dark:bg-green-400"></div>
          </div>
          <div className="bg-background/30 hidden h-7 items-center justify-center rounded-md px-12 py-1 sm:flex">
            <p className="text-foreground/50 text-xs">
              https://example.com/auth/verification
            </p>
          </div>
          <div>
            <button
              className={cn(
                "flex size-8 items-center justify-center rounded-md transition-all",
                popup && "bg-foreground/10",
              )}
            >
              <svg
                width="21"
                height="17"
                viewBox="0 0 21 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
              >
                <path
                  d="M6.5362 0.51189C7.21874 -0.170633 8.32531 -0.170627 9.00785 0.51189C9.69034 1.19441 9.69034 2.301 9.00785 2.98352L7.23759 4.75375L9.00781 6.52397C9.69034 7.20651 9.69034 8.31308 9.00781 8.99562C8.32527 9.67811 7.2187 9.67811 6.53617 8.99562L4.76594 7.22536L2.99576 8.99562C2.31323 9.67811 1.20665 9.67811 0.524129 8.99562C-0.158387 8.31308 -0.158392 7.20647 0.524129 6.52397L2.29432 4.75375L0.524094 2.98352C-0.158419 2.301 -0.158425 1.19441 0.524094 0.51189C1.20661 -0.170631 2.3132 -0.170626 2.99573 0.51189L4.76594 2.28211L6.5362 0.51189Z"
                  fill="currentColor"
                />
                <path
                  d="M19.0482 12.9584H1.74771C0.782476 12.9584 0 13.7409 0 14.7061V14.7106C0 15.6759 0.782476 16.4583 1.74771 16.4583H19.0482C20.0134 16.4583 20.7959 15.6759 20.7959 14.7106V14.7061C20.7959 13.7409 20.0134 12.9584 19.0482 12.9584Z"
                  fill="currentColor"
                />
                <path
                  d="M16.0387 9.52626C18.6661 9.52626 20.796 7.39637 20.796 4.76902C20.796 2.14167 18.6661 0.0117798 16.0387 0.0117798C13.4114 0.0117798 11.2815 2.14167 11.2815 4.76902C11.2815 7.39637 13.4114 9.52626 16.0387 9.52626Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="relative flex h-full w-full flex-col items-center justify-center">
          <div
            className={cn(
              "bg-background z-100 absolute left-4 right-4 top-4 origin-top-right rounded-xl p-6 transition-all duration-200 sm:left-auto",
              popup ? "scale-100 opacity-100" : "scale-70 opacity-0",
            )}
          >
            <div className="flex justify-between">
              <AuthFillLogo className="w-25 h-auto" />
              <div>
                <UsersIcon className="text-foreground/70 size-4.5" />
              </div>
            </div>
            <div className="mt-6 flex h-full flex-col items-center justify-center px-2 pb-2 pt-2 sm:mt-12 sm:px-8 sm:pb-4">
              <img
                src="/loading.gif"
                alt="loading"
                className="my-[-2rem] w-32"
              />
              <h1 className="mt-2 text-center text-2xl font-semibold sm:mt-4">
                Checking your emails...
              </h1>
            </div>
          </div>
          {success ? (
            <>
              <div className="bg-foreground/10 rounded-full p-4">
                <CheckIcon className="text-foreground/70 size-5" />
              </div>
              <p className="text-foreground/50 mt-6 text-center text-4xl font-medium leading-tight tracking-tight">
                Email verified!
              </p>
              <p className="text-foreground/50 mt-4 max-w-[15rem] text-center text-xs leading-relaxed">
                You have successfully verified your email. You can now close
                this window.
              </p>
            </>
          ) : (
            <>
              <p className="text-foreground/50 text-center text-4xl font-medium leading-tight tracking-tight">
                Please verify
                <br />
                your e-mail
              </p>
              <p className="text-foreground/50 mt-4 max-w-[15rem] text-center text-xs leading-relaxed">
                We’ve sent a verification code to your email inbox. Please check
                your spam folder.
              </p>
              <div className="mt-8">
                {loading ? (
                  <Loader className="opacity-70" />
                ) : (
                  <InputOTP maxLength={6} value={value} readOnly>
                    <InputOTPGroup>
                      {new Array(3).fill(null).map((_, idx) => (
                        <InputOTPSlot
                          key={idx}
                          index={idx}
                          className={slotClassName}
                        />
                      ))}
                    </InputOTPGroup>
                    <InputOTPSeparator className="[&>svg]:size-3" />
                    <InputOTPGroup>
                      {new Array(3).fill(null).map((_, idx) => (
                        <InputOTPSlot
                          key={idx}
                          index={idx + 3}
                          className={slotClassName}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Tilt>
  );
}
