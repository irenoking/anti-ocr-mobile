import {Alert, NativeModules, StatusBar, StyleSheet, View} from 'react-native';
import WebView from 'react-native-webview';
import {SafeAreaProvider} from 'react-native-safe-area-context';

export default function App() {
  const onMessage = async (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'save-image' && message.dataUrl) {
        await NativeModules.AntiOcrMedia.savePng(message.dataUrl);
        Alert.alert('已保存', '安全图片已保存到系统相册。');
      }
    } catch (error) { Alert.alert('保存失败', String(error)); }
  };
  return <SafeAreaProvider><StatusBar barStyle="dark-content" backgroundColor="#fffaf5" />
    <View style={styles.root}><WebView source={{uri: 'file:///android_asset/workspace/index.html'}} javaScriptEnabled domStorageEnabled allowFileAccess allowFileAccessFromFileURLs originWhitelist={['*']} onMessage={onMessage} /></View>
  </SafeAreaProvider>;
}
const styles = StyleSheet.create({root: {flex: 1, backgroundColor: '#fffaf5'}});
