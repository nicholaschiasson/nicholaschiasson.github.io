// jshint esversion: 6

function renderBlogList() {
  let contentDiv = document.getElementById("content");

  function createBlogEntryListItem(entry) {
    let item = document.createElement("li");
    let link = document.createElement("a");
    link.setAttribute("class", "entry-title");
    link.setAttribute("href", window.location + "?id=" + entry.number);
    link.innerHTML = entry.title;
    item.appendChild(link);
    item.appendChild(document.createElement("br"));
    let date_p = document.createElement("p");
    date_p.setAttribute("class", "creation-date");
    let created_span = document.createElement("span");
    created_span.setAttribute("class", "date-time");
    created_span.setAttribute("data-toggle", "tooltip");
    created_span.setAttribute("title", new Date(entry.created_at).toTimeString());
    created_span.innerHTML = new Date(entry.created_at).toDateString();
    date_p.appendChild(created_span);
    if (entry.created_at !== entry.updated_at) {
      let updated_span = document.createElement("span");
      updated_span.setAttribute("class", "date-time");
      updated_span.setAttribute("data-toggle", "tooltip");
      updated_span.setAttribute("title", new Date(entry.updated_at).toTimeString());
      updated_span.innerHTML = new Date(entry.updated_at).toDateString();
      date_p.innerHTML += " (Updated: ";
      date_p.appendChild(updated_span);
      date_p.innerHTML += ")";
    }
    item.appendChild(date_p);
    return item;
  }

  function createBlogList(entries) {
    let list = document.createElement("ul");
    for (let i = 0; i < entries.length; i++) {
      list.appendChild(createBlogEntryListItem(entries[i]));
    }
    return list;
  }

  function renderBlogEntry(entryMeta) {
    contentDiv.innerHTML = "";
    let returnButton = document.createElement("a");
    returnButton.setAttribute("class", "back-button");
    returnButton.setAttribute("href", "blog.html");
    let returnButtonInner = document.createElement("h5");
    returnButtonInner.innerHTML = "back to list";
    returnButton.appendChild(returnButtonInner);
    contentDiv.appendChild(returnButton);
    appendElementWithStringAsset(contentDiv, ".md", entryMeta.body);
    contentDiv.appendChild(document.createElement("hr"));
    let commentsTitle = document.createElement("h5");
    commentsTitle.innerHTML = "Comments • " + entryMeta.comments;
    contentDiv.appendChild(commentsTitle);
    if (!localStorage.profile_token) {
      let notSignedInDiv = document.createElement("div");
      notSignedInDiv.setAttribute("id", "not-signed-in");
      let notSignedInP = document.createElement("p");
      let signInButton = document.createElement("a");
      signInButton.setAttribute("id", "sign-in-button");
      signInButton.setAttribute("onclick", "githubAuthenticate();"); // for some reason, a regular .addEventListener() does not work here!!
      signInButton.innerHTML = "Sign in";
      notSignedInP.appendChild(signInButton);
      notSignedInP.innerHTML += " using Github to post comments.";
      notSignedInDiv.appendChild(notSignedInP);
      contentDiv.appendChild(notSignedInDiv);
    } else {
      let commentBox = document.createElement("textarea");
      commentBox.setAttribute("class", "comment-area");
      commentBox.setAttribute("placeholder", "Leave a comment");
      commentBox.setAttribute("rows", "4");
      contentDiv.appendChild(commentBox);
    }
  }

  if (contentDiv) {
    let blog = getURLParameter("id");

    if (window.location.pathname.split("/").pop() === "blog.html" && blog) {
      let entryMeta;
      if (commonCache.BlogMeta) {
        entryMeta = JSON.parse(commonCache.BlogMeta).find(function(element) {
          return element.number.toString() === blog;
        });
      }
      if (entryMeta) {
        renderBlogEntry(entryMeta);
      } else {
        get(encodeURIWithQuery(api + repo + "/issues",
          encodeQueryData({access_token: AccessToken.access_token, labels: "blog", state: "open", sort: "created", direction: "desc"}))).then(function(response) {
          commonCache.BlogMeta = response;
          entryMeta = JSON.parse(commonCache.BlogMeta).find(function(element) {
            return element.number.toString() === blog;
          });
          if (entryMeta) {
            renderBlogEntry(entryMeta);
          } else {
            window.location.href = "404.html";
          }
        }, function(error) {
          window.location.href = "404.html";
        });
      }
    } else {
      let entriesHeading = document.createElement("h4");
      entriesHeading.innerHTML = "Entries";
      contentDiv.appendChild(entriesHeading);
      if (commonCache.BlogMeta) {
        contentDiv.appendChild(createBlogList(JSON.parse(commonCache.BlogMeta)));
      } else {
        get(encodeURIWithQuery(api + repo + "/issues",
          encodeQueryData({access_token: AccessToken.access_token, labels: "blog", state: "open", sort: "created", direction: "desc"}))).then(function(response) {
          commonCache.BlogMeta = response;
          contentDiv.appendChild(createBlogList(JSON.parse(commonCache.BlogMeta)));
        });
      }
    }
  }
}

window.addEventListener("initialized", renderBlogList, true);
