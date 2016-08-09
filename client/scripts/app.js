// YOUR CODE HERE:

app = {};
app.messageIDs = {};
app.server = 'https://api.parse.com/1/classes/messages';
app.roomname = 'lobby';

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
  //debugger;
  if (messageObj.text && messageObj.text.match(/<(.*)>/gi)) {
    //console.log('User:', messageObj.username, 'Message:', messageObj.text);
  } else if (messageObj.username && messageObj.username.match(/<(.*)>/gi)) {
    //console.log('User:', messageObj.username, 'Message:', messageObj.text);
  } else if (app.messageIDs[messageObj.objectId] || !messageObj.text) {
  } else {
    var element = $('<div>' + messageObj.username + ' says: ' + messageObj.text + '</div>');
    $('#chats').prepend(element);    
    app.messageIDs[messageObj.objectId] = messageObj.text;
    console.log(messageObj);
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

    //add click handler for submit button
    $('#send .submit').on('click', function(event) {
      event.preventDefault();
      app.handleSubmit();    
    });

    //add click handler for adding rooms
    $('#roomSelect .addRoomSubmit').on('click', function(event) {
      event.preventDefault();
      app.addRoom($('#addRoom').val());
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
  //check if room exists already
  //if (document.getElementsByClassName(1)
  //make another room with a name that matches roomName
  var newRoom = $('<div class=' + roomName + '>' + roomName + '</div>');
  $('#roomSelect').append(newRoom);
};

app.handleSubmit = function() {
  var nextMessage = {};
  nextMessage.text = $('#send #message').val();
  nextMessage.username = window.location.search.split('=')[1];
  nextMessage.roomname = 'lobby';

  app.send(nextMessage); 
};

app.init();

