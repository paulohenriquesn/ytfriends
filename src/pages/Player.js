import React , {useState, useEffect} from 'react'
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import openSocket from 'socket.io-client';
import api from '../services/api';
import './Main.css';
import Youtube from 'react-youtube'
import TextField from '@material-ui/core/TextField';
import axios from 'axios';

const socket = openSocket('https://paulohsn.localtunnel.me');
const Player = ({history,match}) => {
    var update = true;
    const [roomInfo,setRoomInfo] = useState({
        video: {
            CurrentSeconds:0,
            VideoId:'',
            VideoEnd:0
        }
    });
    const [check,setCheck] = useState(false);
    const [UrlVideo,setUrlVideo] = useState('');
    const [chatHistory,setChatHistory] = useState([]);
    const [chatMessage,setChatMessage] = useState('');
    const [CanISend,setCan] = useState(true);
    useEffect(()=> {
    });
    
    socket.on("chat",(data) => {
        console.log(data);
        let x = chatHistory;
        x.push(data);
        setCan(true);
        x= x.filter(function(item, index){
            return x.indexOf(item) >= index;
        });
        setChatHistory(x);
    })

    socket.on("response", (data) => {
        update = true;
        setInterval(() => {
            if(update){
            socket.emit("tick",{host:data.host,room:data.name});
            update = false;
            }
        },1000);
        
    }); 
    socket.on("update",(data) => {
        setRoomInfo(data);
        socket.emit("tick",{host:roomInfo.host,room:roomInfo.name});    
    });

    if(check == false) {
        async function CheckRoom(){
            const response = await api.post('/checkroom',{
                room: match.params.room
            });
            if(response.data.result != "ok" ){
               history.push('/');
            }
        }
        async function GetRoomInfo(){
            const response = await api.post('/getroominfo',{
                room: match.params.room
            });
            setRoomInfo(response.data);
            socket.emit("connectRoom",response.data.name);
        }
        CheckRoom();
        GetRoomInfo();
        setCheck(true);
    }
    return (
        <Container maxWidth="sm" className="content">
        <Youtube    
        videoId={roomInfo.video.VideoId}
        startSeconds="100"
        onEnd={() => {
            
        }}
        opts={{
            height:'500',
            width:'500',
            playerVars: {
                autoplay:1,
                controls:0,
                disablekb:1,
                fs:0,
                modestbranding:1,
                enablejsapi:1,
                start:roomInfo.video.CurrentSeconds,
                end:roomInfo.video.VideoEnd
            }
        }}           
        />
        <InputLabel>Host: {roomInfo.name}</InputLabel>
        <Button onClick={() => {
            async function sendVideo() {
                const response = await api.post('/sendvideo',{
                    videoId: UrlVideo,
                    room: roomInfo.name
                })
                console.log(response.data);
                socket.emit("updateDuration",{duration:response.data.data.items[0].contentDetails.duration,room:roomInfo});
            }
           sendVideo();
        }}>Assistir</Button>
        <TextField onChange={(e) => {setUrlVideo(e.target.value);}} placeholder="Youtube Video ID"></TextField><br/>
        <TextField placeholder="Chat Message" onChange={(e) => {
            setChatMessage(e.target.value);
        }}></TextField>
        <Button onClick={() => {
            if(CanISend){
            socket.emit("chatSend",{id:socket.id,message:chatMessage,room:roomInfo.name});
            setCan(false);
            }
        }}>Enviar</Button> 
        <div className="chat">
        {chatHistory.map(msg => {
            return(
                <p>{msg.id}: {msg.message}</p>
            )
        })}
        </div>
        </Container>
    )
};

export default Player;