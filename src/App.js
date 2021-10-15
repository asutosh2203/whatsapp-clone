import React, { useState } from 'react'
import './css/App.css'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import Chat from './Chat'
import Sidebar from './Sidebar'
import Login from './Login'
import { useStateValue } from './StateProvider'

export default function App() {
  const [{ user }, dispatch] = useStateValue()
  return (
    <div className="app">
      {!user ? (
        <Login />
      ) : (
        <div className="app_body">
          <Router>
            <Switch>
              <Route path="/rooms/:roomId">
                <Sidebar />
                <Chat />
              </Route>
              <Route path="/">
                <Sidebar />
              </Route>
            </Switch>
          </Router>
        </div>
      )}
    </div>
  )
}
