// jshint esversion: 6

var blogsPath = "views/markdown";
var BlogMeta = get(api + repo + "/contents/" + blogsPath);

function renderBlogList() {
  function createProjectDataListItem(title, creationDate) {
    let paragraph = document.createElement("p");
    let link = document.createElement("a");
    link.setAttribute("href", window.location + "?entry=" + encodeURI(title));
    link.innerHTML = title.replace(/\.(?=[^.]*$).*/, "");
    paragraph.appendChild(link);
    let span = document.createElement("span");
    span.setAttribute("class", "creation-date");
    span.setAttribute("data-toggle", "tooltip");
    span.setAttribute("title", creationDate.toTimeString());
    span.innerHTML = " - " + creationDate.toDateString();
    paragraph.appendChild(span);
    return paragraph;
  }

  function createBlogList(entries) {
    let list = document.createElement("ul");
    entries.sort();
    entries.reverse();
    for (let i = 0; i < entries.length; i++) {
      let date = new Date(entries[i].split(" ")[0]);
      let title = entries[i].replace(/^[^ ]+ /, "");
      list.appendChild(createProjectDataListItem(title, date));
    }
    return list;
  }

  let contentDiv = document.getElementById("content");

  if (contentDiv) {
    let blog = getURLParameter("entry");

    if (window.location.pathname.split("/").pop() === "blog.html" && blog) {
      let filename = blogsPath + "/" + blog;
      get(filename).then(function(response) {
        let renderText = filename.split(".").pop() === "md" ? md.render(response) : response;
        contentDiv.innerHTML = renderText;
      }, function(error) {
        window.location.href = "404.html";
      });
    } else {
      BlogMeta.then(function(response) {
        let blogMeta = JSON.parse(response);
        let CommitsMeta = [];
        for (let i = 0; i < blogMeta.length; i++) {
          CommitsMeta.push(get(api + repo + "/commits?path=" + blogMeta[i].path));
        }
        Promise.all(CommitsMeta).then(function(response) {
          let blogEntries = [];
          for (let i = 0; i < response.length; i++) {
            let commitMeta = JSON.parse(response[i]);
            blogEntries.push(commitMeta.pop().commit.committer.date + " " + blogMeta[i].name);
          }
          contentDiv.appendChild(createBlogList(blogEntries));
        });
      });
    }
  }
}

window.addEventListener("initialized", renderBlogList, true);
