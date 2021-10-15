import React, { useEffect, useState } from 'react'
import './css/Sidebar.css'
import SidebarChat from './SidebarChat'
import { useStateValue } from './StateProvider'
import { Avatar, IconButton } from '@material-ui/core'
import SearchOutlinedIcon from '@material-ui/icons/SearchOutlined'
import MoreHorizOutlinedIcon from '@material-ui/icons/MoreHorizOutlined'
import DonutLargeIcon from '@material-ui/icons/DonutLarge'
import AddOutlinedIcon from '@material-ui/icons/AddOutlined'
import db from './firebase'
export default function Sidebar() {
  const [rooms, setRooms] = useState([])
  const [{user},dispatch] = useStateValue()
  useEffect(() => {
   const unsubscribe = db.collection('rooms').onSnapshot((snapshot) => {
      setRooms(
        snapshot.docs.map((doc) => {
          return {
            id: doc.id,
            data: doc.data(),
          }
        })
      )
    })

    return ()=>{
      unsubscribe()
    }
  }, [])
  return (
    <div className="sidebar">
      <div className="sidebar_header">
        <Avatar src={user?.photoURL} />
        <div className="sidebar_headerRight">
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
      <div className="sidebar_search">
        <div className="sidebar_searchContainer">
          <SearchOutlinedIcon />
          <input
            className="inputSearch"
            type="text"
            placeholder="Search or Start a new Chat"
          ></input>
        </div>
      </div>
      <div className="sidebar_chats">
        <SidebarChat addNewChat />
        {rooms.map((room) => {
          return (
            <SidebarChat key={room.id} id={room.id} name={room.data.name} />
          )
        })}
      </div>
    </div>
  )
}
