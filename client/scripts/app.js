// YOUR CODE HERE:

app = {};
app.messageIDs = {};
app.server = 'https://api.parse.com/1/classes/messages';
app.roomname = 'lobby';
app.rooms = [];
app.friends = [];
// var appendMessage = function(messageObj) {

//   if (app.messageIDs[messageObj.objectId] || messageObj.text === undefined) {

//   } else {
//     var element = $('<div>' + messageObj.username + 'says: ' + messageObj.text + '</div>');
//     $('#chats').append(element);    
//     app.messageIDs[messageObj.objectId] = messageObj.text;
//     console.log(messageObj);
//   }

// };

//addMessage will append a message to the dom
app.addMessage = function(messageObj) {
  //console.log(messageObj);
  //if its an html tag at all
    //supress, don't push to messageObj
  //else
    //push to message obj
    //if its in our current chat room
      //display it

  if (!app.findEvil(messageObj)) {
    if (app.messageIDs[messageObj.objectId] || !messageObj.text) {
    } else {
      if (messageObj.roomname === app.roomname) {
        var element = $('<div><a class=' + messageObj.username + '>' + messageObj.username + '</a>' + ': ' + messageObj.text + '</div>');
        element.addClass('friend');
        app.addHandler.call(element);
        $('#chats').prepend(element);      
      }
      if (app.rooms.indexOf(messageObj.roomname) === -1) {
        //if roomname doesn't exist, create new one
        app.rooms.push(messageObj.roomname);
        app.addRoom(messageObj.roomname);
      }
      app.messageIDs[messageObj.objectId] = messageObj;
      //console.log(messageObj);
    }
  }

  // if (messageObj.username) {
  //   messageObj.username = messageObj.username.replace(/\s/g, '_');
  //   messageObj.username = messageObj.username.replace(/[^a-z0-9]/gi, '');    
  // }


  // if (messageObj.text && messageObj.text.match(/<(.*)>/gi)) {
  //   //console.log('User:', messageObj.username, 'Message:', messageObj.text);
  // } else if (messageObj.username && messageObj.username.match(/<(.*)>/gi)) {
  //   //console.log('User:', messageObj.username, 'Message:', messageObj.text);
  // } else if (app.messageIDs[messageObj.objectId] || !messageObj.text) {
  // } else {
  //   if (messageObj.roomname === app.roomname) {
  //     var element = $('<div><a class=' + messageObj.username + '>' + messageObj.username + '</a>' + ': ' + messageObj.text + '</div>');
  //     element.addClass('friend');
  //     app.addHandler.call(element);
  //     $('#chats').prepend(element);      
  //   }
  //   if (app.rooms.indexOf(messageObj.roomname) === -1) {
  //     //if roomname doesn't exist, create new one
  //     app.rooms.push(messageObj.roomname);
  //     app.addRoom(messageObj.roomname);
  //   }
  //   app.messageIDs[messageObj.objectId] = messageObj;
  //   //console.log(messageObj);
  // }
};

app.findEvil = function(messageObj) {
  var bool = false;

  if (messageObj.username) {
    messageObj.username = messageObj.username.replace(/\s/g, '_');
    messageObj.username = messageObj.username.replace(/[^a-z0-9]/gi, '');    
  }

  if (messageObj.text && messageObj.text.match(/<(.*)>/gi)) {
    bool = true;
  }

  if (messageObj.username && messageObj.username.match(/<(.*)>/gi)) {
    bool = true;
  }
  if (messageObj.roomname && messageObj.roomname.match(/<(.*)>/gi)) {
    bool = true;
  }


  return bool;

};

app.addHandler = function() {
  $(this).on('click', function(event) {
    var classes = this.children[0].className.split(' ');
    var uName;
    classes.forEach(function(oneClass) {
      if (oneClass !== 'friends') {
        uName = oneClass;
      }
    });
    // $('a.' + uName).toggleClass('friends');
    $('.' + uName).toggleClass('friends');
    app.addFriend(uName);
  });
};

app.addFriend = function(name) {
  var index = app.friends.indexOf(name);
  if (index === -1) {
    app.friends.push(name);
  } else {
    app.friends.splice(index, 1);
  }
};

app.repopulateRoom = function() {
  for (var message in app.messageIDs) {
    if (app.messageIDs[message].roomname === app.roomname) {
      var element = $('<div><a class=' + app.messageIDs[message].username + '>' + app.messageIDs[message].username + '</a>: ' + app.messageIDs[message].text + '</div>');
      element.addClass('friend');
      if (app.friends.indexOf(app.messageIDs[message].username) !== -1) {
        debugger;
        $(element.children()[0]).addClass('friends');
      }
      app.addHandler.call(element);
      $('#chats').prepend(element);    
    }
  }
};


//fetch will get a message object from the server
app.fetch = function() {

  $.ajax({
    url: app.server,
    success: function(obj) {
      obj.results.forEach(function(oneMessage) {
        app.addMessage(oneMessage);
      });
    },
    error: function() { console.log('GET request has failed'); },
    type: 'GET'

  });
  
};

//initializes the app
app.init = function() {

  $(document).ready(function() {
    // add click handler for submit button
    $('#send .submit').off().on('click', function(event) {
      event.preventDefault();
      app.handleSubmit();
    });

    // $('.submit').off().on('submit', function(event) {
    //   event.stopPropagation();
    //   app.handleSubmit();
    // });

    //add click handler for adding rooms
    $('#allRooms .addRoomSubmit').on('click', function(event) {
      event.preventDefault();
      app.addRoom($('#addRoom').val());
    });

    //add click handler for changing rooms
    $(document).on('change', '#roomSelect', function(event) {
      app.clearMessages();
      app.roomname = $(this).val();
      app.repopulateRoom();
    });
    //$()

    setInterval(app.fetch, 1000);
  });
};

app.send = function(messageObj) {

  $.ajax({
    type: 'POST',
    url: app.server,
    data: JSON.stringify(messageObj),
    contentType: 'application/json',
    success: function() { console.log('Send was a success:' + messageObj.username); },
    error: function(data) { console.log('Sending has failed', data); }
  });
};

//clear messages from the dom
app.clearMessages = function() {
  $('#chats').html('');
};

//add a room to the dom
app.addRoom = function(roomName) {
  
  var bool = false;
  $('option').each(function(child) {
    if ($(this).text() === roomName) {
      bool = true;
    }
  });

  if (!bool) {
    var newRoom = $('<option value=' + roomName + '>' + roomName + '</option>');
    $('#roomSelect').append(newRoom);
  }
};


app.handleSubmit = function() {
  var nextMessage = {};
  nextMessage.text = $('#send #message').val();
  nextMessage.username = window.location.search.split('=')[1];
  nextMessage.roomname = app.roomname;

  app.send(nextMessage); 
};

app.init();




