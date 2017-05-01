window.onload = function() {
  var client = new XMLHttpRequest();
  client.open('GET', 'views/headless_html/home.html');
  client.onreadystatechange = function() {
    document.getElementById("main-content").innerHTML = client.responseText;
  };
  client.send();
};
