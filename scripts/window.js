var eventRenderHeader = new Event('renderheader');
var eventRenderNavigation = new Event('rendernavigation');
var eventRenderMainContent = new Event('rendermaincontent');
var eventRenderFooter = new Event('renderfooter');
var md = window.markdownit();

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

  var headerFile = "views/html/header.html";
  var navigationFile = "views/html/navigation.html";
  var footerFile = "views/html/footer.html";
  var contentFile = "views/html/" + page;
  if (page === "blog.html" && blog)
    contentFile = "views/markdown/" + blog;

  // GET and render header
  var headerRequest = new XMLHttpRequest();
  headerRequest.open("GET", headerFile);
  headerRequest.onreadystatechange = function() {
    handleXMLHTTPRequestReadyStateChange(headerRequest, function(err, responseText) {
        renderFileContentsToDocumentElement(err, responseText, document.getElementById("main-content"), headerFile);
        window.dispatchEvent(eventRenderHeader);
    });
  };

  // GET and render navigation menu
  window.addEventListener("renderheader", function() {
    var navigationRequest = new XMLHttpRequest();
    navigationRequest.open("GET", navigationFile);
    navigationRequest.onreadystatechange = function() {
      handleXMLHTTPRequestReadyStateChange(navigationRequest, function(err, responseText) {
          renderFileContentsToDocumentElement(err, responseText, document.getElementById("main-content"), navigationFile);
          window.dispatchEvent(eventRenderNavigation);
      });
    };
    navigationRequest.send();
  });

  // GET and render main content
  window.addEventListener("rendernavigation", function() {
    var contentRequest = new XMLHttpRequest();
    contentRequest.open("GET", contentFile);
    contentRequest.onreadystatechange = function() {
      handleXMLHTTPRequestReadyStateChange(contentRequest, function(err, responseText) {
          renderFileContentsToDocumentElement(err, responseText, document.getElementById("main-content"), contentFile);
          window.dispatchEvent(eventRenderMainContent);
      });
    };
    contentRequest.send();
  });

  // GET and render footer
  window.addEventListener("rendermaincontent", function() {
      var footerRequest = new XMLHttpRequest();
      footerRequest.open("GET", footerFile);
      footerRequest.onreadystatechange = function() {
        handleXMLHTTPRequestReadyStateChange(footerRequest, function(err, responseText) {
            renderFileContentsToDocumentElement(err, responseText, document.getElementById("main-content"), footerFile);
            window.dispatchEvent(eventRenderFooter);
        });
      };
      footerRequest.send();
    });

  headerRequest.send();
}

function handleXMLHTTPRequestReadyStateChange(req, callback) {
  if (req.readyState === 4)
    callback(req.status !== 200, req.responseText);
}

function renderFileContentsToDocumentElement(err, responseText, element, filename) {
  if (err) {
    window.location.href = "404.html";
  } else {
    var renderText = filename.split(".").pop() === "md" ? md.render(responseText) : responseText;
    element.innerHTML += renderText;
  }
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
