import { Icon } from "@iconify/react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const prefersReducedMotion = useReducedMotion();

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "chip !bg-white/70 !px-3 !py-1.5 dark:!bg-slate-800/80",
        "shadow-card backdrop-blur",
        className,
      )}
      aria-label="Toggle light or dark theme"
    >
      <motion.span
        key={theme}
        initial={
          prefersReducedMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: -6, scale: 0.95 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: "easeOut" }}
        className="flex items-center gap-2"
      >
        <Icon
          icon={
            isLight
              ? "material-symbols:dark-mode-rounded"
              : "material-symbols:light-mode-rounded"
          }
          className="text-xl text-accent"
          aria-hidden="true"
        />
        <span className="text-sm font-medium uppercase tracking-wide text-slate-600 dark:text-slate-300">
          {isLight ? "Dark" : "Light"} mode
        </span>
      </motion.span>
    </button>
  );
}
