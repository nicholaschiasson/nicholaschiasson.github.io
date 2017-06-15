// jshint esversion: 6

var postComment;
var deleteComment;

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
    let blogTitle = document.createElement("h1");
    blogTitle.setAttribute("class", "blog-title");
    blogTitle.innerHTML = entryMeta.title;
    contentDiv.appendChild(blogTitle);
    let originalPost = document.createElement("div");
    let opAvatarAnchor = document.createElement("a");
    opAvatarAnchor.setAttribute("class", "user-avatar-anchor");
    opAvatarAnchor.setAttribute("href", entryMeta.user.html_url);
    opAvatarAnchor.setAttribute("target", "_blank");
    let opAvatar = document.createElement("img");
    opAvatar.setAttribute("class", "user-avatar  original-post-avatar");
    opAvatar.setAttribute("src", entryMeta.user.avatar_url);
    opAvatarAnchor.appendChild(opAvatar);
    originalPost.appendChild(opAvatarAnchor);
    let opInfo = document.createElement("span");
    opInfo.setAttribute("class", "original-post-info");
    let opUsername = document.createElement("a");
    opUsername.setAttribute("class", "commenter-anchor");
    opUsername.setAttribute("href", entryMeta.user.html_url);
    opUsername.setAttribute("target", "_blank");
    opUsername.innerHTML = entryMeta.user.login;
    opInfo.appendChild(opUsername);
    let opDate = document.createElement("span");
    opDate.setAttribute("class", "creation-date");
    opDate.innerHTML = " on ";
    let opCreationDate = document.createElement("span");
    opCreationDate.setAttribute("class", "date-time");
    opCreationDate.setAttribute("data-toggle", "tooltip");
    opCreationDate.setAttribute("title", new Date(entryMeta.created_at).toTimeString());
    opCreationDate.innerHTML = new Date(entryMeta.created_at).toDateString();
    opDate.appendChild(opCreationDate);
    if (entryMeta.created_at !== entryMeta.updated_at) {
      opDate.innerHTML += " (Edited: ";
      let opUpdateDate = document.createElement("span");
      opUpdateDate.setAttribute("class", "date-time");
      opUpdateDate.setAttribute("data-toggle", "tooltip");
      opUpdateDate.setAttribute("title", new Date(entryMeta.updated_at).toTimeString());
      opUpdateDate.innerHTML = new Date(entryMeta.updated_at).toDateString();
      opDate.appendChild(opUpdateDate);
      opDate.innerHTML += ")";
    }
    opInfo.appendChild(opDate);
    originalPost.appendChild(opInfo);
    contentDiv.appendChild(originalPost);
    contentDiv.appendChild(document.createElement("hr"));
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
      signInButton.setAttribute("class", "github-button");
      signInButton.setAttribute("onclick", "githubAuthenticate();"); // for some reason, a regular .addEventListener() does not work here!!
      signInButton.innerHTML = "Sign in";
      notSignedInP.appendChild(signInButton);
      notSignedInP.innerHTML += " using Github to post comments.";
      notSignedInDiv.appendChild(notSignedInP);
      contentDiv.appendChild(notSignedInDiv);
      renderCommentSection(entryMeta);
    } else {
      let commentForm = document.createElement("div");
      commentForm.setAttribute("class", "comment-form");
      get(encodeURIWithQuery(authenticatedUserUrl, encodeQueryData({access_token: JSON.parse(localStorage.profile_token).access_token, _: new Date().getTime()}))).then(function(res) {
        let userMeta = JSON.parse(res);
        renderCommentFormAndSection(commentForm, entryMeta, userMeta);
        contentDiv.appendChild(commentForm);
        renderCommentSection(entryMeta, userMeta);
      }, function(err) {
        renderCommentFormAndSection(commentForm, entryMeta);
        contentDiv.appendChild(commentForm);
        renderCommentSection(entryMeta);
      });
    }
  }

  function renderCommentFormAndSection(commentForm, entryMeta, userMeta) {
    if (userMeta) {
      let userAvatarAnchor = document.createElement("a");
      userAvatarAnchor.setAttribute("class", "user-avatar-anchor");
      userAvatarAnchor.setAttribute("href", userMeta.html_url);
      userAvatarAnchor.setAttribute("target", "_blank");
      let userAvatar = document.createElement("img");
      userAvatar.setAttribute("class", "user-avatar");
      userAvatar.setAttribute("src", userMeta.avatar_url);
      userAvatarAnchor.appendChild(userAvatar);
      commentForm.appendChild(userAvatarAnchor);
    }
    let innerCommentForm = document.createElement("div");
    innerCommentForm.setAttribute("class", "comment-inner comment-form-inner");
    let commentArea = document.createElement("textarea");
    commentArea.setAttribute("name", "body");
    commentArea.setAttribute("id", "comment-area");
    commentArea.setAttribute("placeholder", "Leave a comment");
    commentArea.setAttribute("rows", "4");
    innerCommentForm.appendChild(commentArea);
    let commentSubmit = document.createElement("a");
    commentSubmit.setAttribute("class", "github-button comment-button");
    commentSubmit.setAttribute("onclick", `postComment('${JSON.stringify(entryMeta)}');`);
    commentSubmit.innerHTML = "Comment";
    innerCommentForm.appendChild(commentSubmit);
    commentForm.appendChild(innerCommentForm);
  }

  function renderCommentSection(entryMeta, userMeta) {
    get(encodeURIWithQuery(entryMeta.comments_url, encodeQueryData({access_token: AccessToken.access_token, _: new Date().getTime()}))).then(function(res) {
      let commentsMeta = JSON.parse(res);
      let commentSection = document.getElementById("comment-section") || document.createElement("div");
      commentSection.setAttribute("id", "comment-section");
      for (let i = commentsMeta.length - 1; i >= 0; i--) {
        let commentDiv = document.createElement("div");
        commentDiv.setAttribute("class", "comment-outer");
        let userAvatarAnchor = document.createElement("a");
        userAvatarAnchor.setAttribute("class", "user-avatar-anchor");
        userAvatarAnchor.setAttribute("href", commentsMeta[i].user.html_url);
        userAvatarAnchor.setAttribute("target", "_blank");
        let userAvatar = document.createElement("img");
        userAvatar.setAttribute("class", "user-avatar");
        userAvatar.setAttribute("src", commentsMeta[i].user.avatar_url);
        userAvatarAnchor.appendChild(userAvatar);
        commentDiv.appendChild(userAvatarAnchor);
        let commentInner = document.createElement("div");
        commentInner.setAttribute("class", "comment-inner");
        let commentHeader = document.createElement("div");
        commentHeader.setAttribute("class", "comment-header");
        let commenter = document.createElement("a");
        commenter.setAttribute("class", "commenter-anchor");
        commenter.setAttribute("href", commentsMeta[i].user.html_url);
        commenter.setAttribute("target", "_blank");
        commenter.innerHTML = commentsMeta[i].user.login;
        commentHeader.appendChild(commenter);
        let commentDate = document.createElement("span");
        commentDate.setAttribute("class", "creation-date");
        commentDate.innerHTML = " on ";
        let commentCreationDate = document.createElement("span");
        commentCreationDate.setAttribute("class", "date-time");
        commentCreationDate.setAttribute("data-toggle", "tooltip");
        commentCreationDate.setAttribute("title", new Date(commentsMeta[i].created_at).toTimeString());
        commentCreationDate.innerHTML = new Date(commentsMeta[i].created_at).toDateString();
        commentDate.appendChild(commentCreationDate);
        if (commentsMeta[i].created_at !== commentsMeta[i].updated_at) {
          commentDate.innerHTML += " (Edited: ";
          let commentUpdateDate = document.createElement("span");
          commentUpdateDate.setAttribute("class", "date-time");
          commentUpdateDate.setAttribute("data-toggle", "tooltip");
          commentUpdateDate.setAttribute("title", new Date(commentsMeta[i].updated_at).toTimeString());
          commentUpdateDate.innerHTML = new Date(commentsMeta[i].updated_at).toDateString();
          commentDate.appendChild(commentUpdateDate);
          commentDate.innerHTML += ")";
        }
        commentHeader.appendChild(commentDate);
        let commentOptions = document.createElement("div");
        commentOptions.setAttribute("class", "comment-options");
        if (userMeta && userMeta.login === commentsMeta[i].user.login) {
          let deleteCommentButton = document.createElement("a");
          deleteCommentButton.setAttribute("class", "comment-option");
          deleteCommentButton.setAttribute("data-toggle", "tooltip");
          deleteCommentButton.setAttribute("title", "delete comment");
          deleteCommentButton.setAttribute("onclick", `deleteComment("${commentsMeta[i].url}")`);
          deleteCommentButton.innerHTML = svg_x;
          commentOptions.appendChild(deleteCommentButton);
        }
        commentHeader.appendChild(commentOptions);
        commentInner.appendChild(commentHeader);
        let commentBody = document.createElement("div");
        commentBody.setAttribute("class", "comment-body");
        commentBody.innerHTML = md.render(commentsMeta[i].body);
        commentInner.appendChild(commentBody);
        commentDiv.appendChild(commentInner);
        commentSection.appendChild(commentDiv);
      }
      contentDiv.appendChild(commentSection);
    }, function(err) {
      alert(err + ": Failed to refresh comments section.");
    });
  }

  postComment = function(entryJSON) {
    let entryMeta = JSON.parse(entryJSON);
    let commentArea = document.getElementById("comment-area");
    if (commentArea && commentArea.value) {
      if (commentArea.value) {
        let postBody = JSON.stringify({body: commentArea.value});
        let req = new XMLHttpRequest();
        req.open("POST", encodeURIWithQuery(entryMeta.comments_url, encodeQueryData({access_token: JSON.parse(localStorage.profile_token).access_token})));

        req.onload = function() {
          if (req.status < 400) {
            delete commonCache.BlogMeta;
            window.location.reload(true);
          }
          else {
            console.error(Error(req.statusText));
          }
        };

        req.onerror = function() {
          console.error(Error("Network Error"));
        };

        req.send(postBody);
      }
    }
  };

  deleteComment = function(commentUrl) {
    if (confirm("Are you sure you want to delete this comment?")) {
      let req = new XMLHttpRequest();
      req.open("DELETE", encodeURIWithQuery(commentUrl, encodeQueryData({access_token: JSON.parse(localStorage.profile_token).access_token})));

      req.onload = function() {
        if (req.status < 400) {
          delete commonCache.BlogMeta;
          window.location.reload(true);
        } else {
          console.error(Error(req.statusText));
        }
      };

      req.onerror = function() {
        console.error(Error("Network Error"));
      };

      req.send();
    }
  };

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
          encodeQueryData({access_token: AccessToken.access_token, labels: "blog", state: "open", sort: "created", direction: "desc", _: new Date().getTime()}))).then(function(response) {
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
