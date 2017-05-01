window.onload = function() {
  var mainContentDiv = document.getElementById("main-content");

  mainContentDiv.style.width = Math.max(Math.min(window.innerWidth, window.innerHeight), 0.6 * window.innerWidth) + "px";

  var page = getURLParameter("page");
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
        mainContentDiv.innerHTML += renderText;
      } else {
        mainContentDiv.innerHTML += "<h1>Page not found.</h1>";
      }
    }
  };
  client.send();
};

/// Taken from http://stackoverflow.com/a/11582513
function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}
