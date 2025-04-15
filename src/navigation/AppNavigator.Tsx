// src/navigation/AppNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import WordListsScreen from '../screens/WordListsScreen';
import CreateListScreen from '../screens/lists/CreateListScreen';
import ListDetailScreen from '../screens/ListDetailScreen';
import AddWordScreen from '../screens/AddWordScreen';
import LearningScreen from '../screens/LearningScreen';
import QuizScreen from '../screens/QuizScreen';
import ProgressScreen from '../screens/ProgressScreen';
import SearchScreen from '../screens/SearchScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Innovative Features
import ScanWordsScreen from '../screens/ScanWordsScreen';
import MicroLearningScreen from '../screens/MicroLearningScreen';

// Placeholder
import FeaturePlaceholder from '../screens/placeholders/FeaturePlaceholder';

import { useAuth } from '../context/AuthContext';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

// Auth Stack
const AuthStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ 
          title: 'Giriş Yap',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ 
          title: 'Kayıt Ol',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ title: 'Şifremi Unuttum' }} 
      />
    </Stack.Navigator>
  );
};

// Home Tab Stack
const HomeStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'WordPecker' }} 
      />
      <Stack.Screen 
        name="ListDetail" 
        component={ListDetailScreen} 
        options={({ route }) => ({ 
          title: route.params?.name || 'Liste Detayı' 
        })} 
      />
      <Stack.Screen 
        name="Learning" 
        component={LearningScreen} 
        options={{ title: 'Öğrenme Modu' }} 
      />
      <Stack.Screen 
        name="Quiz" 
        component={QuizScreen} 
        options={{ title: 'Test Modu' }} 
      />
      <Stack.Screen 
        name="AddWord" 
        component={AddWordScreen} 
        options={{ title: 'Kelime Ekle' }} 
      />
      <Stack.Screen 
        name="FeaturePlaceholder" 
        component={FeaturePlaceholder} 
        options={({ route }) => ({ 
          title: route.params?.featureName || 'Özellik' 
        })} 
      />
    </Stack.Navigator>
  );
};

// Lists Tab Stack
const ListsStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen 
        name="WordLists" 
        component={WordListsScreen} 
        options={{ title: 'Kelime Listeleri' }} 
      />
      <Stack.Screen 
        name="CreateList" 
        component={CreateListScreen} 
        options={{ title: 'Liste Oluştur' }} 
      />
      <Stack.Screen 
        name="ListDetail" 
        component={ListDetailScreen} 
        options={({ route }) => ({ 
          title: route.params?.name || 'Liste Detayı' 
        })} 
      />
      <Stack.Screen 
        name="AddWord" 
        component={AddWordScreen} 
        options={{ title: 'Kelime Ekle' }} 
      />
    </Stack.Navigator>
  );
};

// Progress Tab Stack
const ProgressStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen 
        name="Progress" 
        component={ProgressScreen} 
        options={{ title: 'İlerleme' }} 
      />
    </Stack.Navigator>
  );
};

// Search Tab Stack
const SearchStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen 
        name="Search" 
        component={SearchScreen} 
        options={{ title: 'Ara' }} 
      />
    </Stack.Navigator>
  );
};

// Settings Tab Stack
const SettingsStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Ayarlar' }} 
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profil' }} 
      />
    </Stack.Navigator>
  );
};

// Innovative Features Stack
const InnovativeStack = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen 
        name="ScanWords" 
        component={ScanWordsScreen} 
        options={{ title: 'Kelime Tarama' }} 
      />
      <Stack.Screen 
        name="MicroLearning" 
        component={MicroLearningScreen} 
        options={{ title: 'Mikro Öğrenme' }} 
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const MainTabs = () => {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ListsTab') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'SearchTab') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'ProgressTab') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'InnovativeTab') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: '#334155',
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          paddingBottom: 5,
        }
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Ana Sayfa' }} />
      <Tab.Screen name="ListsTab" component={ListsStack} options={{ title: 'Listeler' }} />
      <Tab.Screen name="InnovativeTab" component={InnovativeStack} options={{ title: 'Tara' }} />
      <Tab.Screen name="SearchTab" component={SearchStack} options={{ title: 'Ara' }} />
      <Tab.Screen name="ProgressTab" component={ProgressStack} options={{ title: 'İlerleme' }} />
      <Tab.Screen name="SettingsTab" component={SettingsStack} options={{ title: 'Ayarlar' }} />
    </Tab.Navigator>
  );
};

// Splash Screen Component
const SplashScreen = () => {
  const theme = useTheme();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={HomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};

// Main Navigator
const AppNavigator = () => {
  const { authState } = useAuth();

  if (authState.isLoading) {
    return <SplashScreen />;
  }

  return authState.isAuthenticated ? <MainTabs /> : <AuthStack />;
};

export default AppNavigator;