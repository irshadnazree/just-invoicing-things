import { Link, useLocation } from "@tanstack/react-router";
import { AppHeader } from "just-things-ui";

import ThemeToggle from "@/components/shared/theme-toggle";

const links = [
  { to: "/", label: "Dashboard" },
  { to: "/quotation", label: "Quotations" },
  { to: "/invoice", label: "Invoices" },
] as const;

export default function Navbar() {
  const location = useLocation();
  const isActive = (to: string) => {
    if (to === "/") {
      return location.pathname === "/";
    }
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <AppHeader
      actions={<ThemeToggle />}
      app="invoicing"
      badge="Saved in this browser only"
      className="app-header w-full print:hidden"
      homeRender={<Link to="/" />}
      nav={links.map(({ to, label }) => (
        <Link aria-current={isActive(to) ? "page" : undefined} key={to} to={to}>
          {label}
        </Link>
      ))}
    />
  );
}
