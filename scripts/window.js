function onWindowResize() {
  var mainContentDiv = document.getElementById("main-content");

  var mainContentDivWidth = Math.max(Math.min(window.innerWidth, window.innerHeight),
    0.7 * window.innerWidth) / window.innerWidth * 100.0;
  mainContentDiv.style.width = mainContentDivWidth  + "%";
  mainContentDiv.style.marginLeft = (100.0 - mainContentDivWidth) / 2.0 + "%";
}

function onWindowLoad(page) {
  onWindowResize();
  var blog = getURLParameter("entry");

  if (!page)
    page = "home.html";

  var renderFile = "views/html/" + page;
  if (page === "blog.html" && blog)
    renderFile = "views/markdown/" + blog;

  var md = window.markdownit();

  var client = new XMLHttpRequest();
  client.open("GET", renderFile);
  client.onreadystatechange = function() {
    if (client.readyState === 4) {
      if (client.status === 200) {
        var renderText = renderFile.split(".").pop() === "md" ? md.render(client.responseText) : client.responseText;
        document.getElementById("main-content").innerHTML += renderText;
      } else {
        window.location.href = "404.html";
      }
    }
  };
  client.send();
}

/// Taken from http://stackoverflow.com/a/11582513
function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

function initialize(err) {
  window.addEventListener("resize", onWindowResize, true);
  window.addEventListener("deviceorientation", onWindowResize, true);
  if (err) {
    window.addEventListener("load", function() { onWindowLoad("error.html"); }, true);
  } else {
    window.addEventListener("load", function() { onWindowLoad(getURLParameter("page")); }, true);
  }
}
