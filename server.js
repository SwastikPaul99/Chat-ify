/*const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");*/

/*const createAdapter = require("@socket.io/redis-adapter").createAdapter;
const redis = require("redis");
require("dotenv").config();
const { createClient } = redis;*/
const {addmessage,getmessage,deletemessage}=require("./save");
const fs=require('fs');
const formatMessage = require("./messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./users");
const moment = require('moment');

//const app = express();
//const server = http.createServer(app);

const io = require('socket.io')(8000);


/*var mysql = require("mysql");
var connection=mysql.createConnection({
  host:"localhost",
  user:"root",
  password:"",
  database:"mydb"
});

connection.connect(function(error){
  connection.query("CREATE DATABASE IF NOT EXISTS mydb", function (err, result) {
  //if (err) throw err;
  console.log("Database created");
  });
  var sql = "CREATE TABLE chat (name VARCHAR(255), time DATETIME, message VARCHAR(65535))";
  connection.query(sql, function (err, result) {
  //if (err) throw err;
  console.log("Table created");
  });
});*/

// Set static folder
//app.use(express.static(path.join(__dirname, "public")));

const botName = "Chat-ify";

/*(async () => {
  pubClient = createClient({ url: "redis://127.0.0.1:6379" });
  await pubClient.connect();
  subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));
})();*/

console.log('Server running at port 8000');

const messages=[];

// Run when client connects
io.on("connection", (socket) => {
  //console.log(io.of("/").adapter);
  socket.on("joinRoom", ({ username, room }) => {
    if(getRoomUsers(room).length<2){
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  }
  else{
    socket.emit('login');
  }
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    var message=formatMessage(user.username,msg);
    addmessage(user.room,user.username,msg);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
    //messages.push(message);
    
    
    //save message in database
    /*connection.connect(function(err){
    var sql = "INSERT INTO chat (name,time,message) VALUES ('"+message.username+"','"+message.time+"','"+message.text+"')";
    connection.query(sql, function (err, result) {
      //if (err) throw err;
      console.log("1 record inserted");
    });*/
  });

  socket.on("save",(room)=>{
    /*const user=getCurrentUser(socket.id);
    var message=formatMessage(user.username,msg);*/
    const messages=getmessage(room);
    var str=`\n-----------------------------------------------------\n\nNew Session Started at time => ${moment().format('h:mm a')}\n`;
    var i=0;
    while(i<messages.length){
      str=str.concat(`${messages[i].username} : ${messages[i].text}\n`);
      ++i;
    }
    //str.concat(`\n-----------------------------------------------------\n\n`);
    fs.appendFileSync(`${room}.txt`,str,(err)=>{
      if(err){}
      //throw err;
    });
    console.log("OK");

  });

  // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });

      if(getRoomUsers(user.room).length==0)
      deletemessage(user.room);

      //console.log(messages);
      
      //messages.length=0;
    }
    /*connection.connect(function(err){
      connection.query("SELECT * FROM chat", function (err, result, fields) {
        //if (err) throw err;
        console.log(result);
        });
    })*/
    
  });

});

/*const PORT = process.env.PORT || 8000;

io.listen(PORT, () => console.log(`Server running on port ${PORT}`));*/
// console.log('Server running at port 8000');