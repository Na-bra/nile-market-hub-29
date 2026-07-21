import { Link, useLocation, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Search,
  Menu,
  X,
  Heart,
  Plus,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Package,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [term, setTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  const doLogout = () => {
    logout();
    setUserOpen(false);
    navigate({ to: "/" });
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/browse", search: { search: term || undefined } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            N
          </span>
          <span className="hidden sm:inline">
            Nile <span className="text-primary">Market</span>
          </span>
        </Link>

        <form onSubmit={submitSearch} className="ml-auto hidden max-w-sm flex-1 md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-full border border-input bg-secondary/60 py-2 pl-9 pr-4 text-sm outline-none focus:border-ring focus:bg-background"
              aria-label="Search products"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link
                to="/favorites"
                aria-label="Favorites"
                className="hidden rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground sm:inline-flex"
              >
                <Heart className="h-5 w-5" />
              </Link>
              <Link
                to="/listings/new"
                className="hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 md:inline-flex"
              >
                <Plus className="h-4 w-4" />
                Sell
              </Link>
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserOpen((o) => !o)}
                  className="flex items-center gap-2 rounded-full border border-input py-1.5 pl-1.5 pr-3 text-sm hover:bg-accent"
                  aria-label="Account menu"
                  aria-expanded={userOpen}
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {(user?.fullName ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[100px] truncate sm:inline">
                    {user?.fullName?.split(" ")[0]}
                  </span>
                </button>
                {userOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
                    <div className="border-b border-border px-3 py-2.5">
                      <div className="truncate text-sm font-medium">{user?.fullName}</div>
                      <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
                    </div>
                    <MenuLink to="/profile" icon={<UserIcon className="h-4 w-4" />}>
                      Profile
                    </MenuLink>
                    <MenuLink to="/listings/mine" icon={<Package className="h-4 w-4" />}>
                      My listings
                    </MenuLink>
                    <MenuLink to="/favorites" icon={<Heart className="h-4 w-4" />}>
                      Favorites
                    </MenuLink>
                    <MenuLink to="/reports" icon={<FileText className="h-4 w-4" />}>
                      My reports
                    </MenuLink>
                    {isAdmin && (
                      <MenuLink to="/admin" icon={<ShieldCheck className="h-4 w-4" />}>
                        Admin panel
                      </MenuLink>
                    )}
                    <button
                      onClick={doLogout}
                      className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-destructive hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                search={{ redirect: location.pathname }}
                className="rounded-md px-3 py-1.5 text-sm hover:bg-accent"
              >
                Sign in
              </Link>
              <Link
                to="/auth/register"
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign up
              </Link>
            </>
          )}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <form onSubmit={submitSearch} className="mb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search products…"
                className="w-full rounded-full border border-input bg-secondary/60 py-2 pl-9 pr-4 text-sm"
              />
            </div>
          </form>
          <nav className="flex flex-col">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
            {isAuthenticated && (
              <Link to="/listings/new" className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                Sell an item
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function MenuLink({
  to,
  icon,
  children,
}: {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to as never}
      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
    >
      {icon}
      {children}
    </Link>
  );
}
