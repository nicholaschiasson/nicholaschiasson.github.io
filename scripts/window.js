// jshint esversion: 6

var eventInitialized = new Event("initialized");
var md = window.markdownit("commonmark");
var owner = "nicholaschiasson";
var repo = owner + "/nicholaschiasson.github.io";
var RepoMeta = get("https://api.github.com/repos/" + repo);

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
  if (page.split("/").pop() === "blog.html" && blog)
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
    RepoMeta.then(function(response) {
      let repoMeta = JSON.parse(response);
      let copyrightYear = document.getElementById("year-of-last-update");
      if (copyrightYear && repoMeta && repoMeta.pushed_at)
        copyrightYear.innerHTML = new Date(repoMeta.pushed_at).getFullYear();
    });
    window.dispatchEvent(eventInitialized);
  }, function(error) {
    window.location.href = "404.html";
  });
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
