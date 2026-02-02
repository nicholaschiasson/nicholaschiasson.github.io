const colorSchemeQueryList = window.matchMedia("(prefers-color-scheme: dark)");

colorSchemeQueryList.addEventListener("change", (event) => {
  setTheme(event.matches);
});

function toggleTheme() {
  setTheme(!document.documentElement.classList.contains("dark-theme"));
}

function setTheme(dark) {
  localStorage.setItem("theme", dark ? "dark" : "light");
  if (dark) {
    document.documentElement.classList.add("dark-theme");
  } else {
    document.documentElement.classList.remove("dark-theme");
  }
}

let savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  setTheme(savedTheme === "dark");
} else {
  setTheme(colorSchemeQueryList.matches);
}
