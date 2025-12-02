
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
    reader.onerror = (error) => reject(new Error('Failed to convert file to data URL.'));
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
    // Display names purely made of numbers are disallowed.
    if (/^\d+$/.test(displayName)) {
        return false;
    }
    
    const q = query(usersRef, where('displayName', '==', displayName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return true; // Name is not taken at all.
    }
    
    // If name is taken, check if it's by the current user.
    const isTakenByOther = querySnapshot.docs.some(doc => doc.id !== currentUserId);
    
    return !isTakenByOther;
}

/**
 * Creates or updates a user's profile in Firebase Auth and Firestore.
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
  
  const firestoreUpdateData: { [key: string]: any } = {};

  try {
    // 1. Handle Display Name
    if (displayName) {
      const isUnique = await isDisplayNameUnique(firestore, displayName, user.uid);
      if (!isUnique) {
        throw new Error('Display name is already taken or invalid. Please choose another one.');
      }
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }
      firestoreUpdateData.displayName = displayName;
    }

    // 2. Ensure Firestore document has a display name
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists() || !docSnap.data()?.displayName) {
       if (!firestoreUpdateData.displayName) {
          const baseName = user.email?.split('@')[0] || `user`;
          let newDisplayName = `${baseName}${Math.floor(Math.random() * 1000)}`;
          let attempts = 0;
          while (!(await isDisplayNameUnique(firestore, newDisplayName, user.uid)) && attempts < 10) {
              attempts++;
              newDisplayName = `${baseName}${Math.floor(Math.random() * 10000)}`;
          }
          if (attempts >= 10) {
              throw new Error("Failed to generate a unique display name.");
          }
          firestoreUpdateData.displayName = newDisplayName;
          if (user.displayName !== newDisplayName) {
              await updateProfile(user, { displayName: newDisplayName });
          }
       }
    }

    // 3. Handle file uploads
    if (photoFile) {
      firestoreUpdateData.photoURL = await fileToDataUrl(photoFile);
    }
    if (bannerFile) {
      firestoreUpdateData.bannerURL = await fileToDataUrl(bannerFile);
    }

    // 4. Perform the Firestore update
    firestoreUpdateData.uid = user.uid;
    await setDoc(userDocRef, firestoreUpdateData, { merge: true });
    
    return user.uid;

  } catch (error: any) {
    console.error("Error in updateUserProfile:", error);
    // Re-throw the error with a more specific message to be caught by the UI
    if (error.code && (error.code.startsWith('firestore/') || error.code.startsWith('auth/'))) {
        throw new Error(`A database or authentication error occurred: ${error.message}`);
    }
    throw error; // Re-throw original error if it's a custom one (e.g., "Display name is already taken")
  }
}
