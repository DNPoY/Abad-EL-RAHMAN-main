import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function removeTashkil(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0670]/g, "") // Remove Tashkil
    .replace(/[أإآ]/g, "ا"); // Normalize Alef
}
