// lib/utils.ts
// PURPOSE: Shared className helper used by every shadcn-style UI component.
// Merges Tailwind classes, with the right file winning when the same class
// appears twice (e.g. overridden variants).
// CONNECTED TO: Every file in components/ui/*.tsx imports `cn` from here.
//   Also imported by components that compose UI primitives inline.
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
