import { ApiError } from './api.types';

const BY_CODE: Record<string, string> = {
  INVALID_CREDENTIALS: 'Wrong username or password.',
  ACCOUNT_DISABLED: 'This account is disabled. Ask a manager to turn it back on.',
  ACCOUNT_LOCKED: 'Too many wrong attempts. Try again in 15 minutes.',
  INVALID_REFRESH_TOKEN: 'Your session has ended. Please sign in again.',
  VALIDATION_FAILED: 'Some fields need fixing.',
  NETWORK_ERROR: "Can't reach the server. Check the connection and try again.",
};

const BY_STATUS: Record<number, string> = {
  0: BY_CODE['NETWORK_ERROR'],
  400: 'Please check the form and try again.',
  401: BY_CODE['INVALID_REFRESH_TOKEN'],
  403: "You don't have permission to do that.",
  404: "We couldn't find that. It may have been deleted.",
  409: 'Someone else changed this. Reload and try again.',
  423: BY_CODE['ACCOUNT_LOCKED'],
  429: 'Too many requests. Wait a moment and try again.',
};

/** Our wording for the code, then the server's message, then a message for the status. */
export function readableMessage(status: number, code?: string, serverMessage?: string): string {
  return (
    (code && BY_CODE[code]) ||
    serverMessage ||
    BY_STATUS[status] ||
    (status >= 500 ? 'The server had a problem. Please try again.' : 'Something went wrong. Please try again.')
  );
}

/** Use in components: toast.error('Could not save', errorMessage(e)) */
export function errorMessage(e: unknown): string {
  return e instanceof ApiError ? e.message : 'Something went wrong. Please try again.';
}
