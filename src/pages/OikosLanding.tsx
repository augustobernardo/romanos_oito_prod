import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Home, Calendar } from "lucide-react";

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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 selection:bg-primary/30">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-secondary/10 blur-[120px]" />

      {/* Top Right Controls */}
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full shadow-sm backdrop-blur-sm"
          aria-label="Alternar tema"
        >
          {isDark ? (
            <Sun className="h-5 w-5 text-foreground" />
          ) : (
            <Moon className="h-5 w-5 text-foreground" />
          )}
        </Button>
      </div>

      <div className="z-10 flex max-w-xl flex-col items-center text-center">
        {/* SVG Illustration */}
        <div className="mb-10 flex items-center justify-center text-primary drop-shadow-md transition-transform duration-700 hover:scale-105">
          <svg
            width="140"
            height="140"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-90"
          >
            <path
              d="M12 2L3 9V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V9L12 2Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 22V12H15V22"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="7" r="1.5" fill="currentColor" />
          </svg>
        </div>

        <span className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
          <Calendar className="mr-2 h-4 w-4" />
          Save the Date
        </span>

        <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl mb-6">
          Inscrições em Breve
        </h1>
        
        <p className="text-lg leading-relaxed text-muted-foreground sm:text-xl mb-8">
          Prepare-se para viver momentos inesquecíveis no próximo retiro Oikos. 
          Nossas vagas são limitadas, então anote na sua agenda: as inscrições abrirão oficialmente no dia <strong className="font-semibold text-foreground">14 de março</strong>.
        </p>

        <Button 
          variant="outline" 
          size="lg" 
          className="rounded-full shadow-sm backdrop-blur-sm px-8" 
          asChild
        >
          <Link to="/" className="inline-flex items-center gap-2">
            <Home className="h-5 w-5" />
            Voltar para Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default OikosLanding;
