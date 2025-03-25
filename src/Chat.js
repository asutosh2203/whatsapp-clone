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

import {Avatar, IconButton} from "@mui/material"
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import InsertEmoticonOutlinedIcon from '@mui/icons-material/InsertEmoticonOutlined';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import SendIcon from '@mui/icons-material/Send';
import { useParams } from 'react-router-dom';
import db, { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useStateValue } from './StateProvider';
import { getOtherUserId } from './utils';
import VideoPlayer from './VideoPlayer';

export default function Chat() {
  const [input, setInput] = useState('');
  const [inputMedia, setInputMedia] = useState('');
  const [inputMediaType, setInputMediaType] = useState('');
  const [progress, setProgress] = useState(0);
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

  const fileRef = useRef(null);

  async function markChatAsRead(chatRef, userId) {
    await updateDoc(chatRef, {
      [`unreadCounts.${userId}`]: 0,
    });
  }

  const sendMessage = async (_) => {
    if (!input && !inputMedia) return;

    _.preventDefault();
    try {
      // Add new message to the messages collection
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        message: input,
        name: user.displayName,
        senderId: user.uid,
        timeStamp: serverTimestamp(),
        mediaUrl: inputMedia.length > 0 ? inputMedia : null,
      });

      const recipientId = getOtherUserId(chatId, user.uid);

      const userRef = doc(db, 'users', recipientId);
      const userSnap = await getDoc(userRef);

      // update the sidebar chat info
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: input,
        lastMessageType:
          input.length > 0
            ? inputMedia.length > 0
              ? `${inputMediaType}Text`
              : 'text'
            : inputMediaType,
        lastUpdated: serverTimestamp(),
        [`unreadCounts.${recipientId}`]:
          chatId !== userSnap.data().activeChatId && increment(1),
      });
      setInput('');
      setInputMedia('');

      console.log('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const uploadMedia = async (file) => {
    const storageRef = ref(storage, `messages/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate upload progress
          const progressPercent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progressPercent);
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    const file = e.target.files[0]; // Get the selected file
    console.log(file);
    try {
      if (!file) return;

      if (file.size > 52428800) {
        throw new Error('File size cannot exceed 50MB');
      }

      setInputMediaType(file.type.split('/')[0]);

      setInputMedia(await uploadMedia(file));
      // setInputMedia(
      //   'https://firebasestorage.googleapis.com/v0/b/whatsapp-reactjs-68f7e/o/messages%2F1742854910990_VALORANT%20%20%202024-12-17%2017-50-27.mp4?alt=media&token=86c656d2-649c-4776-a708-a5721ea9bbcc'
      // );
    } catch (error) {
      alert(error.message);
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
            <div
              key={index}
              ref={index === messages.length - 1 ? lastMessageRef : null}
              className={`chat_message ${
                message.senderId === user.uid && 'chat_sent'
              }`}
              style={{ display: message.mediaUrl?.length > 0 && 'block' }}
            >
              {/* <p className='chat_name'>{`${
              message.senderId === user.uid ? '' : message.name
            }`}</p> */}
              {message.mediaUrl?.length > 0 && (
                <img src={message.mediaUrl} className='message_media' />
              )}
              <div className='message_content'>
                <p>{message.message}</p>
                <p className='chat_timeStamp'>
                  {message.timeStamp &&
                    new Date(message.timeStamp?.toDate())
                      .toLocaleTimeString()
                      .split(':')[0]}
                  :
                  {message.timeStamp &&
                    new Date(message.timeStamp?.toDate())
                      .toLocaleTimeString()
                      .split(':')[1]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className='chat_footer_container'>
        {progress > 0 && progress < 100 && <p>Uploading: {progress}%</p>}
        {inputMedia && inputMediaType == 'image' && (
          <img className='input_media' src={inputMedia} />
        )}
        {inputMedia && inputMediaType == 'video' && (
          <VideoPlayer className='input_media' src={inputMedia} />
        )}

        <div className='chat_footer'>
          <IconButton>
            <InsertEmoticonOutlinedIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              fileRef.current.click();
            }}
          >
            <AttachFileOutlinedIcon />
          </IconButton>

          {/* file upload input */}
          <input type='file' hidden ref={fileRef} onChange={handleFileUpload} />

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
          {input.length > 0 || inputMedia.length > 0 ? (
            <button
              className={`button ${
                input.length > 0 || inputMedia.length > 0 ? '' : ' hidden'
              }`}
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
    </div>
  );
}
