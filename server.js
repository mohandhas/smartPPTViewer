var express = require('express');
var app = new express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

server.listen(3000);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist/'));
app.use('/assets/jquery', express.static(__dirname + '/node_modules/jquery/dist/'))

var users = [];

io.on("connection", function(socket){

  socket.emit('welcome','Socket #'+ socket.id);
  
  socket.on("user_onboard", function(user)
  {
    users.push({id : socket.id, name : user.name});   
    socket.join(socket.id); 
    io.sockets.emit("refresh_users", users);   //  socket.broadcast.emit will emit all clients except this connected socket
  });

  socket.on("slide_update", function (slideIndex) {
    socket.broadcast.emit("slide_update", slideIndex);
  });

  socket.on("chat_msg", function(chatObj){
    
    socket.in(chatObj.to).emit( { from : users.filter(x=>x.id=== socket.id),  msg :  chatObj.msg}); 
  });

  socket.on("disconnect", function(data)
  {
    users = users.filter(x=>x.id!== socket.id);
    io.sockets.emit("refresh_users", users);  
  });  

});



