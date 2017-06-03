// jshint esversion: 6

var experimentalProjectsPath = "views/root/experimental";

function renderBlogList() {
  function createProjectListItem(projectName) {
    let item = document.createElement("li");
    let link = document.createElement("a");
    link.setAttribute("class", "entry-title");
    link.setAttribute("href", window.location + "?project=" + encodeURI(projectName));
    link.innerHTML = projectName.replace(/\.(?=[^.]*$).*/, "");
    item.appendChild(link);
    return item;
  }

  function createProjectList(projects) {
    let list = document.createElement("ul");
    for (let i = 0; i < projects.length; i++) {
      list.appendChild(createProjectListItem(projects[i].name));
    }
    return list;
  }

  function processExperimentalProjectsMeta(experimentalProjectsMeta) {
    let meta = JSON.parse(experimentalProjectsMeta);
    contentDiv.appendChild(createProjectList(meta));
  }

  function renderExperimentalProject(filename, response) {
    contentDiv.innerHTML = "";
    let returnButton = document.createElement("a");
    returnButton.setAttribute("class", "back-button");
    returnButton.setAttribute("href", "experimental.html");
    let returnButtonInner = document.createElement("h5");
    returnButtonInner.innerHTML = "back to list";
    returnButton.appendChild(returnButtonInner);
    contentDiv.appendChild(returnButton);
    appendElementWithStringAsset(contentDiv, filename, response);
    contentDiv.appendChild(returnButton.cloneNode(true));
  }

  let contentDiv = document.getElementById("content");

  if (contentDiv) {
    let project = getURLParameter("project");

    if (window.location.pathname.split("/").pop() === "experimental.html" && project) {
      let filename = experimentalProjectsPath + "/" + project;
      if (sessionStorage[filename]) {
        renderExperimentalProject(filename, sessionStorage[filename]);
      } else {
        get(filename).then(function(response) {
          sessionStorage[filename] = response;
          renderExperimentalProject(filename, sessionStorage[filename]);
        }, function(error) {
          window.location.href = "404.html";
        });
      }
    } else {
      if (sessionStorage.ExperimentalProjectsMeta) {
        processExperimentalProjectsMeta(sessionStorage.ExperimentalProjectsMeta);
      }
      else {
        get(api + repo + "/contents/" + experimentalProjectsPath + "?" +
          encodeQueryData({access_token: AccessToken.access_token})).then(function(response) {
          sessionStorage.ExperimentalProjectsMeta = response;
          processExperimentalProjectsMeta(sessionStorage.ExperimentalProjectsMeta);
        });
      }
    }
  }
}

window.addEventListener("initialized", renderBlogList, true);
