import React, { useEffect } from 'react';
import './css/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import Chat from './Chat';
import Sidebar from './Sidebar';
import Login from './Login';
import { useStateValue } from '../StateProvider';
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import db, { auth } from '../firebase';
import { actionTypes } from '../reducer';
import SelectChat from './SelectChat';

export default function App() {
  const [{ user }, dispatch] = useStateValue();

  useEffect(() => {
    // Set auth persistence
    setPersistence(auth, browserLocalPersistence).then(() => {
      // Listen for auth state changes
      onAuthStateChanged(auth, async (authedUser) => {
        if (authedUser) {
          dispatch({
            type: actionTypes.SET_USER,
            user: authedUser,
          });

          const userRef = doc(db, 'users', authedUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            // User doesn't exist, create new user in Firestore
            await setDoc(userRef, {
              uid: authedUser.uid,
              name: authedUser.displayName,
              email: authedUser.email,
              photoURL: authedUser.photoURL,
              createdAt: serverTimestamp(),
            });
            console.log('New user added to Firestore');
          }
        } else {
          dispatch({
            type: actionTypes.SET_USER,
            user: null,
          });
        }
      });
    });
  }, []);

  return (
    <div className='app'>
      {!user ? (
        <Login />
      ) : (
        <div className='app_body'>
          <Router>
            <Sidebar />
            {/* Sidebar stays outside Routes to persist across pages */}
            <Routes>
              <Route path='/chats/:chatId' element={<Chat />} />
              <Route path='/' element={<SelectChat />} />
            </Routes>
          </Router>
        </div>
      )}
    </div>
  );
}
