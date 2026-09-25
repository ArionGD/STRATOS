/**
 * Stratos Android shell (Expo SDK 57)
 * Loads the hosted Stratos web app in a WebView and adds the native bits:
 * Android back button, status bar that follows the app theme, a loading
 * screen while the Render server wakes up, and an offline/retry screen.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

// Set per build profile in eas.json (EXPO_PUBLIC_* vars are inlined at build time)
const WEB_URL = (process.env.EXPO_PUBLIC_STRATOS_URL || 'https://stratos.onrender.com').replace(/\/+$/, '');
const ORIGIN = WEB_URL.match(/^https?:\/\/[^/]+/i)[0].toLowerCase();

const COLORS = {
  light: { bg: '#F8FAFC', text: '#0F172A', muted: '#64748B', bar: 'dark' },
  dark: { bg: '#0F172A', text: '#FFFFFF', muted: '#94A3B8', bar: 'light' }
};

// Asks the web app to close its top-most panel; it replies with a 'back' message
const BACK_SCRIPT = `(function () {
  var h = window.__stratosHandleBack;
  var handled = typeof h === 'function' ? !!h() : null;
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'back', handled: handled }));
})(); true;`;

export default function App() {
  const webRef = useRef(null);
  const canGoBack = useRef(false);
  const [theme, setTheme] = useState('light');
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const c = COLORS[theme];

  // Keep the native splash briefly; after that show our own loader so a
  // sleeping Render instance doesn't look like a frozen app
  useEffect(() => {
    const t = setTimeout(() => SplashScreen.hideAsync(), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loaded || error) return;
    setSlow(false);
    const t = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(t);
  }, [loaded, error, attempt]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!loaded || error) return false; // let Android close the app
      webRef.current?.injectJavaScript(BACK_SCRIPT);
      return true;
    });
    return () => sub.remove();
  }, [loaded, error]);

  const onMessage = useCallback((event) => {
    let msg;
    try { msg = JSON.parse(event.nativeEvent.data); } catch { return; }

    if (msg.type === 'theme' && COLORS[msg.value]) setTheme(msg.value);

    if (msg.type === 'back') {
      if (msg.handled === true) return;               // web app closed a panel/view
      if (msg.handled === null && canGoBack.current) { // pages without a handler: normal history
        webRef.current?.goBack();
        return;
      }
      BackHandler.exitApp();
    }
  }, []);

  // Keep navigation inside the app's own site; open anything else in the browser
  const onShouldStartLoadWithRequest = useCallback((req) => {
    const url = (req.url || '').toLowerCase();
    if (url.startsWith(ORIGIN) || url.startsWith('about:') || url.startsWith('data:') || url.startsWith('blob:')) return true;
    Linking.openURL(req.url).catch(() => {});
    return false;
  }, []);

  const retry = () => {
    setError(null);
    setLoaded(false);
    setAttempt((n) => n + 1);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.root, { backgroundColor: c.bg }]} edges={['top', 'bottom']}>
        <StatusBar style={c.bar} />

        {!error && (
          <WebView
            key={attempt}
            ref={webRef}
            source={{ uri: WEB_URL }}
            style={{ backgroundColor: c.bg }}
            containerStyle={{ backgroundColor: c.bg }}
            onMessage={onMessage}
            onNavigationStateChange={(nav) => { canGoBack.current = nav.canGoBack; }}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            onLoadEnd={() => { setLoaded(true); SplashScreen.hideAsync(); }}
            onError={(e) => setError(e.nativeEvent.description || 'Could not reach Stratos')}
            onHttpError={(e) => { if (e.nativeEvent.statusCode >= 500) setError(`Server error ${e.nativeEvent.statusCode}`); }}
            onRenderProcessGone={() => retry()}
            domStorageEnabled
            javaScriptEnabled
            textZoom={100}
            overScrollMode="never"
            setSupportMultipleWindows={false}
            pullToRefreshEnabled={false}
            applicationNameForUserAgent="StratosAndroid/1.0"
          />
        )}

        {!loaded && !error && (
          <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: c.bg }]}>
            <Image source={require('./assets/splash-icon.png')} style={styles.logo} />
            <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 28 }} />
            {slow && (
              <Text style={[styles.hint, { color: c.muted }]}>
                Waking up the server…{'\n'}The first launch can take up to a minute.
              </Text>
            )}
          </View>
        )}

        {error && (
          <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: c.bg }]}>
            <Image source={require('./assets/splash-icon.png')} style={styles.logo} />
            <Text style={[styles.title, { color: c.text }]}>Can't reach Stratos</Text>
            <Text style={[styles.hint, { color: c.muted }]}>
              Check your internet connection and try again.
            </Text>
            <Pressable onPress={retry} style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}>
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  logo: { width: 112, height: 112 },
  title: { fontSize: 20, fontWeight: '800', marginTop: 24 },
  hint: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 16 },
  button: { marginTop: 28, backgroundColor: '#F59E0B', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' }
});
