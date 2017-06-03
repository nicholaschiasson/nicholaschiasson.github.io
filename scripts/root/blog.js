// jshint esversion: 6

var blogsPath = "views/root/blogs";

function renderBlogList() {
  let contentDiv = document.getElementById("content");

  function createBlogEntryListItem(title, creationDate) {
    let item = document.createElement("li");
    let link = document.createElement("a");
    link.setAttribute("class", "entry-title");
    link.setAttribute("href", window.location + "?entry=" + encodeURI(title));
    link.innerHTML = title.replace(/\.(?=[^.]*$).*/, "");
    item.appendChild(link);
    item.appendChild(document.createElement("br"));
    let span = document.createElement("span");
    span.setAttribute("class", "creation-date");
    span.setAttribute("data-toggle", "tooltip");
    span.setAttribute("title", creationDate.toTimeString());
    span.innerHTML = creationDate.toDateString();
    item.appendChild(span);
    return item;
  }

  function createBlogList(entries) {
    let list = document.createElement("ul");
    entries.sort();
    entries.reverse();
    for (let i = 0; i < entries.length; i++) {
      let date = new Date(entries[i].split(" ")[0]);
      let title = entries[i].replace(/^[^ ]+ /, "");
      list.appendChild(createBlogEntryListItem(title, date));
    }
    return list;
  }

  function processBlogMeta(blogMeta) {
    let meta = JSON.parse(blogMeta);
    let commitsPrefix = "commits_";
    let CommitsMeta = [];
    for (let i = 0; i < meta.length; i++) {
      if (sessionStorage[commitsPrefix + meta[i].path]) {
        CommitsMeta.push(sessionStorage[commitsPrefix + meta[i].path]);
      } else {
        CommitsMeta.push(get(encodeURIWithQuery(api + repo + "/commits",
          encodeQueryData({access_token: AccessToken.access_token, path: meta[i].path}))));
      }
    }
    Promise.all(CommitsMeta).then(function(response) {
      let blogEntries = [];
      for (let i = 0; i < response.length; i++) {
        sessionStorage[commitsPrefix + meta[i].path] = sessionStorage[commitsPrefix + meta[i].path] || response[i];
        let commitMeta = JSON.parse(response[i]);
        console.log(commitMeta);
        blogEntries.push(commitMeta.pop().commit.committer.date + " " + meta[i].name);
      }
      contentDiv.appendChild(createBlogList(blogEntries));
    });
  }

  function renderBlogEntry(filename, response) {
    contentDiv.innerHTML = "";
    let returnButton = document.createElement("a");
    returnButton.setAttribute("class", "back-button");
    returnButton.setAttribute("href", "blog.html");
    let returnButtonInner = document.createElement("h5");
    returnButtonInner.innerHTML = "back to list";
    returnButton.appendChild(returnButtonInner);
    contentDiv.appendChild(returnButton);
    appendElementWithStringAsset(contentDiv, filename, response);
    contentDiv.appendChild(returnButton.cloneNode(true));
  }

  if (contentDiv) {
    let blog = getURLParameter("entry");

    if (window.location.pathname.split("/").pop() === "blog.html" && blog) {
      let filename = blogsPath + "/" + blog;
      if (sessionStorage[filename]) {
        renderBlogEntry(filename, sessionStorage[filename]);
      } else {
        get(filename).then(function(response) {
          sessionStorage[filename] = response;
          renderBlogEntry(filename, sessionStorage[filename]);
        }, function(error) {
          window.location.href = "404.html";
        });
      }
    } else {
      let entriesHeading = document.createElement("h4");
      entriesHeading.innerHTML = "Entries";
      contentDiv.appendChild(entriesHeading);
      if (sessionStorage.BlogMeta) {
        processBlogMeta(sessionStorage.BlogMeta);
      } else {
        get(encodeURIWithQuery(api + repo + "/contents/" + blogsPath,
          encodeQueryData({access_token: AccessToken.access_token}))).then(function(response) {
          sessionStorage.BlogMeta = response;
          processBlogMeta(sessionStorage.BlogMeta);
        });
      }
    }
  }
}

window.addEventListener("initialized", renderBlogList, true);
