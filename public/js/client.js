var mock = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';
mock = mock.split('');
var n = mock.length;
var keystrokes = 0;

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
        $('#competitors').append($('<div>',{class:'char', keyId:`${note.key}`}).text(note.key));
    });

    socket.on('ctrlKey', function(ctrl){
      console.log(`ctrl:, ${ctrl}`)
      if(ctrl.key==8){//backspace
        $('#competitors div').last().remove();
      } else if (ctrl.key==32) {
        $('#competitors').append($('<div>',{class:'char space', keyId:`_`}).text('_'));
      }
    });

  // Event Listeners
    $('#get_user').click(()=>{
      console.log(`hello, ${$('#username').val()}`)
    })


    $(document).keypress((event)=>{
      keystrokes ++;
      var keynote = event.key;
      if (event.key!='Enter'){
        socket.emit('keydown', keynote);
        console.log(justify())
        $('#myTrack').append($('<div>',{class:'char'}).text(event.key));
      }
    });

    $(document).keydown((event)=>{
      if(event.keyCode==8){ //backspace
        keystrokes --;
        console.log(`Keydown: ${event.key}`);
        socket.emit('ctrlKey', event.keyCode);
        $('#myTrack div').last().remove();
      }else if(event.keyCode==32){ //space key
        event.preventDefault();
        keystrokes ++;
        console.log(`Keydown: Space`);
        socket.emit('ctrlKey', event.keyCode);
        // var collect = $('#myTrack').text()
        $('#myTrack').append($('<div>',{class:'char space'}).text('_'));
        // $('#myTrack').append($('<span>',{keyId:`_`}).text('_'));
      } else if (event.keyCode==13) {
        console.log(`Keydown: ${event.key}`);
        socket.emit('ctrlKey', event.keyCode);
        // var collect = $('#myTrack').text()
        // $('#myTrack').text(collect + ' ');
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

function builder() {
  for(i=0; i<n; i++ ){
    var a = $('<span>').text(mock[i]);
    $('#track').append(a);
  }//end for()
}
function justify() {
      console.log($(window).width(), $('#rack').width())
      var widthDiff = ($('#track').width()) - ($('#myTrack').width())
      console.log("Between #container & #myTrack ", widthDiff)
      console.log('Next char:', mock[keystrokes])

      var count = 0
      for(i=keystrokes; i<n; i++){
        count ++;
        if(mock[i]===' ') {
          console.log(`Next word is ${count} chars away`);
          var nextWord = 0;

          for (y=(i+1); y<n; y++){
              if(mock[y]===' '){
                console.log(`Next word is ${nextWord} chars long`);
                count = 0;
                if((nextWord*34)>widthDiff){
                  return  nextWord
                } else {
                  return false
                }
              } //(mock[y]===' ')
            nextWord ++;
          }//end for()
        }//end if()
      }//end for()

    }//END justify()
