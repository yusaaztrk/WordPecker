import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { useRouter, useRootNavigationState } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useTheme } from "@/components/ThemeProvider";

export default function AuthLayout() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const navigationState = useRootNavigationState();
  const { colors } = useTheme();

  // Redirect to home if already authenticated
  useEffect(() => {
    // Only attempt to navigate once the navigation is ready
    if (!navigationState?.key) return;
    
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, navigationState?.key]);

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          title: "Register",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: "Reset Password",
        }}
      />
    </Stack>
  );
}