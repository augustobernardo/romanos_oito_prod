import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

const THEME_KEY = "theme";

const OikosLanding = () => {
  const [isDark, setIsDark] = useState(false);
  const userPreference = useRef(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (stored === "dark" || stored === "light") {
      const isDarkMode = stored === "dark";
      setIsDark(isDarkMode);
      document.documentElement.classList.toggle("dark", isDarkMode);
      userPreference.current = true;
    } else {
      setIsDark(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!userPreference.current) {
        const newDark = e.matches;
        setIsDark(newDark);
        document.documentElement.classList.toggle("dark", newDark);
      }
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem(THEME_KEY, newDark ? "dark" : "light");
    userPreference.current = true;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="absolute right-4 top-4 flex flex-col items-center gap-4 sm:right-6 sm:top-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full"
          aria-label="Alternar tema"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-primary" />
          ) : (
            <Moon className="h-5 w-5 text-primary" />
          )}
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link to="/">
            <Home className="mr-2 h-4 w-4" />
            Home
          </Link>
        </Button>
      </div>

      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
          Inscrições em Breve.
        </h1>
        <p className="mt-4 text-xl text-muted-foreground md:text-2xl">
          14 de março
        </p>
      </div>
    </div>
  );
};

export default OikosLanding;
