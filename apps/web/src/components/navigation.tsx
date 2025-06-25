import { Link } from "@tanstack/react-router";
import { Button } from "@ui/button";
import { AuthFillLogo } from "@web/components/icons/authfill";
import { GithubIcon } from "@web/components/icons/github";
import { StoreButton } from "@web/components/store-button";
import { links } from "@web/conf/links";

export default function Navigation() {
  return (
    <header className="container flex w-full items-center justify-between p-4 sm:px-0">
      <Link to="/">
        <AuthFillLogo className="h-auto w-32" />
      </Link>
      <nav className="flex space-x-2">
        <Button
          as="link"
          to={links.GITHUB as any}
          target="_blank"
          variant="secondary"
          size="icon"
        >
          <GithubIcon />
        </Button>
        <StoreButton target="_blank" />
      </nav>
    </header>
  );
}
