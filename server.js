var morgan = require('morgan');
var express = require('express');
var path = express('path')

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// this sets a static directory for the views
app.use(morgan('combined'))
app.use(express.static('public'));


app.get('/', function(req, res){
  res.sendFile('index.html');
});

io.on('connection',function(socket){

  socket.broadcast.emit('incomer',{welcome:'New User Joined!'});

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('keydown', function(note){
    socket.broadcast.emit('keydown', {key: note});
  });

  socket.on('ctrlKey', function(note){
    console.log('ctrlKey: ' + note)
    socket.broadcast.emit('ctrlKey', {key: note});
  });

  socket.on('disconnect',()=>{
    console.log('user disconnected');
  })
});

http.listen(4200,()=>{
  console.log('Typings hosted on localhost:4200');
})
// app.listen(3000,()=>{
//   console.log('Listening on localhost:3000');
// })
