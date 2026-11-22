"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

export type Theme = "light" | "dark";

// The theme lives on <html data-theme>, applied before paint by the inline
// script in app/layout.tsx. Reading it through useSyncExternalStore keeps the
// toggle in sync without a hydration mismatch or an extra render pass.
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribeToTheme, readTheme, () => "dark" as Theme);
}

export function setTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("bm-theme", theme);
  } catch {
    /* storage blocked — theme still applies for this session */
  }
}

export function toggleTheme() {
  setTheme(readTheme() === "light" ? "dark" : "light");
}

/**
 * Button that flips between the light and dark theme.
 * - `label` adds a "Switch to <mode> mode" caption next to the icon.
 */
export default function ThemeToggle({
  className,
  size = 17,
  label = false,
  style,
}: {
  className?: string;
  size?: number;
  label?: boolean;
  style?: React.CSSProperties;
}) {
  const theme = useTheme();
  const target = theme === "light" ? "dark" : "light";
  const Icon = theme === "light" ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${target} mode`}
      title={`Switch to ${target} mode`}
      className={className}
      style={style}
    >
      <Icon size={size} />
      {label ? <span>Switch to {target} mode</span> : null}
    </button>
  );
}
