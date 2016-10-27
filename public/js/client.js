var terrain = 'Lorem ipsum'; terrain = terrain.split('');
var n = terrain.length;
var keystrokes = 0;
var round = false

$(document).ready(()=>{
    $('#nicknameModal').modal('show')
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
    $('#saveNickname').click(()=>{
      console.log(`round = ${round}`)
      $('#userNickname').text()
    });

    $('#formNickname').submit(()=>{
        $('#userNickname').text(`Competing as ${$('#myNickname').val()}`)
        $('#myNickname').val('');
        $('#nicknameModal').modal('hide')
        round = true
        console.log(`round = ${round}`)
      });

    $('#get_user').click(()=>{
      console.log(`hello, ${$('#username').val()}`)
    })
    //Printable Keys
    $(document).keypress((event)=>{
      if (round == true) { charNow() }

      if((event.key===terrain[keystrokes]) && round == true){
        keystrokes ++;
        console.log(justify())
        var keynote = event.key;
        if (event.key!='Enter'){
          socket.emit('keydown', keynote);
          $('#myTrack').append($('<div>',{class:'char'}).text(event.key));
        } //END if (event.key!='Enter')
        if (keystrokes === n) { round = false }
      }//END if(event.key==terrain[keystrokes])
    });

    //Control Keys
    $(document).keydown((event)=>{
      // if(event.keyCode==8){ //backspace
      //   if(keystrokes>0) { keystrokes --; }
      //   // charNow()
      //   console.log(`Keydown: ${event.key}`);
      //   socket.emit('ctrlKey', event.keyCode);
      //   $('#myTrack div').last().remove();
      // }else
      if(event.keyCode==32){ //space key
        event.preventDefault();
        if (round == true) { charNow() }

        if(terrain[keystrokes]===' ' && round == true){
          keystrokes ++;
          console.log(`Keydown: Space`);
          socket.emit('ctrlKey', event.keyCode);
          $('#myTrack').append($('<div>',{class:'char space'}).text('_'));
        }
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
    trackBuilder(terrain)

}) //End of DOM content loaded

// R&D Repo

// Function Repo
    function trackBuilder() {
      for(i=0; i<n; i++ ){
        var charHolder
        if (terrain[i]===' '){
          charHolder= $('<div>',{class: 'track space'}).text('_');
        } else {
          charHolder= $('<div>',{class: 'track'}).text(terrain[i]);
        }
        $('#track').append(charHolder);
      }//end for()
    }
    function justify() {
          console.log($(window).width(), $('#rack').width())
          var widthDiff = ($('#track').width()) - ($('#myTrack').width())
          console.log("Between #container & #myTrack ", widthDiff)
          console.log('Next char:', terrain[keystrokes])

          var count = 0
          for(i=keystrokes; i<n; i++){
            count ++;
            if(terrain[i]===' ') {
              console.log(`Next word is ${count} chars away`);
              var nextWord = 0;

              for (y=(i+1); y<n; y++){
                  if(terrain[y]===' '){
                    console.log(`Next word is ${nextWord} chars long`);
                    count = 0;
                    if((nextWord*34)>widthDiff){
                      return  nextWord
                    } else {
                      return false
                    }
                  } //(terrain[y]===' ')
                nextWord ++;
              }//end for()
            }//end if()
          }//end for()
        }//END justify()
    function charNow() {
      console.log('CharNow -> ',terrain[(keystrokes)], `Keystrokes: ${keystrokes}`)
      if((event.key !== terrain[(keystrokes)])){
        console.log('Wrong Key!')
        document.getElementById('uhohAudio').play()
      }
    }
