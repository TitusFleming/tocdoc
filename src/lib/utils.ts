import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Client-side utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
