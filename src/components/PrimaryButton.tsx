import type { ButtonHTMLAttributes, ReactNode } from "react"

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  success?: boolean
  shortcut?: string
}

export default function PrimaryButton({
  children,
  className = "",
  success = false,
  shortcut,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      className={`min-h-11 rounded-full px-5 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#72a5c0] disabled:cursor-not-allowed disabled:opacity-60 ${
        success
          ? "bg-[#edf8ee] dark:bg-[#1a3821] text-[#2c6d33] dark:text-[#4ade80]"
          : "bg-[#2f556a] dark:bg-[#72a5c0] text-[#edf4f7] dark:text-[#0c1015] hover:bg-[#203946] dark:hover:bg-[#8cc2dd] disabled:hover:bg-[#2f556a] dark:disabled:hover:bg-[#72a5c0] shadow-[0_4px_16px_rgba(47,85,106,0.18)] dark:shadow-[0_4px_16px_rgba(114,165,192,0.25)]"
      } ${className}`}
      {...props}
    >
      <span className="inline-flex items-center gap-2">
        <span>{children}</span>
        {shortcut && (
          <kbd
            aria-hidden="true"
            className="hidden rounded bg-black/20 dark:bg-black/15 px-1.5 py-0.5 text-[0.68rem] font-normal tracking-wide text-white/90 dark:text-[#0c1015]/90 sm:inline-block"
          >
            {shortcut}
          </kbd>
        )}
      </span>
    </button>
  )
}
