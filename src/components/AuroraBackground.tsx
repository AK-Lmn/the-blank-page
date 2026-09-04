import { useTheme } from "../lib/ThemeContext"

export default function AuroraBackground() {
  const { typingActive } = useTheme()

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none transition-colors duration-700"
    >
      {/* Base Canvas */}
      <div className="absolute inset-0 bg-[#f4f3f6] dark:bg-[#0c1015] transition-colors duration-700" />

      {/* Aurora Gradient Orbs Container */}
      <div
        className={`absolute inset-0 transition-all duration-700 ease-out ${
          typingActive ? "opacity-100 scale-[1.03]" : "opacity-80 scale-100"
        }`}
      >
        {/* Orb 1: Soft Mauve / Twilight Purple */}
        <div className="animate-aurora-1 absolute -top-[15%] left-[5%] h-[550px] w-[550px] rounded-full sm:h-[750px] sm:w-[750px] blur-[110px] sm:blur-[150px] transition-all duration-700 bg-[radial-gradient(circle,rgba(216,180,226,0.65)_0%,rgba(216,180,226,0)_70%)] dark:bg-[radial-gradient(circle,rgba(147,51,234,0.22)_0%,rgba(147,51,234,0)_70%)]" />

        {/* Orb 2: Dusty Rose / Sunset Amber */}
        <div className="animate-aurora-2 absolute top-[5%] -right-[10%] h-[500px] w-[500px] rounded-full sm:h-[700px] sm:w-[700px] blur-[120px] sm:blur-[160px] transition-all duration-700 bg-[radial-gradient(circle,rgba(242,207,216,0.55)_0%,rgba(242,207,216,0)_70%)] dark:bg-[radial-gradient(circle,rgba(236,72,153,0.18)_0%,rgba(236,72,153,0)_70%)]" />

        {/* Orb 3: Twilight Teal / Ice Cyan */}
        <div className="animate-aurora-3 absolute -bottom-[15%] left-[15%] h-[600px] w-[600px] rounded-full sm:h-[800px] sm:w-[800px] blur-[110px] sm:blur-[150px] transition-all duration-700 bg-[radial-gradient(circle,rgba(186,223,232,0.65)_0%,rgba(186,223,232,0)_70%)] dark:bg-[radial-gradient(circle,rgba(14,165,233,0.2)_0%,rgba(14,165,233,0)_70%)]" />

        {/* Orb 4: Ethereal Mist / Polar Night Violet */}
        <div className="animate-aurora-1 absolute bottom-[10%] -right-[12%] h-[480px] w-[480px] rounded-full sm:h-[650px] sm:w-[650px] blur-[130px] sm:blur-[170px] transition-all duration-700 bg-[radial-gradient(circle,rgba(237,223,232,0.5)_0%,rgba(237,223,232,0)_70%)] dark:bg-[radial-gradient(circle,rgba(99,102,241,0.16)_0%,rgba(99,102,241,0)_70%)]" />
      </div>

      {/* Subtle Film / Vignette Layer for Meditative Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.02)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
    </div>
  )
}
