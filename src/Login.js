import React from 'react';
import { Button } from '@material-ui/core';
import './css/Login.css';
import { auth, provider } from './firebase';
import { signInWithPopup } from 'firebase/auth';
import { useStateValue } from './StateProvider';
import { actionTypes } from './reducer';

export default function Login() {
  const [{}, dispatch] = useStateValue();

  const signIn = () => {
    signInWithPopup(auth, provider)
      .then((res) => {
        dispatch({
          type: actionTypes.SET_USER,
          user: res.user,
        });
      })
      .catch((err) => console.log(err));
  };
  return (
    <div className='login'>
      <div className='login_container'>
        <img
          className='logo '
          src='https://pngimg.com/uploads/whatsapp/whatsapp_PNG95179.png'
        />
        <div className='login_text'>
          <h1>Sign in to Whatsapp</h1>
        </div>
        <Button onClick={signIn}>Sign in With Google</Button>
      </div>
    </div>
  );
}
