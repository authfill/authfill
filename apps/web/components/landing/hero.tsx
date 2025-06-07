import { Button } from "@ui/button";
import GithubIcon from "@web/components/icons/github";
import StoreButton from "@web/components/store-button";
import { links } from "@web/conf/links";

export default function Hero() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="leading-17 max-w-lg text-center text-6xl font-bold tracking-tight">
        Verify your email, with{" "}
        <span className="relative whitespace-nowrap">
          one click.
          <div className="bg-foreground/18 shadow-foreground absolute -inset-x-1.5 inset-y-2 rounded-lg"></div>
        </span>
      </h1>
      <div className="my-15 flex items-center gap-5">
        <Button
          as="link"
          to={links.GITHUB as any}
          target="_blank"
          variant="secondary"
          size="xl"
        >
          <GithubIcon />
        </Button>
        <StoreButton size="xl" target="_blank" />
      </div>
    </div>
  );
}
