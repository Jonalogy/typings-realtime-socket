var morgan = require('morgan');
var express = require('express');
var path = express('path')

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// this sets a static directory for the views
app.use(morgan('combined'))
app.use(express.static('public'));

//---Controllers
    app.get('/', function(req, res){
      res.sendFile('index.html');
    });

//---Sockets
    var masterList = {};
    var roomNum = 0; var members = [];
    var allRooms = {};

    io.on('connection',function(socket){
    // Gobal Sockets
      socket.on('nickname',(nickname)=>{
        masterList[socket.id] = nickname;
        socket.broadcast.emit('incomer',{welcome:`${nickname} is now online!`});
        console.log(masterList)
      });

      socket.on('globalMsg', function(msg){
        console.log('message: ' + msg);
        io.emit('globalMsg', msg);
      });

    // Room Sockets
      socket.on('joinGame',()=>{
          console.log(">>>>>Socket.id",socket.id)
          if(members.length <= 2){
            members.push(socket.id); console.log(members)
            socket.join('room' + roomNum);
          } else {
            allRooms[`room${roomNum}`] = members
            roomNum ++; members = [];
            console.log('!!! Overflow !!!', ` Starting room${roomNum}`)
            console.log(allRooms);
          }

          console.log(io.sockets.adapter.rooms)

      });

      socket.on('keydown', function(note){
        socket.broadcast.emit('keydown', {key: note});
      });

      socket.on('ctrlKey', function(note){
        console.log('ctrlKey: ' + note)
        socket.broadcast.emit('ctrlKey', {key: note});
      });

      socket.on('disconnect',()=>{
        delete masterList[socket.id]; //Removes user from masterList list
        console.log('user disconnected');
      })
    });

http.listen(4200,()=>{
  console.log('Typings hosted on localhost:4200');
})
// app.listen(3000,()=>{
//   console.log('Listening on localhost:3000');
// })
