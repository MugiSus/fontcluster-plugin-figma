let active: NotificationHandler | null = null;

/**
 * Show a Figma toast, replacing any currently-visible one. Cancelling the
 * previous notification keeps toasts from queueing up (each waiting a few
 * seconds in FIFO order) so the newest message appears immediately.
 */
export function notify(message: string, options?: NotificationOptions) {
  active?.cancel();
  active = figma.notify(message, options);
  return active;
}
