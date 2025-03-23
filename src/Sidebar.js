import React, { useEffect, useState } from 'react';
import './css/Sidebar.css';
import SidebarChat from './SidebarChat';
import { useStateValue } from './StateProvider';
import { Avatar, IconButton } from '@material-ui/core';
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined';
import MoreHorizOutlinedIcon from '@material-ui/icons/MoreHorizOutlined';
import DonutLargeIcon from '@material-ui/icons/DonutLarge';
import AddOutlinedIcon from '@material-ui/icons/AddOutlined';
import db, { auth } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Sidebar() {
  const [chats, setChats] = useState([]);
  const [{ user }, dispatch] = useStateValue();

  useEffect(() => {
    // const roomsRef = collection(db, 'rooms');

    // const unsubscribe = onSnapshot(roomsRef, (snapshot) => {
    //   setRooms(
    //     snapshot.docs.map((doc) => ({
    //       id: doc.id,
    //       data: doc.data(),
    //     }))
    //   );
    // });

    const chatsRef = collection(db, 'chats');

    const unsubscribe = onSnapshot(chatsRef, (snapshot) => {
      setChats(
        snapshot.docs.map((doc) => {
          if (doc.id.includes(user.uid)) {
            return {
              id: doc?.id,
              data: doc.data(),
            };
          }
        })
      );
    });

    // Cleanup function to unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <div className='sidebar'>
      <div className='sidebar_header'>
        <Avatar>
          <img className='user_avatar' src={user?.photoURL} />
        </Avatar>
        <div className='sidebar_headerRight'>
          <IconButton>
            <DonutLargeIcon />
          </IconButton>
          <IconButton>
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
        <SidebarChat addNewChat />
        {chats.map((chatData) => {
          console.log(chatData);

          return (
            chatData && (
              <SidebarChat
                key={chatData.id}
                id={chatData.id}
                lastUpdated={chatData.data.lastUpdated}
                lastMessage={chatData.data.lastMessage}
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
