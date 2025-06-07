import { Button } from "@ui/button";
import GithubIcon from "@web/components/icons/github";
import StoreButton from "@web/components/store-button";
import { links } from "@web/conf/links";

export default function Header() {
  return (
    <header className="mx-auto flex w-full items-center justify-between">
      <h1 className="text-2xl font-bold">AuthFill</h1>
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
