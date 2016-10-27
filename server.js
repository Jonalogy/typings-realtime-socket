var morgan = require('morgan');
var express = require('express');
var path = express('path')
const port = process.env.PORT || 4200

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
    var roomNum = 0; var members = {};
    var allRooms = {};

    io.on('connection',function(socket){
      // Gobal Sockets
        socket.on('nickname', (nickname)=>{
          masterList[socket.id] = nickname;
          socket.broadcast.emit('incomer',{welcome:`${nickname} is now online!`});
          console.log(masterList)
        });

        socket.on('globalMsg', (msg)=>{
          console.log('message: ' + msg);
          io.emit('globalMsg', msg);
        });

        socket.on('disconnect',()=>{
          delete masterList[socket.id]; //Removes user from masterList list
          console.log('user disconnected');
        })

      // Room Sockets
        socket.on('joinGame', (nickname)=>{
            if(Object.keys(members).length < 2 ){
              fillRoom()
            } else {
              roomNum ++;
              allRooms[`room${roomNum}`] = members;
              console.log('!!! Overflow !!!', ` Starting room${roomNum}`);
              console.log('allRooms{} =',allRooms);
              members = {};
              console.log('clear members{} =', members);
              fillRoom()
            }

            // console.log(io.sockets.adapter.rooms)
            function fillRoom(){
              members[nickname] = [ nickname , socket.id, `room${roomNum}` ];

              console.log(`>>>>>Total members in room${roomNum} = `,Object.keys(members).length)

              console.log('>>>members',members);

              socket.join('room' + roomNum);
              io.to(`room${roomNum}`).emit('roomEntry', { room:`room${roomNum}`, members: members } );
              console.log(`>>> `,io.nsps['/'].adapter.rooms)
            }

        });

        socket.on('quitWaiting', (room)=>{
          socket.leave(room);
          console.log(`left ${room}!`)
          console.log(`>>> `,io.nsps['/'].adapter.rooms)
        });

        socket.on('relayStart',(room)=>{
          io.to(room).emit('relayStart',true)
        });

        socket.on('keydown', (note)=>{
          socket.broadcast.emit('keydown', {key: note});
        });

        socket.on('ctrlKey', (note)=>{
          console.log('ctrlKey: ' + note)
          socket.broadcast.emit('ctrlKey', {key: note});
        });

    });

http.listen(port,()=>{
  console.log('Typings hosted on localhost:4200');
})
