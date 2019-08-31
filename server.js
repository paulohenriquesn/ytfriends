const express = require('express');
const server = express();
const cors = require('cors');
const apiKeyYoutube = "";
const axios = require('axios');

server.use(cors());
server.use(express.json());

const server_ = server.listen(8000,()=> {
    console.log("SERVER OK!");
});

//

var Rooms = [];

server.post('/sendvideo', (req,res) => {
    Rooms.map(room => {
        if(room.name == req.body.room){
            room.video.VideoId = req.body.videoId;
            async function getDuration(){ 
                const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${req.body.videoId}&part=contentDetails&key=${apiKeyYoutube}`);
                res.json({data:response.data,room});
            }
            getDuration();
        }
    })
    console.log('ROOMS');
    console.log(Rooms);
});

server.post('/getroominfo',(req,res) => {
    Rooms.map(room => {
        if(room.name == req.body.room){
            res.json(room);
        }
    });
});

server.post('/checkroom',(req,res) => {
    let verify = false;
    if(Rooms.length>0){
        Rooms.map(room => {
            if(room.name == req.body.room) {
                verify = true;
            }
        })
    }
    if(verify){
        res.json({result: "ok"});
    }else{
        res.json({result: "error"});
    }
});

server.post('/createroom',(req,res) => {
    let verify = true;
    if(Rooms.length>0){
        Rooms.map(room => {
            if(room.name == req.body.socketId) {
                verify = false;
            }
        })
    }
    if(verify){
       if(req.body.ip){
    Rooms.push({
        name:  req.body.socketId,
        video: {playing:false,CurrentSeconds:0,VideoEnd:0,VideoId: ''},
        host: req.body.ip   
    });
    res.json(Rooms);
}
}
});


const io = require('socket.io')(server_);

io.on('connection', (socket) => {
    socket.on("updateDuration",(data) => {
        if(data.room.host == socket.request.connection.remoteAddress ) {
           // 
            Rooms.map(room => {
                if(room.name == data.room.name) {
                    console.log(data.duration.replace("PT",''));
                    let data_ = data.duration.replace("PT",'');
                    let mins = '';
                    let find = false;
                    for(let x=0;x<data_.length;x++){
                        if(data_[x] != 'M' && find == false){
                            mins = mins + data_[x];
                        }
                        else{
                            find = true;
                        }
                    }
                    let duration = parseInt(mins*60);
                    room.video.VideoEnd = duration;
                    room.video.playing = true;
                    io.to(data.room.name).emit('update',room);
                }
            });
        }
       
    });
    socket.on("connectRoom", (data) => {
        socket.join(data);
        console.log(socket.id + ` has been joined at ${data}'s room!`)
    })
    console.log(socket.id + ' has been connected!')
    socket.emit('roomlist',{ip: socket.request.connection.remoteAddress,rooms: Rooms});
});