import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import * as SystemUI from 'expo-system-ui';

import App from './App';

SystemUI.setBackgroundColorAsync('#0E0A07');

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
const { registerPlaybackService } = require('./src/services/audio/registerPlaybackService');
registerPlaybackService();

registerRootComponent(App);

