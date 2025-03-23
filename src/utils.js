import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import db from './firebase';

export const getUserRefByEmail = async (email) => {
  try {
    // Query Firestore to find the user with the given email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      throw new Error('User not found');
    }

    // Get the first user document (should be unique)
    const userDoc = usersSnapshot.docs[0];
    return doc(db, 'users', userDoc.id); // ✅ Returns the correct userRef using UID
  } catch (error) {
    console.error('Error fetching userRef:', error);
    return null;
  }
};

export const getOtherUserId = (combinedId, loggedInUserId) => {
  const [user1, user2] = combinedId.split('_');
  return user1 === loggedInUserId ? user2 : user1;
};
