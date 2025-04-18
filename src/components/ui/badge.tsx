import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#635BFF] text-white hover:bg-[#635BFF]/90 select-none shadow-sm",
        secondary:
          "border-transparent bg-[#F5F5F7] text-[#0A2540] hover:bg-[#ECECF0] select-none shadow-sm",
        destructive:
          "border-[#FCA5A5] bg-[#FEE4E2] text-[#D92D20] hover:bg-[#FEE4E2]/90 select-none border shadow-none",
        outline: "border border-[#E0E7EF] bg-white/80 text-[#0A2540] font-medium text-sm hover:bg-[#F5F7FA] hover:text-[#0A2540] shadow-none select-none transition-colors duration-300 ease-in-out",
        success: "border-[#34D399] bg-[#ECFDF3] text-[#027A48] hover:bg-[#ECFDF3]/90 select-none border shadow-none",
        warning: "border-[#FBBF24] bg-[#FFFAEB] text-[#B54708] hover:bg-[#FFFAEB]/90 select-none border shadow-none",
        info: "border-[#60A5FA] bg-[#EFF8FF] text-[#175CD3] hover:bg-[#EFF8FF]/90 select-none border shadow-none",
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
