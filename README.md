# Chat App

A real-time chat application built with React and Firebase Firestore, supporting one-on-one messaging.

## Features

- Google Authentication for user login
- Real-time messaging with Firestore and Pusher.js
- One-on-one chat functionality
- Unread message count for each conversation
- Last seen and online status tracking
- Chat ordering based on the latest message

## Tech Stack

- **Frontend:** React, Firebase Authentication
- **Backend:** Firebase Firestore, Firebase Storage
- **State Management:** React Context API

## Setup Instructions

### Prerequisites

Ensure you have:

- Node.js installed
- Firebase project set up
- Pusher credentials

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/asutosh2203/whatsapp-clone.git
   cd whatsapp-clone
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up Firebase:
   - Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore, Firebase Authentication (Google Sign-In), and Firebase Storage
   - Create a `.env` file and add your Firebase credentials:
     ```sh
     REACT_APP_FIREBASE_API_KEY=your_api_key
     REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
     REACT_APP_FIREBASE_PROJECT_ID=your_project_id
     REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
     REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
     REACT_APP_FIREBASE_APP_ID=your_app_id
     ```
4. Start the development server:
   ```sh
   npm start
   ```

## Running in Production

1. Build the project:
   ```sh
   npm run build
   ```
2. Deploy to Firebase Hosting (if using Firebase):
   ```sh
   firebase deploy
   ```

## License

This project is licensed under the MIT License.

