import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import HomeScreen from './src/screens/HomeScreen';
import FeaturePlaceholder from './src/screens/placeholders/FeaturePlaceholder';
import theme from './src/styles/theme';

// Define the navigator parameters
type RootStackParamList = {
  Home: undefined;
  FeaturePlaceholder: { featureId: number; featureName: string; description: string };
};

const Stack = createStackNavigator<RootStackParamList>();

function App(): JSX.Element {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: '#4CAF50',
            background: '#0F172A',
            card: '#1E293B',
            text: '#FFFFFF',
            border: '#334155',
            notification: '#FF9800',
          },
          fonts: {
            regular: {
              fontFamily: 'System',
              fontWeight: 'normal',
            },
            medium: {
              fontFamily: 'System',
              fontWeight: '500',
            },
            bold: {
              fontFamily: 'System',
              fontWeight: '700',
            },
            heavy: {
              fontFamily: 'System',
              fontWeight: '800',
            },
          },
        }}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1E293B',
              },
              headerTintColor: '#FFFFFF',
              // Sorun çözümü: headertitleStyle içindeki fontWeight kaldırıldı
              headerTitleStyle: {
                color: '#FFFFFF',
              },
              cardStyle: { backgroundColor: '#0F172A' }
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'WordPecker Mobile Challenge' }}
            />
            <Stack.Screen
              name="FeaturePlaceholder"
              component={FeaturePlaceholder}
              options={({ route }) => ({ title: route.params.featureName })}
            />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});

export default App;