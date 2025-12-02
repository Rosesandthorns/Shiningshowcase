
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
    console.log(`[isDisplayNameUnique] Checking uniqueness for displayName: '${displayName}'`);
    const usersRef = collection(firestore, 'users');
    // Display names purely made of numbers are disallowed.
    if (/^\d+$/.test(displayName)) {
        console.warn('[isDisplayNameUnique] Display name is purely numeric, which is not allowed.');
        return false;
    }
    
    const q = query(usersRef, where('displayName', '==', displayName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.log(`[isDisplayNameUnique] '${displayName}' is unique.`);
        return true; // Name is not taken at all.
    }
    
    // If name is taken, check if it's by the current user.
    const isTakenByOther = querySnapshot.docs.some(doc => doc.id !== currentUserId);
    if (isTakenByOther) {
        console.warn(`[isDisplayNameUnique] '${displayName}' is taken by another user.`);
    } else {
        console.log(`[isDisplayNameUnique] '${displayName}' is taken by the current user, which is allowed.`);
    }

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
  console.log(`[updateUserProfile] Starting profile update for user: ${user.uid}`);
  const { displayName, photoFile, bannerFile } = data;
  const userDocRef = doc(firestore, 'users', user.uid);
  
  const firestoreUpdateData: { [key: string]: any } = {};

  // 1. Handle Display Name
  if (displayName) {
    console.log(`[updateUserProfile] Received new displayName: '${displayName}'`);
    const isUnique = await isDisplayNameUnique(firestore, displayName, user.uid);
    if (!isUnique) {
      console.error(`[updateUserProfile] Display name '${displayName}' is not unique.`);
      throw new Error('Display name is already taken or invalid. Please choose another one.');
    }
    // Update both Auth and Firestore if it's different
    if (displayName !== user.displayName) {
      console.log(`[updateUserProfile] Updating Firebase Auth profile with new displayName.`);
      await updateProfile(user, { displayName });
    }
    firestoreUpdateData.displayName = displayName;
  }

  // 2. Ensure Firestore document has a display name
  console.log(`[updateUserProfile] Checking for existing document for user ${user.uid}`);
  const docSnap = await getDoc(userDocRef);
  if (!docSnap.exists() || !docSnap.data()?.displayName) {
     console.log(`[updateUserProfile] Document does not exist or has no displayName.`);
     if (!firestoreUpdateData.displayName) {
        console.log(`[updateUserProfile] No new displayName provided, generating a unique one.`);
        // If no new name provided and none exists, generate one.
        const baseName = user.email?.split('@')[0] || `user`;
        let newDisplayName = `${baseName}${Math.floor(Math.random() * 1000)}`;
        let attempts = 0;
        while (!(await isDisplayNameUnique(firestore, newDisplayName, user.uid)) && attempts < 10) {
            attempts++;
            newDisplayName = `${baseName}${Math.floor(Math.random() * 10000)}`;
        }
        if (attempts >= 10) {
            console.error('[updateUserProfile] Failed to generate a unique display name after 10 attempts.');
            throw new Error("Failed to generate a unique display name.");
        }
        
        console.log(`[updateUserProfile] Generated unique name: '${newDisplayName}'. Updating Auth and Firestore.`);
        firestoreUpdateData.displayName = newDisplayName;
        if (user.displayName !== newDisplayName) {
            await updateProfile(user, { displayName: newDisplayName });
        }
     }
  }

  // 3. Handle file uploads
  if (photoFile) {
    console.log(`[updateUserProfile] Converting photoFile to data URL.`);
    firestoreUpdateData.photoURL = await fileToDataUrl(photoFile);
    console.log(`[updateUserProfile] photoURL set.`);
  }
  if (bannerFile) {
    console.log(`[updateUserProfile] Converting bannerFile to data URL.`);
    firestoreUpdateData.bannerURL = await fileToDataUrl(bannerFile);
    console.log(`[updateUserProfile] bannerURL set.`);
  }

  // 4. Perform the Firestore update
  // Always set the UID field for consistency.
  firestoreUpdateData.uid = user.uid;
  console.log(`[updateUserProfile] Committing data to Firestore at 'users/${user.uid}'.`, firestoreUpdateData);
  await setDoc(userDocRef, firestoreUpdateData, { merge: true });
  console.log(`[updateUserProfile] Firestore document successfully updated for user ${user.uid}.`);

  return user.uid;
}
