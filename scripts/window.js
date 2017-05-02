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

  var filenames = [];
  filenames.push("views/html/header.html");
  filenames.push("views/html/navigation.html");
  filenames.push("views/html/" + page);
  if (page === "blog.html" && blog)
    filenames[2] = "views/markdown/" + blog;
  filenames.push("views/html/footer.html");

  var promises = [];
  for (var i = 0; i < filenames.length; i++) {
    promises.push(get(filenames[i]));
  }

  Promise.all(promises).then(function(response) {
    var element = document.getElementById("main-content");
    for (var i = 0; i < response.length; i++) {
      var renderText = filenames[i].split(".").pop() === "md" ? md.render(response[i]) : response[i];
      element.innerHTML += renderText;
    }
  }, function(error) {
    window.location.href = "404.html";
  });
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

// Taken from https://developers.google.com/web/fundamentals/getting-started/primers/promises
function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
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
