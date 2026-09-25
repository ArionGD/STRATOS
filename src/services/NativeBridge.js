/**
 * Stratos Native Bridge
 * Talks to the Expo Android shell (mobile/) when the web app runs inside its WebView.
 * In a normal browser every call here is a no-op.
 */

export const isNativeShell = typeof window !== 'undefined' && !!window.ReactNativeWebView;

export function postToNative(message) {
  if (isNativeShell) window.ReactNativeWebView.postMessage(JSON.stringify(message));
}

/**
 * Registers the handler the shell calls when the Android back button is pressed.
 * The handler returns true if it closed something (sheet, editor, view),
 * false to let the shell decide (leave the app).
 */
export function setBackHandler(handler) {
  if (!isNativeShell) return () => {};
  window.__stratosHandleBack = handler;
  return () => {
    if (window.__stratosHandleBack === handler) delete window.__stratosHandleBack;
  };
}
