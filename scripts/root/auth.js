// jshint esversion: 6

function checkAuthentication() {
  let header = document.getElementById("content-header");

  if (localStorage.profile_token) {
    if (header) {
      header.innerHTML = "😊 You have been authenticated.";
    }
  } else {
    let authCode = getURLParameter("code");
    if (header) {
      if (!authCode) {
        header.innerHTML = "You have not been authenticated.";
      } else {
        header.innerHTML = "🤔 Authenticating...";
        get(encodeURIWithQuery(encodeURI(serverAddr + "/access_token"), encodeQueryData({code: authCode}))).then(function(res) {
          try {
            let accessToken = JSON.parse(res).access_token;
            if (!accessToken) throw new Error("Error: Failed to receive access token.");
            header.innerHTML = "😊 Authentication succeeded.";
            localStorage.profile_token = res;
          } catch(e) {
            header.innerHTML = "😢 Authentication failed.";
            alert(e.message);
          }
        }, function(err) {
          header.innerHTML = "😢 Authentication failed.";
          alert(err + ": Failed to complete authentication.");
        });
      }
    }
  }
}

window.addEventListener("initialized", checkAuthentication, true);
