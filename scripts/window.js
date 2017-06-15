// jshint esversion: 6

const owner = "nicholaschiasson";
const authenticatedUserUrl = "https://api.github.com/user";
const api = "https://api.github.com/repos/";
const repo = owner + "/nicholaschiasson.github.io";
const serverAddr = "https://speedy-code-170312.appspot.com";

var eventInitialized = new Event("initialized");
var md = window.markdownit("commonmark");

function processRepoMeta(repoMeta) {
  let meta = JSON.parse(repoMeta);
  let copyrightYear = document.getElementById("year-of-last-update");
  if (copyrightYear && meta && meta.pushed_at)
    copyrightYear.innerHTML = new Date(meta.pushed_at).getFullYear();
}

function appendElementWithStringAsset(element, assetName, assetString) {
  let renderText = assetName.split(".").pop() === "md" ? md.render(assetString) : assetString;
  let template = document.createElement("template");
  template.innerHTML = renderText;
  for (let i = 0; i < template.content.childNodes.length; i++) {
    let node = template.content.childNodes[i];
    switch (node.nodeName.toLowerCase()) {
      case "title":
      case "style":
      case "meta":
      case "link":
      case "script":
      case "base":
        document.head.appendChild(node);
        break;
      default:
        element.appendChild(node);
        break;
    }
  }
}

function onWindowResize() {
  let wrapperDiv = document.getElementById("wrapper");

  let wrapperDivWidth = Math.max(Math.min(window.innerWidth, window.innerHeight),
    0.7 * window.innerWidth) / window.innerWidth * 100.0;
  wrapperDiv.style.width = wrapperDivWidth  + "%";
  wrapperDiv.style.marginLeft = (100.0 - wrapperDivWidth) / 2.0 + "%";
}

function onWindowLoad(page) {
  onWindowResize();

  if (!page)
    page = "home.html";

  let filenames = [];
  filenames.push("views/root/header.html");
  filenames.push("views/root/navigation.html");
  filenames.push(page);
  filenames.push("views/root/footer.html");

  let promises = [];
  for (let i = 0; i < filenames.length; i++) {
    promises.push(get(filenames[i]));
  }

  Promise.all(promises).then(function(response) {
    let wrapperDiv = document.getElementById("wrapper");
    for (let i = 0; i < response.length; i++) {
      appendElementWithStringAsset(wrapperDiv, filenames[i], response[i]);
    }

    // Request repository metadata from Github API if not cached for the session
    // Use metadata to applying last push date as copyright year for all pages
    get(api + repo, {access_token: AccessToken.access_token}).then(function(response) {
      processRepoMeta(response);
    });

    // Setting active page to determine which tab to highlight on page
    let pageName = window.location.pathname.split("/").pop().split(".")[0] || "index";
    let activeNavigationButton = document.getElementById("nav-button-" + pageName);
    if (activeNavigationButton) {
      activeNavigationButton.setAttribute("class", "active");
    }

    // Window initialization complete
    window.dispatchEvent(eventInitialized);
  }, function(error) {
    console.log(error);
    window.location.href = "404.html";
  });
}

function guarantee(value) {
  return new Promise(function(resolve) {
    resolve(value);
  });
}

// Taken from https://developers.google.com/web/fundamentals/getting-started/primers/promises
function get(url, params, mimeType, noCache) {
  if (noCache) {
    if (!params) params = {};
    params._ = new Date().getTime();
  }
  let uriLocation = encodeURIWithQuery(url, encodeQueryData(params));
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    let req = new XMLHttpRequest();
    req.open("GET", uriLocation);

    req.overrideMimeType(mimeType || "text/plain");

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

/// Expects both the uri component and query string component to already be encoded
function encodeURIWithQuery(uri, query) {
  return uri + "?" + query;
}

/// Taken from https://stackoverflow.com/a/111545
function encodeQueryData(data) {
   let ret = [];
   for (let d in data)
     ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
   return ret.join('&');
}

function githubAuthenticate() {
  get(encodeURI(serverAddr + "/client_id")).then(function(res) {
    window.location = encodeURIWithQuery("https://github.com/login/oauth/authorize",
      encodeQueryData({client_id: res, scope: "public_repo"}));
  }, function(err) {
    alert(err + ": Failed to initiate authentication.");
  });
}

function initialize(pageContent) {
  window.addEventListener("resize", onWindowResize, true);
  window.addEventListener("deviceorientation", onWindowResize, true);
  window.addEventListener("load", function() { onWindowLoad(pageContent); }, true);
}
