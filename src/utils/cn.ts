import clsx from "clsx";

export function cn(...inputs: Parameters<typeof clsx>) {
  return clsx(...inputs);
}




// later 

// class={cn(
//   "rounded-lg",
//   active && "bg-blue-600",
//   disabled && "opacity-50"
// )}