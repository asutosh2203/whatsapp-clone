import React, { useState, useEffect } from 'react';
import './css/chat.css';
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Avatar, IconButton } from '@material-ui/core';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import AttachFileOutlinedIcon from '@material-ui/icons/AttachFileOutlined';
import MoreHorizOutlinedIcon from '@material-ui/icons/MoreHorizOutlined';
import VideocamOutlinedIcon from '@material-ui/icons/VideocamOutlined';
import PhoneOutlinedIcon from '@material-ui/icons/PhoneOutlined';
import InsertEmoticonOutlinedIcon from '@material-ui/icons/InsertEmoticonOutlined';
import MicNoneOutlinedIcon from '@material-ui/icons/MicNoneOutlined';
import SendIcon from '@material-ui/icons/Send';
import { useParams } from 'react-router-dom';
import db from './firebase';
import { useStateValue } from './StateProvider';
export default function Chat() {
  const [input, setInput] = useState('');
  const [roomName, setRoomName] = useState('');
  const [messages, setMessages] = useState([]);
  const [{ user }, dispatch] = useStateValue();
  const { roomId } = useParams();

  const sendMessage = async (_) => {
    _.preventDefault();
    try {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        message: input,
        name: user.displayName,
        uid: user.uid,
        timeStamp: serverTimestamp(),
      });
      console.log('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setInput('');
  };

  useEffect(() => {
    if (roomId) {
      // Listen for room name updates
      const roomRef = doc(db, 'rooms', roomId);
      const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          setRoomName(snapshot.data().name);
        }
      });

      // Listen for messages updates
      const messagesRef = collection(db, 'rooms', roomId, 'messages');
      const q = query(messagesRef, orderBy('timeStamp', 'asc'));

      const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => doc.data()));
      });

      // Cleanup function to unsubscribe when roomId changes or component unmounts
      return () => {
        unsubscribeRoom();
        unsubscribeMessages();
      };
    }
  }, [roomId]);

  return (
    <div className='chat'>
      <div className='chat_header'>
        <Avatar />
        <div className='chat_headerInfo'>
          <h3>{roomName}</h3>
          <p>
            Last Activity at{' '}
            {new Date(
              messages[messages.length - 1]?.timeStamp?.toDate()
            ).toLocaleTimeString()}
          </p>
        </div>
        <div className='chat_headerIcons'>
          <IconButton>
            <VideocamOutlinedIcon />
          </IconButton>
          <IconButton>
            <PhoneOutlinedIcon />
          </IconButton>
          <IconButton>
            <SearchOutlinedIcon />
          </IconButton>
          <IconButton>
            <MoreHorizOutlinedIcon />
          </IconButton>
        </div>
      </div>
      <div className='chat_body'>
        {messages.map((message) => (
          <p
            className={`chat_message ${
              message.uid === user.uid && 'chat_recieved'
            }`}
          >
            <p className='chat_name'>{`${
              message.uid === user.uid ? '' : message.name
            }`}</p>
            {message.message}
            <span className='chat_timeStamp'>
              {`${new Date(message.timeStamp?.toDate()).getHours()}:${new Date(
                message.timeStamp?.toDate()
              ).getMinutes()}`}
            </span>
          </p>
        ))}

        {/* <p className="chat_message">
          <p className="chat_name">Asutosh</p>
          This is a message
          <span className="chat_timeStamp">
            {new Date().toLocaleTimeString()}
          </span>
        </p>
        <p className="chat_message chat_recieved">
          <p className="chat_name">Akankshya</p>
          This is a message
          <span className="chat_timeStamp">
            {new Date().toLocaleTimeString()}
          </span>
        </p>
        <p className="chat_message">
          <p className="chat_name">Asutosh</p>
          This is a message
          <span className="chat_timeStamp">
            {new Date().toLocaleTimeString()}
          </span>
        </p> */}
      </div>
      <div className='chat_footer'>
        <IconButton>
          <InsertEmoticonOutlinedIcon />
        </IconButton>
        <IconButton>
          <AttachFileOutlinedIcon />
        </IconButton>
        <form>
          <input
            value={input}
            onChange={(_) => {
              setInput(_.target.value);
            }}
            placeholder='Type a message ...'
            type='text'
          />
          <button
            onClick={(e) => e.preventDefault()}
            className='hidden'
            type='submit'
          ></button>
        </form>
        {input.length > 0 ? (
          <button
            className={`button ${input.length > 0 ? '' : ' hidden'}`}
            onClick={sendMessage}
            type='submit'
            onKeyPress={(e) => {
              console.log(e.key);
            }}
          >
            <SendIcon style={{ color: 'gray' }} />
          </button>
        ) : (
          <IconButton>
            <MicNoneOutlinedIcon />
          </IconButton>
        )}
      </div>
    </div>
  );
}
