function renderWorkData() {
  var contentDiv = document.getElementById("content");

  if (contentDiv) {
    var personalProjectsHeading = document.createElement("h4");
    personalProjectsHeading.innerHTML = "Personal Projects";
    contentDiv.appendChild(personalProjectsHeading);
    if (WorkData && WorkData.personalProjects) {

    }

    var educationalProjectsHeading = document.createElement("h4");
    educationalProjectsHeading.innerHTML = "Educational Projects";
    contentDiv.appendChild(educationalProjectsHeading);
    if (WorkData && WorkData.educationalProjects) {

    }

    var jamsHeading = document.createElement("h4");
    jamsHeading.innerHTML = "Jams";
    contentDiv.appendChild(jamsHeading);
    if (WorkData && WorkData.jams) {

    }

    var gistsHeading = document.createElement("h4");
    gistsHeading.innerHTML = "Gists";
    contentDiv.appendChild(gistsHeading);
    if (WorkData && WorkData.gists) {

    }
  }
}

window.addEventListener("initialized", renderWorkData, true);
