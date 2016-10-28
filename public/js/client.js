var terrain = 'Lorem ipsum dolor sit amet';

terrain = terrain.split('');
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

    socket.on('keydown', function(data){
      console.log('>>Data ', data)
        $(`#${data['player'][0]} :last`).css('border-color','rgba(0, 0, 0, 0)').removeClass('lastChar')

        $(`#${data['player'][0]}`).append($('<div>',{class:'competitor char lastChar'}).text(`${data['key']}`));
    });

    socket.on('ctrlKey', function(ctrl){
      console.log(`ctrl:, ${ctrl}`)
      if (ctrl['key'] == 32) {
        $(`#${ctrl['player'][0]} :last`).css('border-color','rgba(0, 0, 0, 0)').removeClass('lastChar')

        $(`#${ctrl['player'][0]}`).append($('<div>',{class:'char space competitor lastChar'}).text('_'));
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
        $('<li>',{id: `${player}`}).text(player).appendTo($('#previewPlayerList'))
      }

      roomAt = data.members[nickname][2] //recording current room
    })

    socket.on('quitWaiting',(player)=>{
      console.log(player[0] + ' left the room')
      $(`#${player}`).remove()
      var pax = ($('#paxCount').text()) - 1;
      $('#paxCount').text(pax);
    });

    socket.on('relayStart', (roomPlayers)=>{
        console.log('Game has started!')

        $('#startGame').prop('disabled', true)
        $('#previewPlayerList').remove();

        for(var player in roomPlayers){
          if (player != nickname){
            $('<div>',{class:'competitors', id: `${player}`}).appendTo($('#container'));
          }
        }

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
            $('#secCountdown').remove()
          }
         }

        round = true
    });

    socket.on('winner',(player)=>{
      round = false; keystrokes = 0;
      $('#messages').append($('<li>').text(`${player[0]} won the race!`));
    })

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
          $('#secCountdown').remove()
        }
      }

      round = true;
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
          $('#myTrack :last').css('border-color','rgba(0, 0, 0, 0)').removeClass('myLastChar')

          $('#myTrack').append($('<div>',{class:'char myLastChar'}).text(event.key));
        } //END if (event.key!='Enter')
        if (keystrokes === n) {
          socket.emit('winner', roomAt)
          round = false; keystrokes = 0;
        }
      }//END if(event.key==terrain[keystrokes])
    });

    //Control Keys
    $(document).keydown((event)=>{
      if(event.keyCode==32){ //space key
        event.preventDefault();
        if (round == true) { charNow() }

        if(terrain[keystrokes]===' ' && round == true){
          keystrokes ++;
          console.log(`Keydown: Space`);
          socket.emit('ctrlKey', event.keyCode);

          $('#myTrack :last').css('border-color','rgba(0, 0, 0, 0)').removeClass('myLastChar')

          $('#myTrack').append($('<div>',{class:'char space myLastChar'}).text('_'));
        }
        if (keystrokes === n) {
          socket.emit('winner', roomAt)
          round = false; keystrokes = 0;
        }
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
