var terrain = 'Lorem ipsum'; terrain = terrain.split('');
var n = terrain.length;
var keystrokes = 0;
var round = false

var roomAt = null;

$(document).ready(()=>{
    var nickname = '';
    $('#nicknameModal').modal('show');

  //---Socket routes
    var socket = io();
    console.log(socket)

    socket.on('incomer',(data)=>{ // New user prompt
      console.log(`${data.welcome}`);
      $('#messages').append($('<li>').text(data.welcome));
    })

    socket.on('globalMsg', function(msg){
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

    // Game room
    socket.on('roomEntry',(data)=>{
      var pax = Object.keys(data.members).length;
      console.log(`Joined Room with with ${pax - 1} other members`)

      roomReady(pax);

      $('#paxCount').text(pax);

      $('#previewPlayerList').remove();
      $('<ul>',{id: 'previewPlayerList'}).appendTo($('#previewBoard'));
      for(var player in data.members){
        $('<li>').text(player).appendTo($('#previewPlayerList'))
      }

      roomAt = data.members[nickname][2] //recording current room
    })

    socket.on('relayStart', (start)=>{
      if(start === true){
        console.log('Game has started!')

        $('#startGame').prop('disabled', true)
        $('#previewPlayerList').remove();

        var seconds = 3;
        var timer = setInterval(countdown,1000);

        function countdown() {
          if(seconds>0){
            $('#secCountdown').remove();
            ($('<h1>',{id:'secCountdown'}).text(`${seconds}...`)).appendTo($('#previewBoard'))
            seconds--;
          } else {
            //Any click start action will start for all players in room
            clearInterval(timer);
            $('#waitingRoom').modal('hide');
          }
        }      }
    });

  //---Event Listeners
    $('#saveNickname').click(()=>{
      console.log(`round = ${round}`)
      $('#userNickname').text()
    });

    $('#get_user').click(()=>{
      console.log(`hello, ${$('#username').val()}`)
    });

    $('#joinGame').click(()=>{
      socket.emit('joinGame', nickname )
      $('#waitingRoom').modal('show');
    });

    $('#quitWait').click(()=>{
      socket.emit('quitWaiting',roomAt);
      roomAt = null;
    });

    $('#startGame').click(()=>{
      console.log('Game has started!')

      $('#startGame').prop('disabled', true)
      $('#previewPlayerList').remove();

      socket.emit('relayStart',roomAt);

      var seconds = 3;
      var timer = setInterval(countdown,1000);

      function countdown() {
        if(seconds>0){
          $('#secCountdown').remove();
          ($('<h1>',{id:'secCountdown'}).text(`${seconds}...`)).appendTo($('#previewBoard'))
          seconds--;
        } else {
          //Any click start action will start for all players in room
          clearInterval(timer);
          $('#waitingRoom').modal('hide');
        }
      }

    });
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

 //---Forms
    $('#formNickname').submit((event)=>{
      event.preventDefault();
      $('#userNickname').text(`Competing as ${$('#myNickname').val()}`);
      nickname = $('#myNickname').val()
      $('#myNickname').val('');
      $('#nicknameModal').modal('hide');
      console.log(`round = ${round}`)
      round = true
      socket.emit('nickname', nickname)
    });

    $('#chatForm').submit((event)=>{
      event.preventDefault();
      socket.emit('globalMsg', $('#chatInput').val());
      $('#chatInput').val('');
    });

 //---Logic
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
      if((event.key !== terrain[(keystrokes)]) && round === true){
        document.getElementById('uhohAudio').play()
      }
    }
    function roomReady(pax) {
      if (pax == 3 ){
        $('#startGame').prop('disabled', false)
      }
    }
