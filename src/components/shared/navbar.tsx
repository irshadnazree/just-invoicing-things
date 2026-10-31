import { Link, useLocation } from "@tanstack/react-router";

import ThemeToggle from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const location = useLocation();
  const isActive = (to: string) => {
    if (to === "/") {
      return location.pathname === "/";
    }
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  return (
    <nav className="sticky top-0 z-10 mx-auto w-full max-w-400 bg-background/95 px-4 pt-4 backdrop-blur-sm md:px-8 lg:px-16 xl:px-25 xl:pt-6 print:hidden">
      <div className="item-start flex justify-between xl:items-center">
        <Link to="/">
          <span className="text-xl xl:text-2xl">Just Accounting Things</span>
        </Link>
        <ThemeToggle />
      </div>
      <div className="mt-2 flex gap-6 border-b border-text">
        <NavbarLink isActive={isActive("/")} to="/">
          Dashboard
        </NavbarLink>
        <NavbarLink isActive={isActive("/quotation")} to="/quotation">
          Quotations
        </NavbarLink>
        <NavbarLink isActive={isActive("/invoice")} to="/invoice">
          Invoices
        </NavbarLink>
      </div>
    </nav>
  );
}

function NavbarLink({
  children,
  to,
  isActive,
}: {
  children: React.ReactNode;
  to: string;
  isActive: boolean;
}) {
  return (
    <Link
      className={cn(
        "text-lg/9 underline-offset-11 transition-all duration-150 ease-in-out hover:text-primary hover:underline",
        isActive && "text-primary underline"
      )}
      to={to}
    >
      {children}
    </Link>
  );
}
