import { Link } from "@tanstack/react-router";

export default function Footer() {
  return (
    <div className="bg-foreground/5 w-screen">
      <footer className="container flex flex-col items-center justify-between gap-4 p-8 text-sm lg:flex-row">
        <p className="text-center">
          &copy; {new Date().getFullYear()} AuthFill. All rights reserved.
        </p>
        <nav className="flex gap-x-5">
          <Link to="/imprint">Imprint</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
