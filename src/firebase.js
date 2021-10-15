import firebase from 'firebase'
const firebaseConfig = {
  apiKey: 'AIzaSyCFwGOCjtKT0XsSXlvF8hkuRF2vqL3Uy6M',
  authDomain: 'whatsapp-reactjs-68f7e.firebaseapp.com',
  projectId: 'whatsapp-reactjs-68f7e',
  storageBucket: 'whatsapp-reactjs-68f7e.appspot.com',
  messagingSenderId: '675083267841',
  appId: '1:675083267841:web:68866ffbd74fcaf650f500',
}
const firebaseApp = firebase.initializeApp(firebaseConfig)
const db = firebaseApp.firestore()
const auth = firebase.auth()
const provider = new firebase.auth.GoogleAuthProvider()

export { auth, provider }
export default db
