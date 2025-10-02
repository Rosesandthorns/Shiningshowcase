import { getApps, initializeApp, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './config';

export function initializeFirebase() {
  const isInitialized = getApps().length > 0;
  const firebaseApp = isInitialized ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(firebaseApp);

  return { firebaseApp, auth };
}

export {
  FirebaseProvider,
  useAuth,
  useFirebase,
  useFirebaseApp,
} from './provider';

export { FirebaseClientProvider } from './client-provider';

export { useUser } from './auth/use-user';

export type { User } from 'firebase/auth';
