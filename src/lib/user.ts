
import { doc, setDoc, Firestore } from 'firebase/firestore';
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

  const authUpdateData: { displayName?: string; photoURL?: string } = {};
  const firestoreUpdateData: { displayName?: string; photoURL?: string; bannerURL?: string } = {};

  if (displayName && displayName !== user.displayName) {
    authUpdateData.displayName = displayName;
    firestoreUpdateData.displayName = displayName;
  }

  if (photoFile) {
    const photoURL = await fileToDataUrl(photoFile);
    authUpdateData.photoURL = photoURL;
    firestoreUpdateData.photoURL = photoURL;
  }

  if (bannerFile) {
    const bannerURL = await fileToDataUrl(bannerFile);
    firestoreUpdateData.bannerURL = bannerURL;
  }

  // Update Firebase Authentication profile if there's anything to update
  if (Object.keys(authUpdateData).length > 0) {
    await updateProfile(user, authUpdateData);
  }

  // Update Firestore document
  if (Object.keys(firestoreUpdateData).length > 0) {
    await setDoc(userDocRef, firestoreUpdateData, { merge: true });
  }
}
