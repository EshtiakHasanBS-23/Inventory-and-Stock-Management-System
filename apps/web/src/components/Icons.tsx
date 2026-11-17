/**
 * Inline SVG icons (DESIGN.md: icons are inline SVG, never emoji). Each one
 * draws with currentColor and is hidden from screen readers; the text next to
 * it carries the meaning.
 */
import type { ReactNode } from "react";

function Svg({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export type IconName =
  | "dashboard"
  | "box"
  | "swap"
  | "clipboard"
  | "clock"
  | "chart"
  | "users"
  | "person"
  | "key"
  | "check"
  | "alert"
  | "x"
  | "chevron"
  | "in"
  | "out"
  | "download"
  | "upload"
  | "logo";

const PATHS: Record<IconName, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  box: (
    <>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="m3 8 9 5 9-5M12 13v8" />
    </>
  ),
  swap: <path d="M7 4v14m0 0-3-3m3 3 3-3M17 20V6m0 0-3 3m3-3 3 3" />,
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M9 13l2 2 4-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  chart: <path d="M4 20V10m6 10V4m6 16v-7m4 7H3" />,
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6" />
    </>
  ),
  person: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 9-9m-3 3 3 3m-6 0 2 2" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: (
    <>
      <path d="M12 3 2 20h20L12 3Z" />
      <path d="M12 10v4m0 3v.01" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  in: <path d="M12 4v13m0 0-5-5m5 5 5-5M5 20h14" />,
  out: <path d="M12 20V7m0 0-5 5m5-5 5 5M5 4h14" />,
  download: <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />,
  upload: <path d="M12 16V5m0 0-4 4m4-4 4 4M5 20h14" />,
  logo: (
    <>
      <path d="M4 9.5 12 5l8 4.5v9L12 23l-8-4.5v-9Z" />
      <path d="m4 9.5 8 4.5 8-4.5M12 14v9" />
    </>
  ),
};

export function Icon({ name, size }: { name: IconName; size?: number }) {
  return <Svg size={size}>{PATHS[name]}</Svg>;
}
