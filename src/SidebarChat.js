import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './css/sidebarChat.css';
import { Avatar } from '@mui/material';
import db from './firebase';
import { onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useStateValue } from './StateProvider';
import { getOtherUserId } from './utils';
import { IoDocument, IoImage, IoVideocam } from 'react-icons/io5';

export default function SidebarChat({
  id,
  lastUpdated,
  lastMessage,
  lastMessageType,
}) {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const [{ user }, dispatch] = useStateValue();

  useEffect(async () => {
    if (id) {
      const recipientId = getOtherUserId(id, user.uid);

      const recipientRef = doc(db, 'users', recipientId);
      const recipientSnap = await getDoc(recipientRef);

      setName(recipientSnap.data().name);
      setPhoto(recipientSnap.data().photoURL);

      const chatRef = doc(db, 'chats', id);

      // maintaining the unread count
      const unsubscribe = onSnapshot(chatRef, (snapshot) => {
        setUnreadCount(snapshot.data().unreadCounts[user.uid]);
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
            <p className={unreadCount > 0 ? `unread` : undefined}>
              {lastMessage
                ? lastMessage.length > 50
                  ? lastMessage.slice(0, 50) + '...'
                  : lastMessage
                : 'New chat'}
            </p>
          </div>
        </div>
        <div className='sidebarChat_right'>
          <p
            className={`last_updated ${
              unreadCount > 0 ? `unread_timestamp` : undefined
            }`}
          >
            {lastUpdatedFormatted}
          </p>
          <p className={`unread_count ${!unreadCount && `hidden`}`}>
            {!!unreadCount && unreadCount}
          </p>
        </div>
      </div>
    </Link>
  );
}
