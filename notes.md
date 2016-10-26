#### Socket.IO is composed of two parts:

* A server that integrates with (or mounts on) the Node.JS HTTP Server: socket.io
* A client library that loads on the browser side: socket.io-client

#### The Main Idea
The main idea behind Socket.IO is that you can send and receive any events you want, with any data you want. Any objects that can be encoded as JSON will do, and binary data is supported too.

#### Emitting Events

#### Broadcasting

In order to send an event to everyone, Socket.IO gives us the io.emit:

> `io.emit('some event', { for: 'everyone' });`

If you want to send a message to everyone except for a certain socket, we have the broadcast flag:

> `io.on('connection', function(socket){
  socket.broadcast.emit('hi');
});`

#### Gloassary
1. `io.on`
2. `io.emit('some event', { for: 'everyone' });`
3. `socket.on`
4. `socket.emit`
5. `socket.broadcast.emit`
