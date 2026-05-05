import { useColorScheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export function ThemeToggle() {
  const { mode, setMode, systemMode } = useColorScheme();
  if (!mode) {
    return null;
  }

  if (mode === "light") {
    return (
      <IconButton aria-label="dark mode" onClick={() => setMode("dark")}>
        <DarkModeIcon />
      </IconButton>
    );
  }

  if (mode === "dark" || systemMode === "dark") {
    return (
      <IconButton aria-label="light mode" onClick={() => setMode("light")}>
        <LightModeIcon />
      </IconButton>
    );
  }
}
