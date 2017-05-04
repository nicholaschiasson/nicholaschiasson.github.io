// jshint esversion: 6

function renderWorkData() {
  function createWorkDataListItem(data) {
    let listItem = document.createElement("li");
    let link = document.createElement("a");
    link.setAttribute("target", "_blank");
    link.setAttribute("href", data.url);
    link.innerHTML = data.title;
    listItem.appendChild(link);
    return listItem;
  }

  function createWorkDataList(dataArray) {
    let list = document.createElement("ul");
    for (let i = 0; i < dataArray.length; i++) {
      list.appendChild(createWorkDataListItem(dataArray[i]));
    }
    return list;
  }

  let contentDiv = document.getElementById("content");

  if (contentDiv) {
    let personalProjectsHeading = document.createElement("h4");
    personalProjectsHeading.innerHTML = "Personal Projects";
    contentDiv.appendChild(personalProjectsHeading);
    if (WorkData && WorkData.personalProjects) {
      contentDiv.appendChild(createWorkDataList(WorkData.personalProjects));
    }

    let educationalProjectsHeading = document.createElement("h4");
    educationalProjectsHeading.innerHTML = "Educational Projects";
    contentDiv.appendChild(educationalProjectsHeading);
    if (WorkData && WorkData.educationalProjects) {
      contentDiv.appendChild(createWorkDataList(WorkData.educationalProjects));
    }

    let jamsHeading = document.createElement("h4");
    jamsHeading.innerHTML = "Jams";
    contentDiv.appendChild(jamsHeading);
    if (WorkData && WorkData.jams) {
      contentDiv.appendChild(createWorkDataList(WorkData.jams));
    }

    let gistsHeading = document.createElement("h4");
    gistsHeading.innerHTML = "Gists";
    contentDiv.appendChild(gistsHeading);
    if (WorkData && WorkData.gists) {
      contentDiv.appendChild(createWorkDataList(WorkData.gists));
    }
  }
}

window.addEventListener("initialized", renderWorkData, true);
