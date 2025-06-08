import { Link } from "@tanstack/react-router";
import { Button } from "@ui/button";
import AuthFillLogo from "@web/components/icons/authfill";
import GithubIcon from "@web/components/icons/github";
import StoreButton from "@web/components/store-button";
import { links } from "@web/conf/links";

export default function Header() {
  return (
    <header className="mx-auto flex w-full items-center justify-between">
      <Link to="/">
        <AuthFillLogo className="h-5 w-auto" />
      </Link>
      <nav className="flex space-x-2">
        <Button
          as="link"
          to={links.GITHUB as any}
          target="_blank"
          variant="secondary"
        >
          <GithubIcon />
          GitHub
        </Button>
        <StoreButton target="_blank" />
      </nav>
    </header>
  );
}
