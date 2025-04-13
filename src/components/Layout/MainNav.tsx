import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Package2 } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

const MainNav = () => {
  const location = useLocation();

  const navItems: NavItem[] = [
    { title: "Dashboard", href: "/" },
    { title: "Products", href: "/products" },
    { title: "Inventory", href: "/inventory" },
    { title: "Reports", href: "/reports" },
    { title: "Settings", href: "/settings" },
    { title: "Pre-Launch Review", href: "/pre-launch-review" },
    { title: "Testing Guide", href: "/testing-guide" },
  ];

  return (
    <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2">
          <Package2 className="h-6 w-6" />
          <h1 className="text-xl font-bold">Warehouse Box & Unit Management</h1>
        </div>
        <nav className="ml-auto flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === item.href
                  ? "text-primary font-semibold"
                  : "text-muted-foreground",
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default MainNav;
