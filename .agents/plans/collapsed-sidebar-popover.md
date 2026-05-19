# Collapsed Sidebar Category Popover

## Summary
When the admin sidebar is collapsed (w-16), clicking a category icon opens a floating popover to the right showing the group's children, allowing navigation without expanding the full sidebar.

## Implementation

**1 file modified: `src/components/AdminLayout.tsx`**

- Replace collapsed group icons (plain `<div>`) with clickable buttons
- When clicked in collapsed state, children render as a `absolute`-positioned popover
- Popover has bg-card, border, shadow, rounded corners, positioned next to the sidebar
- Clicking a child item: navigate + close the group
- Active group auto-opens in collapsed mode too (so the group is accessible on route change)
