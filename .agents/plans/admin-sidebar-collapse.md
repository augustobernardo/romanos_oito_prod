# Admin Sidebar Collapse Feature

## Summary
Add a collapsible sidebar to the admin layout at `/admin/*`. Users can toggle between expanded (w-64) and collapsed (w-16, icon-only) states. State persists to localStorage.

## Behavior
- **Default**: Expanded (w-64)
- **Toggle**: Click chevron button in sidebar header → collapse/expand
- **Transition**: `transition-[width] duration-300 ease-in-out`
- **Persistence**: Saved to localStorage key `sidebar-collapsed`
- **Mobile**: Unaffected (sidebar already hidden on mobile)
- **Desktop only**: `hidden` below `md:` breakpoint

## Implementation

**1 file modified: `src/components/AdminLayout.tsx`**

Changes:
- Add `collapsed` state with localStorage persistence
- Add `PanelLeftClose` / `PanelLeft` icon import
- Toggle button in brand header
- Sidebar width: `collapsed ? "w-16" : "w-64"` with transition
- Labels hidden when collapsed (`!collapsed && <span>{item.label}</span>`)
- Footer condensed when collapsed (email hidden)

## Visual

```
Expanded (w-64):         Collapsed (w-16):
┌──────────────┐         ┌──────┐
│ Romanos Oito │         │  R   │
│ Painel Admin │         │  ▶   │
├──────────────┤         ├──────┤
│ 📊 Dashboard │         │  📊  │
│ 📅 Eventos   │         │  📅  │
│ 🎫 Lotes     │         │  🎫  │
│ ...          │         │  ... │
├──────────────┤         ├──────┤
│ user@email   │         │  🚪  │
│ [Sair] [🌙]  │         │  🌙  │
└──────────────┘         └──────┘
```

## Unchanged
- Mobile layout
- All admin page components
- Route protection
- Theme toggle
