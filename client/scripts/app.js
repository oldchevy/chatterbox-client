//The app object holds relevant global information,
//including cached messages
app = {};
app.messageIDs = {};
app.server = 'https://api.parse.com/1/classes/messages';
app.roomname = 'lobby';
app.rooms = [];
app.friends = [];
app.localUser = 'anonymous';


//addMessage will append a message to the dom, if all conditions are met,
//doing other rendering work along the way
app.addMessage = function(messageObj) {

  //Wrap everything in a check to see if the message object contains a script
  if (!app.findEvil(messageObj)) {

    //Suppress the adding if the message is already cached
    if (app.messageIDs[messageObj.objectId] || !messageObj.text) {
    } else {

      //Append a new element if the message is in the current chat room
      if (messageObj.roomname === app.roomname) {
        var element = $('<div><a class=' + messageObj.username + '>' + messageObj.username + '</a>' + ': ' + messageObj.text + '</div>');
        element.addClass('friend');
        app.addHandler.call(element);
        $('#chats').prepend(element);      
      }

      //Add a new roomname if it hasn't been seen before
      if (app.rooms.indexOf(messageObj.roomname) === -1) {
        app.rooms.push(messageObj.roomname);
        //Appending new option in HTML select elem
        app.addRoom(messageObj.roomname);
      }

      //Even if message isn't appended to DOM, cache it for refreshing purposes
      app.messageIDs[messageObj.objectId] = messageObj;
    }
  }
};



//Suppresses all XSS attacks through scripts sent by other users that are fetched from the server
//Note to self: just use jQuery.text() next time.. it stringifies to escape execution during DOM load
app.findEvil = function(messageObj) {
  //Suppress invalid usernames (no spaces or special chars)
  if (messageObj.username) {
    messageObj.username = messageObj.username.replace(/\s/g, '_');
    messageObj.username = messageObj.username.replace(/[^a-z0-9]/gi, '');    
  }
  //Returns true if any part of the object has an html tag in it
  return (messageObj.text && messageObj.text.match(/<(.*)>/gi)) || 
         (messageObj.username && messageObj.username.match(/<(.*)>/gi)) || 
         (messageObj.roomname && messageObj.roomname.match(/<(.*)>/gi));
};



//Adds a unique click handler to every messages username
//Is called from repopulateMessages and addMessage
//Operates on the jQuery DOM object that is instantiated then appended
app.addHandler = function() {
  
  $(this).on('click', function(event) {
    //Get the right class
    var classes = this.children[0].className.split(' ');
    var uName;
    classes.forEach(function(oneClass) {
      if (oneClass !== 'friends') {
        uName = oneClass;
      }
    });

    //Toggle styling and friends list
    $('.' + uName).toggleClass('friends');
    app.addFriend(uName);
  });
};



//Toggles the name given in the app.friends list
//Called in each username click handler in app.addHandler
app.addFriend = function(name) {
  var index = app.friends.indexOf(name);
  if (index === -1) {
    app.friends.push(name);
  } else {
    app.friends.splice(index, 1);
  }
};



//Makes a new messageObj and calls our send AJAX method
app.handleSubmit = function(event) {
  
  //Stops the page from refreshing? Supposedly
  event.preventDefault();

  var nextMessage = {
    text: $('#send #message').val(),
    username: app.localUser,
    roomname: app.roomname
  };

  app.send(nextMessage); 
};



//Refresh messages from our cached messages list
app.repopulateRoom = function() {
  //Visit each cached message
  for (var message in app.messageIDs) {
    //Only append messages for the current roomname
    if (app.messageIDs[message].roomname === app.roomname) {
      //Make the new tag and append it
      var element = $('<div><a class=' + app.messageIDs[message].username + '>' + app.messageIDs[message].username + '</a>: ' + app.messageIDs[message].text + '</div>');
      element.addClass('friend');

      //Re-render your current friends
      if (app.friends.indexOf(app.messageIDs[message].username) !== -1) {
        $(element.children()[0]).addClass('friends');
      }

      //Add the handler, and prepend to DOM
      app.addHandler.call(element);
      $('#chats').prepend(element);    
    }
  }
};



//clear messages from the dom (called in the roomChange event listener)
app.clearMessages = function() {
  $('#chats').html('');
};



//add a room to the dom, is called in addMessage (line 34)
app.addRoom = function(roomName) {
  
  //Double check if the room isn't already appended
  //Is this necessary?
  var bool = false;
  $('option').each(function(child) {
    if ($(this).text() === roomName) {
      bool = true;
    }
  });

  //Append the new option
  if (!bool) {
    var newRoom = $('<option value=' + roomName + '>' + roomName + '</option>');
    $('#roomSelect').append(newRoom);
  }
};


//fetch will get a message object from the server
app.fetch = function() {

  $.ajax({
    url: app.server,
    success: function(obj) {
      //Call addMessage on each message object
      obj.results.forEach(function(oneMessage) {
        app.addMessage(oneMessage);
      });
    },
    error: function() { console.log('GET request has failed'); },
    type: 'GET'
  });
  
};



//Send method wraps the AJAX send call
app.send = function(messageObj) {

  $.ajax({
    type: 'POST',
    url: app.server,
    data: JSON.stringify(messageObj),
    contentType: 'application/json',
    success: function() { console.log('Send was a success: ' + messageObj.username); },
    error: function(data) { console.log('Sending has failed', data); }
  });

};



//initializes the app
app.init = function() {

  //Wrap in a document ready listener
  $(document).ready(function() {

    app.localUser = window.location.search.split('=')[1];

    // add click handler for submit button
    $('#send .submit').off().on('click', app.handleSubmit);

    //add click handler for adding rooms
    $('#allRooms .addRoomSubmit').on('click', function(event) {
      event.preventDefault();
      app.addRoom($('#addRoom').val());
    });

    //add handler for changing rooms
    $(document).on('change', '#roomSelect', function(event) {
      app.clearMessages();
      app.roomname = $(this).val();
      app.repopulateRoom();
    });

    //Messages refresh every one second
    setInterval(app.fetch, 1000);
  });
};

app.init();




