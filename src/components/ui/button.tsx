import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#0A2540] text-white hover:bg-[#0A2540]/90 shadow-sm hover:shadow",
        destructive:
          "bg-red-100 border border-red-300 outline-1 outline-red-400 text-red-900 hover:bg-red-200 hover:text-gray-900 hover:outline-red-400 hover:border-red-400 transition-colors duration-300",
        outline:
          "border border-input bg-background hover:bg-[#635BFF]/5 hover:border-[#635BFF]/30",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/60 hover:border-border/40 shadow-sm hover:shadow",
        ghost: "hover:bg-[#635BFF]/5 hover:text-[#635BFF]",
        link: "text-[#635BFF] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
