import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
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

  useEffect(() => {
    if (!id) return;

    const fetchRecipientData = async () => {
      try {
        const recipientId = getOtherUserId(id, user.uid);
        const recipientRef = doc(db, 'users', recipientId);
        const recipientSnap = await getDoc(recipientRef);

        if (recipientSnap.exists()) {
          setName(recipientSnap.data().name);
          setPhoto(recipientSnap.data().photoURL);
        }

        // Subscribe to chat updates
        const chatRef = doc(db, 'chats', id);
        const unsubscribe = onSnapshot(chatRef, (snapshot) => {
          setUnreadCount(snapshot.data()?.unreadCounts?.[user.uid] || 0);
        });

        return unsubscribe; // Return cleanup function
      } catch (error) {
        console.error('Error fetching recipient data:', error);
      }
    };

    const unsubscribePromise = fetchRecipientData();

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [id]);

  const lastUpdatedFormatted =
    new Date(lastUpdated?.toDate()).toLocaleTimeString().split(':')[0] +
    ':' +
    new Date(lastUpdated?.toDate()).toLocaleTimeString().split(':')[1];
    
  const formatPlaceholder = () => {
    let placeholder;
    if (!lastMessage && !lastMessageType) return 'New chat';

    if (lastMessageType !== 'textMessage') {
      placeholder = [
        lastMessageType === 'imageText' || lastMessageType === 'image' ? (
          <IoImage />
        ) : lastMessageType === 'videoText' || lastMessageType === 'video' ? (
          <IoVideocam />
        ) : (
          <IoDocument />
        ),
        lastMessage ? lastMessage : lastMessageType + ' file',
      ];
    } else {
      placeholder = lastMessage;
    }

    return placeholder;
  };

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
            <div
              className={`placeholder ${
                unreadCount > 0 ? `unread` : undefined
              }`}
            >
              {formatPlaceholder()}
            </div>
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
