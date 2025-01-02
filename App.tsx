import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GameScreen } from './src/screens/GameScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GameScreen />
    </GestureHandlerRootView>
  );
}
