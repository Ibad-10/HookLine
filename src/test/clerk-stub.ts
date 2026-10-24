// Test stand-in for @clerk/nextjs/server: nobody is signed in.
export const auth = async () => ({ userId: null, isAuthenticated: false, redirectToSignIn: () => null });
export const currentUser = async () => null;
export const clerkMiddleware = () => () => undefined;
