import { Moon, Sun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/#quem-somos", label: "Quem Somos" },
  // { href: "/eventos", label: "Eventos" }, -> Temporarily removed
];

const Header = () => {
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const location = useLocation();
  const userPreference = useRef(false);
  const THEME_KEY = "theme";

  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    href: string
  ) => {
    if (!href.includes("#")) return;
    const [path, hash] = href.split("#");
    const id = hash;

    // If we're already on the target path, prevent navigation and smooth-scroll
    if (location.pathname === path || (path === "" && location.pathname === "/") || (path === "/" && location.pathname === "/")) {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.replaceState(null, "", `/#${id}`);
        setActiveHref(href);
      }
      setIsMobileMenuOpen(false);
    }
  };

  // Track which anchor section is visible to set active nav link
  useEffect(() => {
    const idToHref: Record<string, string> = {};
    const anchorLinks = navLinks.filter((l) => l.href.includes("#"));
    anchorLinks.forEach((l) => {
      const [, hash] = l.href.split("#");
      if (hash) idToHref[hash] = l.href;
    });

    const observedEls = Object.keys(idToHref)
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (observedEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (!best) best = entry;
          else if (entry.intersectionRatio > (best.intersectionRatio || 0)) best = entry;
        }

        if (best && best.isIntersecting) {
          const id = best.target.id;
          const href = idToHref[id];
          if (href) setActiveHref(href);
        } else {
          // if no anchor visible, fallback to home when on root
          if (location.pathname === "/") setActiveHref("/");
        }
      },
      { root: null, rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    observedEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (stored === "dark" || stored === "light") {
      const isDarkMode = stored === "dark";
      setIsDark(isDarkMode);
      document.documentElement.classList.toggle("dark", isDarkMode);
      userPreference.current = true;
    } else {
      setIsDark(prefersDark);
      document.documentElement.classList.toggle("dark", prefersDark);
    }

    // Listen to system theme changes and apply only if user hasn't chosen a preference
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!userPreference.current) {
        const newDark = e.matches;
        setIsDark(newDark);
        document.documentElement.classList.toggle("dark", newDark);
      }
    };

    if (mq.addEventListener) mq.addEventListener("change", handleChange);
    else mq.addListener(handleChange);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handleChange);
      else mq.removeListener(handleChange);
    };
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem(THEME_KEY, newDark ? "dark" : "light");
    userPreference.current = true;
  };

  const isActive = (href: string) => {
    if (activeHref) return activeHref === href;
    if (href === "/") return location.pathname === "/";
    return location.pathname === href || location.hash === href.replace("/", "");
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          {/* <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <span className="font-display text-lg font-bold text-primary-foreground">R8</span>
          </div> */}
          <span className="font-display text-xl font-semibold text-foreground">
            Romanos Oito
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={(e) => handleAnchorClick(e, link.href)}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(link.href) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg--primary-foreground"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-primary" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
            <span className="sr-only">Alternar tema</span>
          </Button>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/50 bg-background md:hidden"
          >
            <nav className="container mx-auto flex flex-col gap-2 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={(e) => {
                    handleAnchorClick(e, link.href);
                    // if not an anchor on the same page, still close the mobile menu
                    if (!link.href.includes("#")) setIsMobileMenuOpen(false);
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary ${
                    isActive(link.href) ? "bg-secondary text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;
