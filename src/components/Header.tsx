import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const doLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          Nile <span className="text-primary">Market</span>
        </Link>
        <nav className="hidden gap-4 text-sm md:flex">
          <Link to="/browse" activeProps={{ className: "text-foreground font-medium" }} className="text-muted-foreground hover:text-foreground">
            Browse
          </Link>
          <Link to="/categories" activeProps={{ className: "text-foreground font-medium" }} className="text-muted-foreground hover:text-foreground">
            Categories
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/favorites" activeProps={{ className: "text-foreground font-medium" }} className="text-muted-foreground hover:text-foreground">
                Favorites
              </Link>
              <Link to="/listings/mine" activeProps={{ className: "text-foreground font-medium" }} className="text-muted-foreground hover:text-foreground">
                My listings
              </Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin/listings" activeProps={{ className: "text-foreground font-medium" }} className="text-muted-foreground hover:text-foreground">
              Admin
            </Link>
          )}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated && (
            <Link
              to="/listings/new"
              className="hidden rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 md:inline-flex"
            >
              Sell an item
            </Link>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user?.fullName}
              </span>
              <button
                onClick={doLogout}
                className="rounded-md border border-input px-3 py-1.5 text-sm hover:bg-accent"
              >
                Sign out
              </button>
            </div>
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
                className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
