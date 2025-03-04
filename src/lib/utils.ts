
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add the formatDate function
export function formatDate(date: string | Date): string {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  // Format: DD/MM/YYYY
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}
