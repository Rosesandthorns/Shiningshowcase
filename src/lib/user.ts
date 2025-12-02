
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
    if (/^\d+$/.test(displayName)) return false; // Purely numeric names are not allowed
    const q = query(usersRef, where('displayName', '==', displayName), where('uid', '!=', currentUserId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // If it's empty, the name is unique
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

  // 1. Handle Display Name
  if (displayName) {
    const isUnique = await isDisplayNameUnique(firestore, displayName, user.uid);
    if (!isUnique) {
      throw new Error('Display name is already taken or invalid. Please choose another one.');
    }
    // Update both Auth and Firestore if it's different
    if (displayName !== user.displayName) {
      await updateProfile(user, { displayName });
    }
    firestoreUpdateData.displayName = displayName;
  }

  // 2. Ensure Firestore document has a display name
  const docSnap = await getDoc(userDocRef);
  if (!docSnap.exists() || !docSnap.data()?.displayName) {
     if (!firestoreUpdateData.displayName) {
        // If no new name provided and none exists, generate one.
        const baseName = user.email?.split('@')[0] || `user`;
        let newDisplayName = `${baseName}${Math.floor(Math.random() * 1000)}`;
        let attempts = 0;
        while (!(await isDisplayNameUnique(firestore, newDisplayName, user.uid)) && attempts < 10) {
            attempts++;
            newDisplayName = `${baseName}${Math.floor(Math.random() * 10000)}`;
        }
        if (attempts >= 10) throw new Error("Failed to generate a unique display name.");
        
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
  // Always set the UID field for consistency.
  firestoreUpdateData.uid = user.uid;
  await setDoc(userDocRef, firestoreUpdateData, { merge: true });

  return user.uid;
}
