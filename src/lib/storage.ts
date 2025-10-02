
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { type FirebaseApp } from 'firebase/app';
import { initializeFirebase } from '@/firebase';

// Initialize Firebase app if not already initialized
const { firebaseApp } = initializeFirebase();
const storage = getStorage(firebaseApp);

/**
 * Uploads a file to Firebase Storage.
 * @param file The file to upload.
 * @param path The path in Firebase Storage to upload the file to.
 * @returns A promise that resolves with the download URL of the uploaded file.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const storageRef = ref(storage, path);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('File upload failed.');
  }
}
