const express = require('express');
var app = express();
var server = app.listen(80,()=>{
	console.log("Server OK");
});

var Fila = []

counterUpdate = 0;

var server_info = {
	connections: 0,
	status: "playingvideo",
	seconds_video: 0,
	tick: true
}

var current_video = {
	src: "",
	seconds: 0,
	playing: false,
	owner: ""
}

var io = require('socket.io')(server);

app.use(express.static('./public'));

io.on("connection",(socket)=>{
socket.emit("myId",socket.id);
			console.log(server_info);

  server_info.connections = server_info.connections +1;
	if(current_video["playing"] == true){
	io.emit("currentVideo",{data:current_video,id:socket.id});
	}

socket.on("FilaAdd",(data) => {
	Fila.push(data);
});


socket.on("tickUpdated",()=>{server_info.tick = true; console.log("tick updated");});
socket.on("disconnect",()=>{
	if(socket.id == current_video.owner){
		if(current_video.playing == true){
			current_video.playing = false;
			console.log(current_video);
		}
	}
	server_info.connections = server_info.connections -1;
});
socket.on("deleteOk",()=>{
	io.emit("currentVideo",{data:current_video,id:socket.id});
	if(counterUpdate >= server_info.connections || server_info.connections-1 <= counterUpdate){
		server_info.status = "playingvideo";
		counterUpdate = 0;
	}
	if(counterUpdate < server_info.connections){
	counterUpdate = counterUpdate +1;
}else{
	server_info.status = "playingvideo";
	counterUpdate = 0;
}
});
socket.on("tick",()=>{
if(server_info.status == "updateUsers"){
	io.emit("deletePlayerCurrent");
}
if(current_video.playing == false){
	if(Fila[0] != undefined){
	current_video = {
		src: Fila[0].url,
		seconds: 0,
		playing: true,
		owner: Fila[0].id
	};
	counterUpdate = 0;
	server_info.status = "updateUsers";
}
}

	if(current_video["seconds"]>=100){
		Fila = Fila.splice(0,0);
		current_video.playing = false;
		server_info.status = "updateUsers";
	}else{
		if(server_info.tick == true){
			if(socket.id == current_video.owner){
			current_video["seconds"] +=1;
		}
		}
}
		  server_info.seconds_video = current_video["seconds"];
	io.emit("response",server_info);
});
});
