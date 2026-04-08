import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

const GlassThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-8 w-16 items-center rounded-full border border-border/50 bg-background/40 backdrop-blur-xl shadow-inner transition-colors duration-300"
      style={{
        background: isDark
          ? "linear-gradient(135deg, hsl(0 0% 15% / 0.6), hsl(0 0% 10% / 0.8))"
          : "linear-gradient(135deg, hsl(40 33% 96% / 0.6), hsl(40 20% 90% / 0.8))",
        boxShadow: isDark
          ? "inset 0 1px 2px hsl(0 0% 0% / 0.3), 0 1px 2px hsl(0 0% 100% / 0.05)"
          : "inset 0 1px 2px hsl(0 0% 100% / 0.5), 0 1px 3px hsl(0 0% 0% / 0.08)",
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        className="absolute flex h-6 w-6 items-center justify-center rounded-full shadow-md"
        style={{
          background: isDark
            ? "linear-gradient(135deg, hsl(0 0% 25%), hsl(0 0% 18%))"
            : "linear-gradient(135deg, hsl(40 33% 98%), hsl(40 20% 92%))",
        }}
        animate={{ x: isDark ? 33 : 3 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon size={13} className="text-accent" />
        ) : (
          <Sun size={13} className="text-primary" />
        )}
      </motion.div>
    </button>
  );
};

export default GlassThemeToggle;
