import type { ReactNode, SVGProps } from "react";

// Small outline icons for the homepage shell (24x24 grid, drawn at 20px by
// default). Inline so there's no icon-font request, and they inherit
// currentColor so the active/hover colours just work.
function Icon({ children, size = 20, ...rest }: SVGProps<SVGSVGElement> & { size?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

type P = { size?: number };

export const HomeIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
  </Icon>
);
export const EatIcon = (p: P) => (
  <Icon {...p}>
    <path d="M7 3v8a2 2 0 0 0 2 2v8" />
    <path d="M5 3v6M9 3v6" />
    <path d="M17 21V3c-2.5 1.5-3.5 4.5-3.5 8H17" />
  </Icon>
);
export const StayIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3 19V6" />
    <path d="M3 15h18v4" />
    <path d="M21 15v-2.5A2.5 2.5 0 0 0 18.5 10H11v5" />
    <circle cx="7" cy="11.5" r="1.8" />
  </Icon>
);
export const ThingsIcon = (p: P) => (
  <Icon {...p}>
    <path d="m3 20 6.5-11 4 6.5L16 12l5 8z" />
    <circle cx="17.5" cy="6" r="1.8" />
  </Icon>
);
export const ShopsIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 8h16l-1 12H5z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </Icon>
);
export const TradesIcon = (p: P) => (
  <Icon {...p}>
    <path d="M14.5 6.5a4 4 0 0 0-5 5L3.5 17.5a1.8 1.8 0 0 0 2.5 2.5l6-6a4 4 0 0 0 5-5l-2.5 2.5-2-.5-.5-2z" />
  </Icon>
);
export const TownsIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 21s7-6 7-11.5A7 7 0 0 0 5 9.5C5 15 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Icon>
);
export const CalendarIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Icon>
);
export const JournalIcon = (p: P) => (
  <Icon {...p}>
    <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z" />
    <path d="M9 8.5h6M9 12h6" />
  </Icon>
);
export const MegaphoneIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3 11v3a1 1 0 0 0 1 1h3l8 4V6L7 10H4a1 1 0 0 0-1 1z" />
    <path d="M19 9.5a4 4 0 0 1 0 5" />
    <path d="M7 15l1.5 5" />
  </Icon>
);
export const SearchIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Icon>
);
export const PlusIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const MenuIcon = (p: P) => (
  <Icon {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);
export const CloseIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);
export const ChevronRightIcon = (p: P) => (
  <Icon {...p}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);
export const ArrowRightIcon = (p: P) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const ArticleIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6 4h12v16H6z" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </Icon>
);
export const UpvoteIcon = (p: P) => (
  <svg
    width={p.size ?? 12}
    height={p.size ?? 12}
    viewBox="0 0 12 12"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M6 1.5 11 10H1z" />
  </svg>
);
