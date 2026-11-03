import { MoonIcon, SunIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/Button";
import { useTheme } from "@/lib/provider/theme-provider";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <Button
      aria-label="Toggle dark mode"
      icon={
        theme === "dark" ? (
          <MoonIcon className="size-4 xl:size-5" size={20} weight="bold" />
        ) : (
          <SunIcon className="size-4 xl:size-5" size={20} weight="bold" />
        )
      }
      onClick={toggleTheme}
      size="sm"
      variant="ghost"
    />
  );
}
