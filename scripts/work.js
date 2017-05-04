// jshint esversion: 6

function renderWorkData() {
  function createWorkDataListItem(data) {
    let listItem = document.createElement("li");
    let topDiv = document.createElement("div");
    topDiv.setAttribute("class", "top");
    if (data.title) {
      listItem.setAttribute("id", "work-" + data.title);
      let heading = document.createElement("h5");
      heading.setAttribute("class", "left");
      heading.innerHTML = data.title;
      topDiv.appendChild(heading);
    }
    let topRightDiv = document.createElement("div");
    topRightDiv.setAttribute("class", "right");
    if (data.home_url) {
      let link = document.createElement("a");
      link.setAttribute("class", "left");
      link.setAttribute("target", "_blank");
      link.setAttribute("data-toggle", "tooltip");
      link.setAttribute("title", "project home page");
      link.setAttribute("href", data.home_url);
      let objImg = document.createElement("object");
      objImg.setAttribute("class", "svg-img");
      objImg.setAttribute("data", "images/svg/octicons/home.svg");
      objImg.setAttribute("type", "image/svg+xml");
      objImg.setAttribute("width", "16px");
      objImg.setAttribute("height", "16px");
      link.appendChild(objImg);
      topRightDiv.appendChild(link);
    }
    if (data.download_url) {
      let link = document.createElement("a");
      link.setAttribute("class", "left");
      link.setAttribute("target", "_blank");
      link.setAttribute("data-toggle", "tooltip");
      link.setAttribute("title", "project downloads");
      link.setAttribute("href", data.download_url);
      let objImg = document.createElement("object");
      objImg.setAttribute("class", "svg-img");
      objImg.setAttribute("data", "images/svg/octicons/cloud-download.svg");
      objImg.setAttribute("type", "image/svg+xml");
      objImg.setAttribute("width", "16px");
      objImg.setAttribute("height", "16px");
      link.appendChild(objImg);
      topRightDiv.appendChild(link);
    }
    if (data.repo_url) {
      let link = document.createElement("a");
      link.setAttribute("class", "left");
      link.setAttribute("target", "_blank");
      link.setAttribute("data-toggle", "tooltip");
      link.setAttribute("title", "project repository");
      link.setAttribute("href", data.repo_url);
      let objImg = document.createElement("object");
      objImg.setAttribute("class", "svg-img");
      objImg.setAttribute("data", "images/svg/octicons/mark-github.svg");
      objImg.setAttribute("type", "image/svg+xml");
      objImg.setAttribute("width", "16px");
      objImg.setAttribute("height", "16px");
      link.appendChild(objImg);
      topRightDiv.appendChild(link);
    }
    if (data.doc_url) {
      let link = document.createElement("a");
      link.setAttribute("class", "left");
      link.setAttribute("target", "_blank");
      link.setAttribute("data-toggle", "tooltip");
      link.setAttribute("title", "project documentation");
      link.setAttribute("href", data.doc_url);
      let objImg = document.createElement("object");
      objImg.setAttribute("class", "svg-img");
      objImg.setAttribute("data", "images/svg/octicons/book.svg");
      objImg.setAttribute("type", "image/svg+xml");
      objImg.setAttribute("width", "16px");
      objImg.setAttribute("height", "16px");
      link.appendChild(objImg);
      topRightDiv.appendChild(link);
    }
    let permalink = document.createElement("a");
    permalink.setAttribute("class", "left");
    permalink.setAttribute("data-toggle", "tooltip");
    permalink.setAttribute("title", "permanent link");
    permalink.setAttribute("href", "#work-" + data.title);
    let objImg = document.createElement("object");
    objImg.setAttribute("class", "svg-img");
    objImg.setAttribute("data", "images/svg/octicons/link.svg");
    objImg.setAttribute("type", "image/svg+xml");
    objImg.setAttribute("width", "16px");
    objImg.setAttribute("height", "16px");
    permalink.appendChild(objImg);
    topRightDiv.appendChild(permalink);
    topDiv.appendChild(topRightDiv);
    listItem.appendChild(topDiv);
    let middleDiv = document.createElement("div");
    middleDiv.setAttribute("class", "middle");
    if (data.description) {
      let paragraph = document.createElement("p");
      paragraph.setAttribute("class", "left");
      paragraph.innerHTML = data.description;
      middleDiv.appendChild(paragraph);
    }
    if (data.thumbnail_url) {
      let thumbnail = document.createElement("img");
      thumbnail.setAttribute("class", "right");
      thumbnail.setAttribute("src", data.thumbnail_url);
      middleDiv.appendChild(thumbnail);
    }
    listItem.appendChild(middleDiv);
    let bottomDiv = document.createElement("div");
    bottomDiv.setAttribute("class", "bottom");
    if (data.license_badge) {
      let licenseBadge = document.createElement("img");
      licenseBadge.setAttribute("class", "left");
      licenseBadge.setAttribute("src", data.license_badge);
      bottomDiv.appendChild(licenseBadge);
    }
    listItem.appendChild(bottomDiv);
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
