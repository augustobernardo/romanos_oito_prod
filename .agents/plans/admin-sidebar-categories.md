# Admin Sidebar Categories

## Summary
Reorganize the admin sidebar from flat list to collapsible groups:
- Inscricoes: OIKOS + Pentecostes
- Cupons: Lote Especial + Servos Amigos  
- Geral: Eventos + Lotes

Dashboard remains standalone at the top.

## Implementation

**1 file modified: `src/components/AdminLayout.tsx`**

Replace flat `navItems` with grouped `navGroups` structure.
Each group tracks expand/collapse state, auto-opens when child route is active.
Collapsed sidebar (w-16) shows only group icons, no children or chevrons.
Mobile nav remains flat and unchanged.
