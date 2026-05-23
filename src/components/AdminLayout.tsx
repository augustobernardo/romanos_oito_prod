import { ReactNode, useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Ticket,
  Users,
  LogOut,
  LayoutDashboard,
  Moon,
  Sun,
  Tag,
  HeartHandshake,
  Flame,
  PanelLeftClose,
  PanelLeft,
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Inscrições",
    icon: Users,
    items: [
      { href: "/admin/inscricoes", label: "OIKOS", icon: Home },
      { href: "/admin/pentecostes", label: "Pentecostes", icon: Flame },
    ],
  },
  {
    label: "Cupons",
    icon: Tag,
    items: [
      { href: "/admin/cupons", label: "Lote Especial", icon: Tag },
      {
        href: "/admin/servos-amigos",
        label: "Servos Amigos",
        icon: HeartHandshake,
      },
    ],
  },
  {
    label: "Geral",
    icon: Settings,
    items: [
      { href: "/admin/eventos", label: "Eventos", icon: CalendarDays },
      { href: "/admin/lotes", label: "Lotes", icon: Ticket },
    ],
  },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true",
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [autoExpanded, setAutoExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isGroupActive = useCallback(
    (group: (typeof navGroups)[number]) =>
      group.items.some((item) => location.pathname === item.href),
    [location.pathname],
  );

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const group of navGroups) {
      if (isGroupActive(group)) {
        next[group.label] = true;
      }
    }
    setOpenGroups(next);
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const wasOpen = prev[label];
      const next: Record<string, boolean> = {};
      if (!wasOpen) {
        next[label] = true;
        if (collapsed) {
          setCollapsed(false);
          setAutoExpanded(true);
        }
      }
      return next;
    });
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    setOpenGroups({});
    setAutoExpanded(false);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const closeMenu = () => setMenuOpen(false);

  const MobileNav = () => (
    <nav className="flex-1 space-y-1 overflow-y-auto">
      <Link
        to="/admin"
        onClick={closeMenu}
        className={cn(
          "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors",
          location.pathname === "/admin"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted",
        )}
      >
        <LayoutDashboard className="h-5 w-5 shrink-0" />
        <span>Dashboard</span>
      </Link>

      {navGroups.map((group) => {
        const active = isGroupActive(group);
        const isOpen = openGroups[group.label] ?? false;

        return (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.label)}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <group.icon className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-left">{group.label}</span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
            </button>
            {isOpen && (
              <div className="ml-6 space-y-1">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={closeMenu}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition-colors",
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — Desktop */}
      <aside
        className={cn(
          "hidden h-screen flex-shrink-0 flex-col border-r border-border bg-card md:flex transition-[width] duration-300",
          collapsed ? "w-16" : "w-64",
        )}
      >
        <div
          className={cn(
            "border-b border-border p-4 flex items-center",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {!collapsed && (
            <div>
              <Link
                to="/"
                className="font-display text-lg font-semibold text-foreground"
              >
                Romanos Oito
              </Link>
              <p className="text-xs text-muted-foreground">Painel Admin</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className={cn("h-8 w-8", collapsed && "mx-auto")}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          <Link
            to="/admin"
            title={collapsed ? "Dashboard" : undefined}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              collapsed ? "justify-center" : "gap-3",
              location.pathname === "/admin"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Dashboard</span>}
          </Link>

          {navGroups.map((group) => {
            const active = isGroupActive(group);
            const isOpen = openGroups[group.label] ?? false;

            return (
              <div key={group.label} className="relative">
                <button
                  onClick={() => toggleGroup(group.label)}
                  className={cn(
                    "flex items-center rounded-md transition-colors",
                    collapsed
                      ? "justify-center py-1.5 w-full mx-auto"
                      : "w-full gap-3 px-3 py-2 text-sm font-medium",
                    active
                      ? collapsed
                        ? "text-primary"
                        : "text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <group.icon
                    className={cn(
                      "shrink-0",
                      collapsed ? "h-5 w-5" : "h-4 w-4",
                    )}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{group.label}</span>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      )}
                    </>
                  )}
                </button>
                {isOpen && !collapsed && (
                  <div className="ml-4 space-y-1 mt-1">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => {
                          if (autoExpanded) {
                            setCollapsed(true);
                            setAutoExpanded(false);
                            localStorage.setItem("sidebar-collapsed", "true");
                          }
                        }}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                          location.pathname === item.href
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <item.icon className="h-3.5 w-3.5 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          {!collapsed && (
            <p className="mb-2 truncate text-xs text-muted-foreground">
              {user?.email}
            </p>
          )}
          <div
            className={cn(
              "flex",
              collapsed ? "flex-col items-center gap-1" : "gap-1",
            )}
          >
            <Button
              variant="ghost"
              size="sm"
              className={collapsed ? "h-8 w-8 p-0" : "flex-1 justify-start"}
              onClick={handleSignOut}
              title="Sair"
            >
              <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
              {!collapsed && "Sair"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8"
              title="Alternar tema"
            >
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:hidden">
        {/* Mobile header */}
        <header className="border-b border-border bg-card p-3 flex items-center justify-between">
          <Link
            to="/"
            className="font-display text-lg font-semibold text-foreground"
          >
            Romanos Oito
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={toggleTheme}
              title="Alternar tema"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setMenuOpen((v) => !v)}
              title={menuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="flex flex-1 flex-col border-t border-border bg-card overflow-hidden">
            <MobileNav />
            <div className="border-t border-border p-4 space-y-3">
              {user?.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  closeMenu();
                  handleSignOut();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        )}

        {/* Main content (visible when drawer is closed) */}
        {!menuOpen && (
          <main className="min-h-0 min-w-0 flex-1 overflow-auto p-3">
            {children}
          </main>
        )}
      </div>

      {/* Desktop content */}
      <div className="hidden min-h-0 min-w-0 flex-1 flex-col md:flex">
        <main className="min-h-0 min-w-0 flex-1 overflow-auto p-3 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
