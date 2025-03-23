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

export default function SidebarChat({
  addNewChat,
  id,
  lastUpdated,
  lastMessage,
}) {
  const [messages, setMessages] = useState('');
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [{ user }, dispatch] = useStateValue();

  useEffect(async () => {
    if (id) {
      const recipientId = getOtherUserId(id, user.uid);

      const recipientRef = doc(db, 'users', recipientId);
      const recipientSnap = await getDoc(recipientRef);

      console.log(recipientSnap.data());

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

  const createChat = async () => {
    const recipientEmail = prompt('Please enter email of recipient');
    if (!recipientEmail) return;

    try {
      const userRef = await getUserRefByEmail(recipientEmail);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        throw new Error('Recipient not found');
      }

      const recipientUid = userSnap.data().uid;
      const currentUid = user.uid;

      if (recipientEmail == currentUid) {
        throw new Error("You can't use your email as recipient's ID");
      }

      const chatId =
        recipientUid > currentUid
          ? recipientUid + '_' + currentUid
          : currentUid + '_' + recipientUid;

      // console.log('Chat ID:', chatId);

      // Check if the chat already exists
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          chatId,
          participants: [currentUid, recipientUid],
          lastMessage: '',
          lastUpdated: serverTimestamp(),
        });

        console.log(`New chat with ${recipientEmail} created successfully!`);
      } else {
        console.log('Chat already exists');
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  return !addNewChat ? (
    <Link to={`/chats/${id}`}>
      <div className='sidebarChat'>
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
    </Link>
  ) : (
    <div onClick={createChat} className='sidebarChat'>
      <h2>Add New Chat</h2>
    </div>
  );
}
