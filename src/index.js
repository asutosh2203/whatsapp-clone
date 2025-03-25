import React from 'react';
// import ReactDOM from 'react-dom';
import App from './components/App';
import './css/index.css';
import { StateProvider } from './StateProvider';
import reducer, { initialState } from './reducer';
// ReactDOM.render(
//   <React.StrictMode>
//     <StateProvider initialState={initialState} reducer={reducer}>
//       <App />
//     </StateProvider>
//   </React.StrictMode>,
//   document.getElementById('root')
// )

import ReactDOM from 'react-dom/client';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StateProvider initialState={initialState} reducer={reducer}>
      <App />
    </StateProvider>
  </React.StrictMode>
);
