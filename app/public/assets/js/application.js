function WebSocketHandler (uri, onmessage) {
  this.ws = null;
  this.onmessage = onmessage;
  this.wsReady = false;
  this.queue = [];
  this.uri = uri;
  this.init();
}

WebSocketHandler.prototype.init = function () {
  this.ws = new WebSocket(this.uri);
  this.ws.onmessage = this.onmessage;

  this.ws.onopen = function () {
    var i = 0;

    console.log('connection opened');

    this.wsReady = true;
    for (; i < this.queue.length; i++) {
      this.send(this.queue[i]);
    }
    this.queue = [];
  }.bind(this);

  this.ws.onclose = function () {
    this.ws = null;
    this.wsReady = false;
    console.log('connection closed');
  }.bind(this);


}

WebSocketHandler.prototype.send = function (str) {
  if (!this.ws) {
    this.init();
  }

  if (!this.wsReady){
    this.queue.push(str);
  } else {
    this.ws.send(str);
  }
}

var scheme   = "ws://";
var uri      = scheme + window.document.location.host + "/";

var onmessage = function(message) {
  var data = JSON.parse(message.data);
  $("#chat-text").append("<form class='form-horizontal' role='form'><div class='form-group'><label class='col-sm-2 control-label'>" + data.handle + "</label><div class='col-sm-10'><p class='form-control-static'>"+ data.text +"</p></div></div></form>");
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