var intervalMS = 2000;
var currentTagIndex = 1;
var taglineMain;
var taglineTemp;
var tags = [
  "software",
  "game",
  "web",
  "mobile",
  "embedded"
];

function homeInitialization() {
  taglineMain = document.getElementById("tagline-main");
  if (taglineMain) {
    taglineMain.addEventListener("animationend", onAnimationEnd);
  }
  taglineTemp = document.getElementById("tagline-temp");
  if (taglineTemp) {
    taglineTemp.addEventListener("animationend", onAnimationEnd);
  }
  setTimeout(animateTagline, intervalMS);
}

function animateTagline() {
  if (taglineMain && taglineTemp) {
    taglineTemp.classList.add("tagline-temp-animation");
    taglineMain.classList.add("tagline-main-animation");
  } else {
    homeInitialization();
  }
  setTimeout(animateTagline, intervalMS);
}

function onAnimationEnd(e) {
  if (e && e.target) {
    e.target.classList.remove(e.target.id + "-animation");
  }
  if (taglineMain && taglineTemp && !taglineMain.classList.contains("tagline-main-animation") && !taglineTemp.classList.contains("tagline-temp-animation")) {
    taglineTemp.innerHTML = taglineMain.innerHTML;
    taglineMain.innerHTML = tags[++currentTagIndex % tags.length];
  }
}

window.addEventListener("initialized", homeInitialization, true);
