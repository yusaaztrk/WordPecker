import React, { useEffect } from "react";
import { Tabs } from "expo-router";
import { useRouter, useRootNavigationState } from "expo-router";
import { Home, BookOpen, BarChart, Settings, Search } from "lucide-react-native";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/components/ThemeProvider";
import { useWordListStore } from "@/store/wordListStore";
import { useLearningStore } from "@/store/learningStore";

export default function TabLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { fetchLists } = useWordListStore();
  const { fetchSessions, updateStats } = useLearningStore();

  const navigationState = useRootNavigationState();
  const { colors } = useTheme();

  // Check authentication status and redirect if needed
  useEffect(() => {
    // Only attempt to navigate once the navigation is ready
    if (!navigationState?.key) return;

    if (!isAuthenticated && !authLoading) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated) {
      // Fetch data when authenticated
      fetchLists().catch(console.error);
      fetchSessions().catch(console.error);
      updateStats().catch(console.error);
    }
  }, [isAuthenticated, authLoading, navigationState?.key]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ana Sayfa",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: "Listelerim",
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Arama",
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "İlerleme",
          tabBarIcon: ({ color }) => <BarChart size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ayarlar",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}