import React, { useState, useEffect, useRef } from 'react';
import './css/chat.css';
import {
  collection,
  doc,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  getDoc,
  serverTimestamp,
  increment,
  updateDoc,
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
import { getOtherUserId } from './utils';

export default function Chat() {
  const [input, setInput] = useState('');
  const [chatName, setChatName] = useState('');
  const [photo, setPhoto] = useState('');
  const [messages, setMessages] = useState([]);

  const [{ user }, dispatch] = useStateValue();

  const { chatId } = useParams();

  const lastMessageRef = useRef(null);

  // useeffect for messages
  useEffect(() => {
    if (chatId) {
      // Listen for chat name updates
      const roomRef = doc(db, 'chats', chatId);
      const unsubscribeRoom = onSnapshot(roomRef, async (snapshot) => {
        if (!snapshot.exists()) return;

        const recipientId = snapshot
          .data()
          .participants.filter((participant) => {
            return participant !== user.uid;
          })[0];

        const userRef = doc(db, 'users', recipientId);
        const userDoc = await getDoc(userRef);

        setChatName(userDoc.data().name);
        setPhoto(userDoc.data().photoURL);
      });

      // Listen for messages updates
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timeStamp', 'asc'));

      const unsubscribeMessages = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => doc.data()));
      });

      // Mark chat as read
      markChatAsRead(roomRef, user.uid);

      // Cleanup function to unsubscribe when roomId changes or component unmounts
      return () => {
        unsubscribeRoom();
        unsubscribeMessages();
      };
    }
  }, [chatId]);

  // useEffect for scrolling to the bottom of the chat
  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔥 Mark chat as active
  useEffect(() => {
    const userRef = doc(db, 'users', user.uid);
    const markChatActive = async () => {
      await updateDoc(userRef, { activeChatId: chatId });
    };
    markChatActive();

    // return () => {
    //   updateDoc(userRef, { activeChatId: null }); // Reset when user leaves
    // };
  }, [chatId]);

  async function markChatAsRead(chatRef, userId) {
    await updateDoc(chatRef, {
      [`unreadCounts.${userId}`]: 0,
    });
  }

  const sendMessage = async (_) => {
    if (!input) return;
    _.preventDefault();
    try {
      // Add new message to the messages collection
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        message: input,
        name: user.displayName,
        senderId: user.uid,
        timeStamp: serverTimestamp(),
      });

      const recipientId = getOtherUserId(chatId, user.uid);

      const userRef = doc(db, 'users', recipientId);
      const userSnap = await getDoc(userRef);
      console.log(chatId !== userSnap.data().activeChatId);
      // update the sidebar chat info
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: input,
        lastUpdated: serverTimestamp(),
        [`unreadCounts.${recipientId}`]:
          chatId !== userSnap.data().activeChatId && increment(1),
      });
      setInput('');

      console.log('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className='chat'>
      <div className='chat_header'>
        <Avatar>
          <img src={photo} style={{ height: '40px' }} />
        </Avatar>
        <div className='chat_headerInfo'>
          <h3>{chatName}</h3>
          {/* <p>
            Last Activity at{' '}
            {new Date(
              messages[messages.length - 1]?.timeStamp?.toDate()
            ).toLocaleTimeString()}
          </p> */}
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
        {messages.map((message, index) => {
          return (
            <p
              key={index}
              ref={index === messages.length - 1 ? lastMessageRef : null}
              className={`chat_message ${
                message.senderId === user.uid && 'chat_recieved'
              }`}
            >
              {/* <p className='chat_name'>{`${
              message.senderId === user.uid ? '' : message.name
            }`}</p> */}
              {message.message}
              <span className='chat_timeStamp'>
                {message.timeStamp &&
                  new Date(message.timeStamp?.toDate())
                    .toLocaleTimeString()
                    .split(':')[0]}
                :
                {message.timeStamp &&
                  new Date(message.timeStamp?.toDate())
                    .toLocaleTimeString()
                    .split(':')[1]}
              </span>
            </p>
          );
        })}
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
            onKeyDown={(_) => {
              if (_.key === 'Enter') sendMessage(_);
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
