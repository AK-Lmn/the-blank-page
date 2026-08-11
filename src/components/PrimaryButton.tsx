import type { ButtonHTMLAttributes, ReactNode } from "react"

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  success?: boolean
}

export default function PrimaryButton({ children, className = "", success = false, ...props }: PrimaryButtonProps) {
  return <button className={`rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#72a5c0] ${success ? "bg-[#edf8ee] text-[#2c6d33]" : "bg-[#2f556a] text-[#edf4f7] hover:bg-[#203946]"} ${className}`} {...props}>{children}</button>
}
