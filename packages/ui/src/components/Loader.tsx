import { ScaleLoader } from "react-spinners";

type LoaderProps = {
  className?: string;
  size?: 1;
};

export function Loader({ className, size = 1 }: LoaderProps) {
  return (
    <ScaleLoader
      width={Math.round(size * 3)}
      height={Math.round(size * 14)}
      color="currentColor"
      className={className}
    />
  );
}
