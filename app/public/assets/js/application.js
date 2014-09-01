function WebSocketHandler (uri, onmessage) {
  this.ws = null;
  this.uri = uri;
  this.init();
}

WebSocketHandler.prototype.init = function () {
  this.ws = new WebSocket(this.uri);
  this.ws.onmessage = this.onmessage;
  this.ws.onclose = function () {
    this.init();
  }.bind(this);
}

WebSocketHandler.prototype.send = function (str) {
  if (!this.ws) {
    this.init();
  }

  this.ws.send(str);
}

var scheme   = "ws://";
var uri      = scheme + window.document.location.host + "/";

var onmessage = function(message) {
  var data = JSON.parse(message.data);
  $("#chat-text").append("<div class='panel panel-default'><div class='panel-heading'>" + data.handle + "</div><div class='panel-body'>" + data.text + "</div></div>");
  $("#chat-text").stop().animate({
    scrollTop: $('#chat-text')[0].scrollHeight
  }, 800);
};

var ws = new WebSocketHandler(uri, onmessage);

$("#input-form").on("submit", function(event) {
  event.preventDefault();
  var handle = $("#input-handle")[0].value;
  var text   = $("#input-text")[0].value;
  ws.send(JSON.stringify({ handle: handle, text: text }));
  $("#input-text")[0].value = "";
});