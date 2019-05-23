var socket = io.connect('http://localhost:80');

var data_current = []
myid = "";

socket.emit("getMyId");
socket.on("myId",(data)=>{$("#myid").text("My Id: " + data); myid=data;})

socket.on("deletePlayerCurrent",()=>{
	$("#vid1").remove();
	socket.emit("deleteOk");
});
socket.on("currentVideo",(data)=>{
	console.log(data);
	if(data["id"] == socket.id){
		var player_ = '<video id="vid1" class="video-js vjs-default-skin" autoplay width="648" height="528" data-setup=\'{ "techOrder": ["youtube"], "sources": [{ "type": "video/youtube", "src": "' + data["data"]["src"] + '"}], "youtube": { "start": ' + data["data"]["seconds"] + ' } }\'  ></video>';
		console.log(player_);
	$('#player').append(player_);
	$("#ownerId").text(data["data"].owner);
}
});


setInterval(()=>{
	socket.emit("tick",data_current);
},1000);

socket.on("response",(data)=>{
	console.log(data['connections']);
	$("#users").text("Users Connected (" + data['connections'] + ")");
	$("#timerVideo").text( Math.floor(data["seconds_video"] / 60) + ":" + data["seconds_video"] + " /5minutos Restantes..");
});

socket.on("responseTick",()=>{socket.emit("tickUpdated")});
var urlResult;
$("#btnSendVideo").click(()=>{
	 urlResult = $("#urlVideo").val();
	 socket.emit("FilaAdd",{id:socket.id,url:urlResult});
	 console.log(socket.id);
});
