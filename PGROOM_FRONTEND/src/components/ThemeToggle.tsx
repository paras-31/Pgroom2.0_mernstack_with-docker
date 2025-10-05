import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme as useNextTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by only rendering after component is mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Don't render anything until component is mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[hsl(var(--background))] transition-colors"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      ) : (
        <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );
};

export default ThemeToggle;
