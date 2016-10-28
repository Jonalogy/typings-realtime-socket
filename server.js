var morgan = require('morgan');
var express = require('express');
var path = express('path')
const port = process.env.PORT || 4200

var app = express();
var http = require('http').Server(app);


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
    var io = require('socket.io')(http);


    io.on('connection',function(socket){

      // Gobal Sockets
        socket.on('nickname', (nickname)=>{
          masterList[socket.id] = [nickname, null];
          socket.broadcast.emit('incomer',{welcome:`${nickname} is now online!`});
          console.log(`${nickname} added to masterList{}`)
          console.log(`masterList{} => `, masterList)
        });

        socket.on('globalMsg', (msg)=>{
          console.log('message: ' + msg);
          io.emit('globalMsg', msg);
        });

        socket.on('disconnect',()=>{
          var user = masterList[socket.id]
          if (user != undefined){
            console.log( user[0] , ' disconnected'  );
            delete masterList[socket.id]; //Removes user from masterList list
            console.log(`masterList{} => `, masterList)
          }
        })

      // Room Sockets
        socket.on('joinGame', (nickname)=>{

            user = masterList[socket.id]
            user[1] = (`room${roomNum}`)

            console.log(`${nickname} joined room${roomNum}`)
            console.log('masterList{} => ', masterList)
            fillRoom()
            if(Object.keys(members).length === 3 ){
              allRooms[`room${roomNum}`] = members;
              roomNum ++;
              console.log('!!! Room Full !!!', ` Starting room${roomNum}`);
              console.log('allRooms{} => ',allRooms);
              members = {};
              console.log('clear members{} => ', members);
            }

            // console.log(io.sockets.adapter.rooms)
            function fillRoom(){
              members[nickname] = [ nickname , socket.id, `room${roomNum}` ];

              console.log(`>>>>>Total members in room${roomNum} = `,Object.keys(members).length)

              // console.log('>>>members',members);

              socket.join('room' + roomNum);
              io.to(`room${roomNum}`).emit('roomEntry', { room:`room${roomNum}`, members: members } );
              // console.log('>>>',io.nsps['/'].adapter.rooms[`room${roomNum}`].sockets)
            }

        });

        socket.on('quitWaiting', (room)=>{
          var user = masterList[socket.id]
          console.log(user)

          if(user == undefined){
            io.to(room).emit('quitWaiting', masterList[socket.id]);
            socket.leave(room);
            console.log(`left ${room}!`)
            console.log(`>>> `,io.nsps['/'].adapter.rooms)
          }

        });

        socket.on('relayStart',(room)=>{
          io.to(room).emit('relayStart',allRooms[room])
        });

        socket.on('keydown', (note)=>{
          var data = {
            player: masterList[socket.id],
            key: note
          }

          socket.broadcast.emit('keydown', data);
        });

        socket.on('ctrlKey', (keyCode)=>{
          console.log('ctrlKey: ' + keyCode)

          var data = {
            player: masterList[socket.id],
            key: keyCode
          }
          socket.broadcast.emit('ctrlKey', data);
        });

        socket.on('winner',(room)=>{
          // console.log('Refer to socket',io.of('/').connected[socket.id])

          io.to(room).emit('winner',masterList[socket.id])

          var inRoom = io.nsps['/'].adapter.rooms[`${room}`].sockets

          for(var player in inRoom){
            (io.of('/').connected[player]).leave(room)
          }

          delete allRooms[`${room}`];

          io.emit('winToGlobe', masterList[socket.id]);
        })

    });

http.listen(port,()=>{
  console.log('Typings hosted on localhost:4200');
})
