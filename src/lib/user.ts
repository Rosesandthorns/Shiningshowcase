
import { doc, setDoc, getDoc, collection, query, where, getDocs, Firestore, writeBatch } from 'firebase/firestore';
import { updateProfile, type User } from 'firebase/auth';

interface UpdateData {
  displayName?: string;
  photoFile?: File;
  bannerFile?: File;
}

/**
 * Converts a file to a Base64 data URL.
 * @param file The file to convert.
 * @returns A promise that resolves with the data URL.
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Checks if a display name is unique across the 'users' collection.
 * @param firestore The Firestore instance.
 * @param displayName The display name to check.
 * @param currentUserId The UID of the user requesting the change, to exclude them from the check.
 * @returns A promise that resolves to true if the name is unique, false otherwise.
 */
export async function isDisplayNameUnique(firestore: Firestore, displayName: string, currentUserId: string): Promise<boolean> {
    const usersRef = collection(firestore, 'users');
    // Case-insensitive query
    const q = query(usersRef, where('displayName', '==', displayName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return true; // Name is not taken
    }

    // If a user is found, check if it's the current user.
    // If there is more than one, it's not unique. If there's one, it must be the current user.
    if (querySnapshot.size > 1) {
        return false;
    }

    // It's unique if the only user found is the current user.
    return querySnapshot.docs[0].id === currentUserId;
}


/**
 * Updates the user's profile in Firebase Auth and Firestore.
 * @param firestore The Firestore instance.
 * @param user The Firebase user object.
 * @param data The data to update.
 */
export async function updateUserProfile(
  firestore: Firestore,
  user: User,
  data: UpdateData
): Promise<void> {
  const { displayName, photoFile, bannerFile } = data;
  const userDocRef = doc(firestore, 'users', user.uid);

  // Firestore transaction data
  const firestoreUpdateData: { [key: string]: any } = {
    uid: user.uid // Ensure UID is always present
  };

  // Auth profile update data
  const authUpdateData: { displayName?: string } = {};

  if (displayName && displayName !== user.displayName) {
      // Check for uniqueness before attempting to update
      const isUnique = await isDisplayNameUnique(firestore, displayName, user.uid);
      if (!isUnique) {
          throw new Error('Display name is already taken. Please choose another one.');
      }
      authUpdateData.displayName = displayName;
      firestoreUpdateData.displayName = displayName;
  } else if (!displayName) {
      // Ensure we have a displayName if one isn't provided
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists() || !userDoc.data().displayName) {
          // If no profile or display name exists, create one from email
           const newDisplayName = user.email ? user.email.split('@')[0] : user.uid;
           const isUnique = await isDisplayNameUnique(firestore, newDisplayName, user.uid);
           if (!isUnique) {
                firestoreUpdateData.displayName = `${newDisplayName}-${user.uid.substring(0, 4)}`;
           } else {
                firestoreUpdateData.displayName = newDisplayName;
           }
      }
  }


  if (photoFile) {
    const photoURL = await fileToDataUrl(photoFile);
    firestoreUpdateData.photoURL = photoURL;
  }

  if (bannerFile) {
    const bannerURL = await fileToDataUrl(bannerFile);
    firestoreUpdateData.bannerURL = bannerURL;
  }

  // Batch write to ensure atomicity
  const batch = writeBatch(firestore);

  // Update Firebase Authentication profile (only if displayName changed)
  if (Object.keys(authUpdateData).length > 0) {
    await updateProfile(user, authUpdateData);
  }

  // Update Firestore document
  if (Object.keys(firestoreUpdateData).length > 0) {
    batch.set(userDocRef, firestoreUpdateData, { merge: true });
  }
  
  await batch.commit();
}
