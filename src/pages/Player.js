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

const socket = openSocket('http://192.168.0.2:8000');
const Player = ({history,match}) => {
    const [roomInfo,setRoomInfo] = useState({
        video: {
            CurrentSeconds:0,
            VideoId:'',
            VideoEnd:0
        }
    });
    const [check,setCheck] = useState(false);
    const [UrlVideo,setUrlVideo] = useState('');
    const [timeVideo,setTime] = useState(0);
    useEffect(()=> {
        console.log(roomInfo);
    });
    
    socket.on("updateTime",(data) => {
    
    });
    socket.on("update",(data) => {
        setRoomInfo(data);
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
        <TextField onChange={(e) => {setUrlVideo(e.target.value);}}></TextField>
        </Container>
    )
};

export default Player;