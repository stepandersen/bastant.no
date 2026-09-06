const root = document.documentElement;
const button = document.querySelector("[data-theme-toggle]");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

function storedTheme() {
  try {
    return localStorage.getItem("bastant-theme") || "auto";
  } catch {
    return "auto";
  }
}

function effectiveTheme(theme) {
  if (theme === "light" || theme === "dark") return theme;
  return systemTheme.matches ? "dark" : "light";
}

function renderTheme(theme) {
  root.dataset.theme = theme === "light" || theme === "dark" ? theme : "auto";
  const effective = effectiveTheme(theme);
  if (button) {
    button.dataset.mode = effective;
    const next = effective === "dark" ? "lyst" : "mørkt";
    button.setAttribute("aria-label", `Bytt til ${next} tema`);
    button.title = `Bytt til ${next} tema`;
  }
}

if (button) {
  renderTheme(storedTheme());
  button.addEventListener("click", () => {
    const choice = effectiveTheme(storedTheme()) === "dark" ? "light" : "dark";
    try { localStorage.setItem("bastant-theme", choice); } catch {}
    renderTheme(choice);
  });
  systemTheme.addEventListener("change", () => {
    if (storedTheme() === "auto") renderTheme("auto");
  });
}
