import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Home from "./Routes/Home";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import Music from "./Routes/Music";
import Videos from "./Routes/Video";
import Test from "./Routes/Test";

const Stack = createStackNavigator();

const app = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: false,
          headerShown: false,
          cardOverlayEnabled: false,
          cardStyle: { backgroundColor: "transparent" },
          animationEnabled: true,
          gestureDirection: "horizontal",
        }}
        mode="card"
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Music" component={Music} />
        <Stack.Screen name="Video" component={Videos} />
        <Stack.Screen name="Test" component={Test} />
      </Stack.Navigator>
      <StatusBar hidden />
    </NavigationContainer>
  );
};

export default app;
