import { Button } from "@ui/button";
import { GithubIcon } from "@web/components/icons/github";
import { StoreButton } from "@web/components/store-button";
import { links } from "@web/conf/links";

export default function Hero() {
  return (
    <section className="mt-10 flex flex-col items-center sm:mt-20">
      <h1 className="leading-17 max-w-[80vw] text-center text-5xl font-bold leading-tight tracking-tight sm:max-w-[40rem] sm:text-6xl">
        Verify your email <br className="hidden sm:block" />
        with{" "}
        <span className="relative whitespace-nowrap">
          <span className="hidden sm:inline">only</span> one click.
          <div className="bg-foreground/10 dark:bg-foreground/15 shadow-foreground absolute -inset-x-1.5 inset-y-2 hidden rounded-lg sm:block"></div>
        </span>
      </h1>
      <p className="text-muted-foreground mt-6 max-w-[80vw] text-center sm:max-w-lg">
        AuthFill is your one-click solution for verifying email addresses across
        the web. Say goodbye to searching your inbox for codes or links.
      </p>
      <div className="mt-10 flex items-center gap-3">
        <Button
          as="link"
          to={links.GITHUB as any}
          target="_blank"
          variant="secondary"
          size="icon-xl"
        >
          <GithubIcon className="size-5" />
        </Button>
        <StoreButton size="xl" target="_blank" />
      </div>
    </section>
  );
}
