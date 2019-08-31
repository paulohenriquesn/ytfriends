import React , {useState} from 'react'
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import openSocket from 'socket.io-client';
import api from '../services/api';
import './Main.css';

const socket = openSocket('https://paulohsn.localtunnel.me');

const Main = ({history}) => {
    const [RoomList,setRoomList] = useState([]);
    const [IPAddress,setIP] = useState('');

    socket.on('roomlist',(data) => {
        setRoomList(data.rooms);
        setIP(data.ip);
    });

    return(
        <Container maxWidth="sm" className="content">
        <h1>yFriends</h1>
        <div className="roomList">
        {RoomList.map(room => {
            console.log(room);
            return(
            <nav className="room">
                <InputLabel>{room.name}</InputLabel>
                <Button onClick={() => {
                    history.push(`/watch/${room.name}`);
                }}>Entrar</Button>
            </nav>
            )
        })}
        </div>
        <Button onClick={() => {
            async function createRoom() {
                const response = await api.post('/createroom',{
                    socketId:socket.id,  
                    ip:IPAddress
                });
                setRoomList(response.data);
            }
            createRoom();
        }}>Criar Sala</Button>
        </Container>
    )
}   

export default Main;    