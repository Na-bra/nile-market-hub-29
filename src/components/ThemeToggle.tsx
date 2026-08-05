import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolved, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <button
      onClick={toggle}
      className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
      aria-label={`Switch to ${mounted && resolved === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${mounted && resolved === "dark" ? "light" : "dark"} mode`}
      type="button"
    >
      {mounted && resolved === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}
