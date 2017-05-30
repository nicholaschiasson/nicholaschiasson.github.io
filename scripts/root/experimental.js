// jshint esversion: 6

var experimentalProjectsPath = "views/root/experimental";
var ExperimentalProjectsMeta = get(api + repo + "/contents/" + experimentalProjectsPath);

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

  let contentDiv = document.getElementById("content");

  if (contentDiv) {
    let project = getURLParameter("project");

    if (window.location.pathname.split("/").pop() === "experimental.html" && project) {
      let filename = experimentalProjectsPath + "/" + project;
      get(filename).then(function(response) {
        contentDiv.innerHTML = "";
        let returnButton = document.createElement("a");
        returnButton.setAttribute("class", "back-button");
        returnButton.setAttribute("href", "experimental.html");
        let returnButtonInner = document.createElement("h5");
        returnButtonInner.innerHTML = "back to list";
        returnButton.appendChild(returnButtonInner);
        contentDiv.appendChild(returnButton);
        let renderText = filename.split(".").pop() === "md" ? md.render(response) : response;
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
              contentDiv.appendChild(node);
              break;
          }
        }
        contentDiv.appendChild(returnButton.cloneNode(true));
      }, function(error) {
        window.location.href = "404.html";
      });
    } else {
      ExperimentalProjectsMeta.then(function(response) {
        let experimentalProjectsMeta = JSON.parse(response);
        contentDiv.appendChild(createProjectList(experimentalProjectsMeta));
      });
    }
  }
}

window.addEventListener("initialized", renderBlogList, true);
