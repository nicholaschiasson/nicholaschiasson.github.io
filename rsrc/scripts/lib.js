function aboutSummaryOnClick(e) {
  activeAboutDetails.removeAttribute("open");
  activeAboutDetails = e.parentElement;
}

function onPopState() {
  updateActiveNav();
}

function updateActiveNav() {
  if (activeNav) {
    activeNav.removeAttribute("active");
  }
  activeNav =
    document.getElementById(`nav-${location.hash.replace(/^#/, "") || "home"}`) ||
    activeNav ||
    document.getElementById("nav-home");
  activeNav.setAttribute("active", true);
}
