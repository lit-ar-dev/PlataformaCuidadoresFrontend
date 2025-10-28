import { Stack } from "expo-router";
import "react-native-reanimated";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="register"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}
