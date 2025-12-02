
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useUser } from '@/firebase/auth/use-user';

function createErrorJson(error: any, user: any) {
  const { context } = error;
  const { operation, path, requestResourceData } = context;

  const authContext = user
    ? {
        uid: user.uid,
        token: {
          name: user.displayName,
          picture: user.photoURL,
          email: user.email,
          email_verified: user.emailVerified,
          firebase: {
            // This is a simplified representation.
            // Actual token has more details but this is sufficient for debugging.
            identities: user.providerData.reduce((acc: any, p: any) => {
                acc[p.providerId] = [p.uid];
                return acc;
            }, {}),
            sign_in_provider: user.providerData[0]?.providerId || 'unknown',
          },
        },
      }
    : null;

  return JSON.stringify(
    {
      auth: authContext,
      method: operation,
      path: `/databases/(default)/documents/${path}`,
      request: {
        resource: {
          data: requestResourceData,
        },
      },
    },
    null,
    2
  );
}


export function FirebaseErrorListener() {
  const { user } = useUser();

  useEffect(() => {
    const handleError = (error: any) => {
      const errorJson = createErrorJson(error, user);
      const fullErrorMessage = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${errorJson}`;
      
      // Throwing the error here will make it appear in the Next.js error overlay
      // during development, which is exactly what we want for debugging.
      throw new Error(fullErrorMessage);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.removeListener('permission-error', handleError);
    };
  }, [user]);

  return null; // This component does not render anything
}
