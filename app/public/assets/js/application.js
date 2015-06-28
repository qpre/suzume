/**
 * User
 */
function User (handle) {
    this.picture = null;
    this.handle  = handle;
}

function Room (name, messageList) {
  this.messageList  = messageList;
  this.name         = name;
}


/**
 * WebSockets
 */
function WebSocketHandler (uri, onmessage) {
  this.ws           = null;
  this.onmessage    = onmessage;
  this.wsReady      = false;
  this.queue        = [];
  this.uri          = uri;
  this.init();
}

WebSocketHandler.prototype.init = function () {
  this.ws           = new WebSocket(this.uri);
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

  this.ws.onclose = function (retry) {
    if (typeof retry === undefined) {
      retry = true;
    }

    this.ws = null;
    this.wsReady = false;
    console.log('connection closed');

    if (retry) {
      this.init();
    }
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

/**
 * Suzume
 */
function SuzumeWrapper () {
  this.ws           = null;
  this.user         = null;
  this.rooms        = {};
  this.currentRoom  = 'Dojo';
}

SuzumeWrapper.prototype.onMessage = function(message) {
  var data = JSON.parse(message.data);

  if (data) {
    switch (data.what) {
      case 'rooms':
        this._addRooms(data);
        break;
      case 'message':
        this._handleMessage(data);
        break;
      default:
        console.warn("Unkown command :" + data);
    }
  }
};

SuzumeWrapper.prototype._addRooms = function (data) {
  for (var i = 0; i < data.rooms.length; i++) {
    var name = data.rooms[i];
    this.rooms[name] = new Room(name, []);
  }
}

SuzumeWrapper.prototype._handleMessage = function (data) {
  var message = { handle: data.handle, text: data.text };

  if (!this.rooms[data.room]) {
    this._addRooms({ rooms: [data.room] });
  }

  this.rooms[data.room].messageList.push(message);

  if (data.room === this.currentRoom) {
    this.appendMessage(message);
  }
}

SuzumeWrapper.prototype.appendMessage = function (message) {
  $("#chat-text").append("<div class='message'><span class='handle'>" +
                          message.handle +
                          "</span><span class='text'>" +
                          message.text +
                          "</span></div>");
}

SuzumeWrapper.prototype.clearMessage = function () {
  $("#chat-text").innerHTML = '';
}

SuzumeWrapper.prototype.renderCurrentRoom = function () {
  var room = this.rooms[this.currentRoom];
  for (var i = 0; i < room.messageList.length; i++) {
    this.appendMessage(room.messageList[i]);
  }
}

SuzumeWrapper.prototype.sendMessage = function (message) {
  var text   = $("#input-text")[0].value;
  this.ws.send(JSON.stringify({
    what:     'message',
    handle:   this.user.handle,
    text:     text,
    room:     this.currentRoom }));
};

SuzumeWrapper.prototype.start = function () {
  var scheme   = "ws://";
  var uri      = scheme + 'suzume.herokuapp.com/'; //window.document.location.host + "/";

  this.ws = new WebSocketHandler(uri, this.onMessage);

  // Setting up listeners
  $("#input-form").on("submit", function(event) {
    event.preventDefault();

    if (this.checkUser()) {
      var text   = $("#input-text")[0].value;
      this.sendMessage(text);
      $("#input-text")[0].value = "";
    }
  }.bind(this));

  $('#user-login-form').on("submit", function(event) {
    event.preventDefault();
    var handle   = $("#input-handle")[0].value;

    this.user = new User(handle);

    document.getElementById("userName").innerHTML = this.user.handle;
    $('#userLoginModal').modal('hide');
  }.bind(this));

  this.checkUser();
  $('#chat-text').addClass('loaded');
}

SuzumeWrapper.prototype.checkUser = function () {
  this.user = new User('quentin');

  if (!this.user) {
    this.showLogin();
    return false;
  }

  return true;
}

SuzumeWrapper.prototype.showLogin = function () {
  $('#userLoginModal').modal('show');
}

// Init
window.Suzume = new SuzumeWrapper();
$(window).ready(function () {
  window.Suzume.start();
});
