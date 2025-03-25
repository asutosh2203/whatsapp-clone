import React, { useEffect, useState } from 'react';
import './css/Sidebar.css';
import SidebarChat from './SidebarChat';
import { useStateValue } from '../StateProvider';
import { Avatar, IconButton } from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { useNavigate } from 'react-router';
import db, { auth } from '../firebase';
import {
  collection,
  query,
  orderBy,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { getUserRefByEmail } from '../utils';
import { signOut } from 'firebase/auth';

export default function Sidebar() {
  const [chats, setChats] = useState([]);
  const [{ user }, dispatch] = useStateValue();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, orderBy('lastUpdated', 'desc')); // Query with ordering

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChats(
        snapshot.docs
          .filter((doc) => doc.id.includes(user.uid)) // Filter before mapping
          .map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }))
      );
    });

    // Cleanup function to unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  const createChat = async () => {
    const recipientEmail = prompt('Please enter email of recipient');

    if (!recipientEmail || !recipientEmail.includes('@')) {
      alert('Invalid email address');
      return;
    }

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
          unreadCounts: {
            [currentUid]: 0,
            [recipientUid]: 0,
          },
        });
      } else {
        navigate(`/chats/${chatId}`);
      }
    } catch (error) {
      alert('Error creating chat room:', error.message);
      console.error('Error creating chat room:', error);
    }
  };

  return (
    <div className='sidebar'>
      <div className='sidebar_header'>
        <Avatar>
          <img className='user_avatar' src={user?.photoURL} />
        </Avatar>
        <p>{user?.displayName}</p>
        <div className='sidebar_headerRight'>
          <IconButton>
            <DonutLargeIcon />
          </IconButton>
          <IconButton onClick={createChat}>
            <AddOutlinedIcon />
          </IconButton>
          <IconButton>
            <MoreHorizOutlinedIcon />
          </IconButton>
        </div>
      </div>
      <div className='sidebar_search'>
        <div className='sidebar_searchContainer'>
          <SearchOutlinedIcon />
          <input
            className='inputSearch'
            type='text'
            placeholder='Search or Start a new Chat'
          />
        </div>
      </div>
      <div className='sidebar_chats'>
        {chats.map((chatData) => {
          return (
            chatData && (
              <SidebarChat
                key={chatData.id}
                id={chatData.id}
                lastUpdated={chatData.data.lastUpdated}
                lastMessage={chatData.data.lastMessage}
                lastMessageType={chatData.data.lastMessageType}
              />
            )
          );
        })}
        <button
          onClick={() => {
            signOut(auth);
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
