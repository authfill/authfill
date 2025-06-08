import { Link } from "@tanstack/react-router";

export default function Footer() {
  return (
    <footer className="mx-auto flex w-full items-center justify-between py-4 text-sm">
      <p className="text-center text-gray-400">
        &copy; {new Date().getFullYear()} AuthFill. All rights reserved.
      </p>
      <nav className="flex gap-x-5 text-gray-400">
        <Link to="/imprint">Imprint</Link>
        <Link to="/privacy">Privacy</Link>
      </nav>
      <p className="text-gray-400">
        Made with <span className="text-red-500">❤️</span> by{" "}
        <a
          href="https://x.com/soeckly"
          target="_blank"
          rel="noopener noreferrer"
        >
          Simon
        </a>{" "}
        and{" "}
        <a
          href="https://x.com/pauxels"
          target="_blank"
          rel="noopener noreferrer"
        >
          Paul
        </a>
      </p>
    </footer>
  );
}
