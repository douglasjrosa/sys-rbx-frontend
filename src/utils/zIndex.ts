/**
 * Centralized z-index values for consistent layering across the app.
 * Higher values render on top. Navbar layer must always be above page modals.
 */
export const Z_INDEX = {
  /** Page-level modals (chat, forms, etc.) - must stay below navbar */
  PAGE_MODAL: 100,
  /** Mobile navbar bar - always on top */
  MOBILE_NAVBAR_LAYER: 99999,
  /** Drawer/Modal overlay (backdrop) - below content */
  MOBILE_NAVBAR_OVERLAY: 999,
  /** Drawer/Modal content - above overlay */
  MOBILE_NAVBAR_CONTENT: 99999,
} as const;
