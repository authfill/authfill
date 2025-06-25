import { Logo } from "@extension/components/logo";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div>
      <div className="flex min-h-screen w-screen flex-col items-center pb-10 pt-24 sm:pb-24">
        <Logo className="w-30 absolute left-1/2 top-8 -translate-x-1/2" />
        <div className="mt-auto"></div>
        {children}
        <div className="mb-auto"></div>
      </div>
    </div>
  );
}
