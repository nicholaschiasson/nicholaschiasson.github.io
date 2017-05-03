// jshint esversion: 6

var eventInitialized = new Event("initialized");
var md = window.markdownit();

function onWindowResize() {
  let wrapperDiv = document.getElementById("wrapper");

  let wrapperDivWidth = Math.max(Math.min(window.innerWidth, window.innerHeight),
    0.7 * window.innerWidth) / window.innerWidth * 100.0;
  wrapperDiv.style.width = wrapperDivWidth  + "%";
  wrapperDiv.style.marginLeft = (100.0 - wrapperDivWidth) / 2.0 + "%";
}

function onWindowLoad(page) {
  onWindowResize();
  let blog = getURLParameter("entry");

  if (!page)
    page = "home.html";

  let filenames = [];
  filenames.push("views/html/header.html");
  filenames.push("views/html/navigation.html");
  filenames.push(page);
  if (page === "blog.html" && blog)
    filenames[2] = "views/markdown/" + blog;
  filenames.push("views/html/footer.html");

  let promises = [];
  for (let i = 0; i < filenames.length; i++) {
    promises.push(get(filenames[i]));
  }

  Promise.all(promises).then(function(response) {
    let element = document.getElementById("wrapper");
    for (let i = 0; i < response.length; i++) {
      let renderText = filenames[i].split(".").pop() === "md" ? md.render(response[i]) : response[i];
      element.innerHTML += renderText;
    }
    applySVGStyles();
    window.dispatchEvent(eventInitialized);
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
    let renderText = filename.split(".").pop() === "md" ? md.render(responseText) : responseText;
    element.innerHTML += renderText;
  }
}

// Taken from https://developers.google.com/web/fundamentals/getting-started/primers/promises
function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    let req = new XMLHttpRequest();
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

/// Taken and modified from http://stackoverflow.com/a/22638396
function css(el) {
    let sheets = document.styleSheets, ret = [];
    el.matches = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector;
    for (let i in sheets) {
        let rules = sheets[i].rules || sheets[i].cssRules;
        for (let r in rules) {
            if (el.matches(rules[r].selectorText)) {
                ret.push(rules[r].cssText);
            }
        }
    }
    return ret;
}

function applySVGStyles() {
  let svgImages = document.getElementsByClassName("svg-img");
  let svgPromises = [];
  if (svgImages) {
    for (let i = 0; i < svgImages.length; i++) {
      svgPromises.push(promiseLoaded(svgImages[i]));
    }
    Promise.all(svgPromises).then(function() {
      for (let i = 0; i < svgImages.length; i++) {
        let cssRules = css(svgImages[i]);
        let svgDoc = svgImages[i].contentDocument;
        if (svgDoc) {
          let svgDefs = svgDoc.getElementsByTagName("defs");
          if (svgDefs && svgDefs.length > 0) {
            let styleElement = svgDoc.createElementNS("http://www.w3.org/2000/svg", "style");
            for (let j = 0; j < cssRules.length; j++) {
              if (cssRules[j].includes("." + svgImages[i].className)) {
                styleElement.textContent = cssRules[j].replace(/.*{/, "svg {");
              }
            }
            svgDefs[0].appendChild(styleElement);
          }
        }
      }
    });
  }
}

function promiseLoaded(element) {
  return new Promise(function(resolve, reject) {
    element.onload = resolve;
  });
}

function initialize(pageContent) {
  window.addEventListener("resize", onWindowResize, true);
  window.addEventListener("deviceorientation", onWindowResize, true);
  window.addEventListener("load", function() { onWindowLoad(pageContent); }, true);
}
