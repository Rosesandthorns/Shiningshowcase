
import { doc, setDoc, getDoc, collection, query, where, getDocs, Firestore } from 'firebase/firestore';
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
    const q = query(usersRef, where('displayName', '==', displayName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return true; // Name is not taken
    }

    // A name is considered unique if it's only used by the current user.
    if (querySnapshot.size === 1 && querySnapshot.docs[0].id === currentUserId) {
        return true;
    }

    // If size > 1, it's definitely not unique.
    // If size is 1 and it's not the current user, it's not unique.
    return false;
}


/**
 * Updates the user's profile in Firebase Auth and Firestore.
 * Ensures a profile document and display name exist.
 * @param firestore The Firestore instance.
 * @param user The Firebase user object.
 * @param data The data to update.
 * @returns The final user ID that was saved.
 */
export async function updateUserProfile(
  firestore: Firestore,
  user: User,
  data: UpdateData
): Promise<string> {
  const { displayName, photoFile, bannerFile } = data;
  const userDocRef = doc(firestore, 'users', user.uid);
  const authUpdateData: { displayName?: string } = {};
  const firestoreUpdateData: { [key: string]: any } = { uid: user.uid };
  
  let finalDisplayName: string | undefined = displayName;

  // 1. Determine the display name
  if (finalDisplayName) {
    if (finalDisplayName !== user.displayName) {
      const isUnique = await isDisplayNameUnique(firestore, finalDisplayName, user.uid);
      if (!isUnique) {
        throw new Error('Display name is already taken. Please choose another one.');
      }
      authUpdateData.displayName = finalDisplayName;
      firestoreUpdateData.displayName = finalDisplayName;
    } else {
        firestoreUpdateData.displayName = finalDisplayName;
    }
  } else {
    // If no display name is being set, ensure one exists in the doc
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists() || !userDoc.data()?.displayName) {
      // Create a default display name if none exists
      const baseName = "User";
      let newDisplayName = `${baseName}${Math.floor(Math.random() * 10000)}`;
      let isUnique = await isDisplayNameUnique(firestore, newDisplayName, user.uid);
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        attempts++;
        newDisplayName = `${baseName}${Math.floor(Math.random() * 10000)}`;
        isUnique = await isDisplayNameUnique(firestore, newDisplayName, user.uid);
      }
      
      if (!isUnique) {
          throw new Error("Failed to generate a unique display name.");
      }

      finalDisplayName = newDisplayName;
      firestoreUpdateData.displayName = finalDisplayName;
      authUpdateData.displayName = finalDisplayName;
      
    } else {
        finalDisplayName = userDoc.data()?.displayName;
        firestoreUpdateData.displayName = finalDisplayName;
    }
  }

  // 2. Handle file uploads
  if (photoFile) {
    firestoreUpdateData.photoURL = await fileToDataUrl(photoFile);
  }

  if (bannerFile) {
    firestoreUpdateData.bannerURL = await fileToDataUrl(bannerFile);
  }

  // 3. Perform the updates
  if (Object.keys(firestoreUpdateData).length > 1) { // more than just uid
    await setDoc(userDocRef, firestoreUpdateData, { merge: true });
  }

  // Update Firebase Authentication profile only after Firestore succeeds
  if (Object.keys(authUpdateData).length > 0 && authUpdateData.displayName) {
    await updateProfile(user, { displayName: authUpdateData.displayName });
  }

  return user.uid;
}
