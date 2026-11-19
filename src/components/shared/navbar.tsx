import {
  AppHeader,
  AppHeaderBadge,
  ThemeToggle,
} from "@irshadnazree/just-things-ui";
import { Link, useLocation } from "@tanstack/react-router";

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
      actions={
        <>
          <AppHeaderBadge>Saved in this browser only</AppHeaderBadge>
          <ThemeToggle />
        </>
      }
      app="invoicing"
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
