import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#635BFF] text-white hover:bg-[#635BFF]/90",
        secondary:
          "border-transparent bg-[#F5F5F7] text-[#0A2540] hover:bg-[#ECECF0]",
        destructive:
          "border-transparent bg-[#FEE4E2] text-[#D92D20] hover:bg-[#FEE4E2]/90",
        outline: "border-[#E4E4E7] text-[#0A2540] bg-white hover:bg-[#F5F5F7] hover:text-[#0A2540]",
        success: "border-transparent bg-[#ECFDF3] text-[#027A48] hover:bg-[#ECFDF3]/90",
        warning: "border-transparent bg-[#FFFAEB] text-[#B54708] hover:bg-[#FFFAEB]/90",
        info: "border-transparent bg-[#EFF8FF] text-[#175CD3] hover:bg-[#EFF8FF]/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
