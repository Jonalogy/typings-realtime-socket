var mock = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';
mock = mock.split('');

$(document).ready(()=>{
  // Socket routes
    var socket = io();
    console.log(socket)

    socket.on('incomer',(data)=>{ // New user prompt
      $('#messages').append($('<li>').text(`>>Tada , ${data.welcome}`));
    })

    socket.on('chat message', function(msg){
      $('#messages').append($('<li>').text(msg));
    });

    socket.on('keydown', function(note){
        $('#competitors').append($('<span>',{keyId:`${note.key}`}).text(note.key));
    });

    socket.on('ctrlKey', function(ctrl){
      console.log(`ctrl:, ${ctrl}`)
      if(ctrl.key==8){
        $('#competitors span').last().remove();
      } else if (ctrl.key==32) {
        $('#competitors').append($('<span>',{keyId:`_`}).text('_'));

      }
    });

  // Event Listeners
    $('#get_user').click(()=>{
      console.log(`hello, ${$('#username').val()}`)
    })

    $(document).keypress((event)=>{
      var keynote = event.key;
      if (event.key!='Enter'){
        socket.emit('keydown', keynote);
        var collect = $('#myTrack').text()
        $('#myTrack').text(collect + event.key);
        // $('#myTrack').append($('<span>',{keyId:`${event.key}`}).text(event.key));
      }
    })

    $(document).keydown((event)=>{
      if(event.keyCode==8){ //backspace
        socket.emit('ctrlKey', event.keyCode);
        $('#myTrack span').last().remove();
      }else if(event.keyCode==32){ //space key
        event.preventDefault();
        socket.emit('ctrlKey', event.keyCode);
        var collect = $('#myTrack').text()
        $('#myTrack').text(collect + ' ');
        // $('#myTrack').append($('<span>',{keyId:`_`}).text('_'));
      }
    })

    $('form').submit(function(){
      socket.emit('chat message', $('#m').val());
      $('#m').val('');
      return false;
    });

 // Logic
    builder(mock)

}) //End of DOM content loaded


function builder(data) {
  n = mock.length
  for(i=0; i<n; i++ ){
    var a = $('<span>').text(mock[i]);
    $('#track').append(a);
  }//end for()
}
