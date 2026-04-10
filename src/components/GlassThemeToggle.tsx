import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

const GlassThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-7 w-14 items-center rounded-full border border-border/30 overflow-hidden transition-colors duration-300"
      style={{
        background: isDark
          ? "linear-gradient(135deg, hsl(0 0% 12% / 0.9), hsl(0 0% 8% / 0.95))"
          : "linear-gradient(135deg, hsl(40 33% 96% / 0.8), hsl(40 20% 90% / 0.9))",
        boxShadow: isDark
          ? "inset 0 1px 3px hsl(0 0% 0% / 0.4)"
          : "inset 0 1px 3px hsl(0 0% 0% / 0.1)",
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        className="flex h-5 w-5 items-center justify-center rounded-full shadow-md"
        style={{
          background: isDark
            ? "linear-gradient(135deg, hsl(0 0% 30%), hsl(0 0% 20%))"
            : "linear-gradient(135deg, hsl(40 33% 98%), hsl(40 20% 92%))",
          marginLeft: 3,
          marginRight: 3,
        }}
        animate={{ x: isDark ? 28 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {isDark ? (
          <Moon size={11} className="text-accent" />
        ) : (
          <Sun size={11} className="text-primary" />
        )}
      </motion.div>
    </button>
  );
};

export default GlassThemeToggle;
