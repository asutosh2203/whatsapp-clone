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
  doc,
  getDoc,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useStateValue } from './StateProvider';
import { getUserRefByEmail, getOtherUserId } from './utils';

export default function SidebarChat({ id, lastUpdated, lastMessage }) {
  const [messages, setMessages] = useState('');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [{ user }, dispatch] = useStateValue();

  useEffect(async () => {
    if (id) {
      const recipientId = getOtherUserId(id, user.uid);

      const recipientRef = doc(db, 'users', recipientId);
      const recipientSnap = await getDoc(recipientRef);

      // console.log(recipientSnap.data());

      setName(recipientSnap.data().name);
      setPhoto(recipientSnap.data().photoURL);

      const messagesRef = collection(db, 'rooms', id, 'messages');
      const q = query(messagesRef, orderBy('timeStamp', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map((doc) => doc.data()));
      });

      return () => unsubscribe(); // Cleanup function to unsubscribe when `id` changes or component unmounts
    }
  }, [id]);

  const lastUpdatedFormatted =
    new Date(lastUpdated?.toDate()).toLocaleTimeString().split(':')[0] +
    ':' +
    new Date(lastUpdated?.toDate()).toLocaleTimeString().split(':')[1];

  return (
    <Link to={`/chats/${id}`}>
      <div className='sidebarChat'>
        <div className='sidebarChat_left'>
          <Avatar
            alt='prof-pic'
            variant='circular'
            children={<img className='chat_avatar' src={photo} />}
          />

          <div className='sidebarChat_info'>
            <h4>{name}</h4>
            <p>{lastMessage ? lastMessage : 'New chat'}</p>
          </div>
        </div>
        <p className='last_updated'>{lastUpdatedFormatted}</p>
      </div>
    </Link>
  );
}
