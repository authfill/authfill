import { Button } from "@ui/button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen w-screen flex-col items-center">
      <div className="my-auto flex w-[18rem] flex-col text-center">
        <h1 className="text-6xl font-extrabold tracking-tight">404</h1>
        <p className="mt-4 text-sm">
          The page you are looking for does not exist. Please check the URL and
          try again.
        </p>
        <div>
          <Button as="link" to="/" className="mt-8">
            Go back home
          </Button>
        </div>
      </div>
    </div>
  );
}
