import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, StatusBar } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useTheme } from "@/components/ThemeProvider";
import { useAuthStore } from "@/store/authStore";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Check authentication status when app loads
      checkAuth().finally(() => {
        SplashScreen.hideAsync();
      });
    }
  }, [loaded, checkAuth]);

  if (!loaded) {
    return <Slot />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  const { colors, theme } = useTheme();
  
  return (
    <>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: "modal",
            title: "Bilgi"
          }} 
        />
        <Stack.Screen 
          name="list/[id]" 
          options={{ 
            title: "Liste Detayları",
          }} 
        />
        <Stack.Screen 
          name="list/create" 
          options={{ 
            title: "Liste Oluştur",
          }} 
        />
        <Stack.Screen 
          name="list/edit/[id]" 
          options={{ 
            title: "Listeyi Düzenle",
          }} 
        />
        <Stack.Screen 
          name="word/add/[listId]" 
          options={{ 
            title: "Kelime Ekle",
          }} 
        />
        <Stack.Screen 
          name="word/edit/[id]" 
          options={{ 
            title: "Kelimeyi Düzenle",
          }} 
        />
        <Stack.Screen 
          name="learn/[listId]" 
          options={{ 
            title: "Öğrenme Modu",
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="test/[listId]" 
          options={{ 
            title: "Test Modu",
            headerShown: false,
          }} 
        />
      </Stack>
    </>
  );
}