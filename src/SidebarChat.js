import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './css/sidebarChat.css'
import { Avatar } from '@material-ui/core'
import db from './firebase'
export default function SidebarChat({ addNewChat, id, name }) {
  const [messages, setMessages] = useState('')

  useEffect(() => {
    if (id) {
      db.collection('rooms')
        .doc(id)
        .collection('messages')
        .orderBy('timeStamp', 'desc')
        .onSnapshot((snapshot) =>
          setMessages(
            snapshot.docs.map((doc) => {
              return doc.data()
            })
          )
        )
    }
  }, [id])

  const createChat = () => {
    const roomName = prompt('Please enter name for chat room')
    if (roomName) {
      db.collection('rooms').add({
        name: roomName,
      })
    }
  }

  return !addNewChat ? (
    <Link to={`/rooms/${id}`}>
      <div className="sidebarChat">
        <Avatar />
        <div className="sidebarChat_info">
          <h4>{name}</h4>
          <p>{messages[0]?.message}</p>
        </div>
      </div>
    </Link>
  ) : (
    <div onClick={createChat} className="sidebarChat">
      <h2>Add New Chat</h2>
    </div>
  )
}
