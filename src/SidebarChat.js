import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './css/sidebarChat.css';
import { Avatar } from '@material-ui/core';
import db from './firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
} from 'firebase/firestore';

export default function SidebarChat({ addNewChat, id, name }) {
  const [messages, setMessages] = useState('');

  useEffect(() => {
    if (id) {
      const messagesRef = collection(db, 'rooms', id, 'messages');
      const q = query(messagesRef, orderBy('timeStamp', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => doc.data()));
      });

      return () => unsubscribe(); // Cleanup function to unsubscribe when `id` changes or component unmounts
    }
  }, [id]);

  const createChat = async () => {
    const roomName = prompt('Please enter name for chat room');
    if (roomName) {
      try {
        await addDoc(collection(db, 'rooms'), { name: roomName });
        console.log('Chat room created successfully!');
      } catch (error) {
        console.error('Error creating chat room:', error);
      }
    }
  };

  return !addNewChat ? (
    <Link to={`/rooms/${id}`}>
      <div className='sidebarChat'>
        <Avatar />
        <div className='sidebarChat_info'>
          <h4>{name}</h4>
          <p>{messages[0]?.message}</p>
        </div>
      </div>
    </Link>
  ) : (
    <div onClick={createChat} className='sidebarChat'>
      <h2>Add New Chat</h2>
    </div>
  );
}
