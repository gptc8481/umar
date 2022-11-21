import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
  Button,
} from "react-native";
import {
  ColorPicker,
  TriangleColorPicker,
  fromHsv,
} from "react-native-color-picker";

const { width, height } = Dimensions.get("window");

const Test = () => {
  const [mode, setMode] = useState("playerBackgroundColor");
  const [theme, setTheme] = useState({});

  useEffect(() => {
    getMyObject().then(lastTheme => {
      setTheme(lastTheme)
    })
  },[])

  const setObjectValue = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('@SpotTube_theme', jsonValue)
    } catch(e) {
      // save error
    }
  
    console.log('SetItem Done.')
  }

  const getMyObject = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@SpotTube_theme')
      if(jsonValue === null){
        await setObjectValue({
          backgroundColor: "#333333",
          playerBackgroundColor: "#7878d1",
        })
      }
      return jsonValue != null ? JSON.parse(jsonValue) : {
        backgroundColor: "#333333",
        playerBackgroundColor: "#7878d1",
      }
    } catch(e) {
      console.log(e)
    }
  
    console.log('GetItem Done.')
  
  }

  if(!theme.backgroundColor){
    return <View><Text>App is loading</Text></View>
  }

  return (
    <View style={styles.container}>
      <View style={styles.modeSelector}>
        <Pressable onPress={() => setMode("backgroundColor")}>
          <View
            style={{
              ...styles.btn,
              backgroundColor: mode === "backgroundColor" ? "blue" : "grey",
            }}
          >
            <Text style={{ color: "white" }}>Background</Text>
          </View>
        </Pressable>
        <Pressable onPress={() => setMode("playerBackgroundColor")}>
          <View
            style={{
              ...styles.btn,
              backgroundColor:
                mode === "playerBackgroundColor" ? "blue" : "grey",
            }}
          >
            <Text style={{ color: "white" }}>Player</Text>
          </View>
        </Pressable>
      </View>
      <ColorPicker
        style={styles.colorPicker}
        defaultColor={theme.playerBackgroundColor}
        onColorChange={(color) =>
          setTheme((prevTheme) => {
            return {
              ...prevTheme,
              [mode]: fromHsv(color),
            };
          })
        }
      />
      <View style={styles.displayCont}>
        <View
          style={{
            ...styles.displayScroll,
            backgroundColor: theme.backgroundColor,
          }}
        ></View>
        <View
          style={{
            ...styles.displayPlayer,
            backgroundColor: theme.playerBackgroundColor,
          }}
        ></View>
      </View>
      <Button styles={{ width: "100%" }} title="Save" onPress={() => {setObjectValue(theme)}} />
      <Button styles={{ width: "100%"}} title="Reset" onPress={() => {setObjectValue({
        backgroundColor: "#333333",
        playerBackgroundColor: "#7878d1",});
        setTheme({
          backgroundColor: "#333333",
          playerBackgroundColor: "#7878d1",})
        }} />
    </View>
  );
};

export default Test;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  colorPicker: {
    width,
    height: 300,
  },
  displayCont: {
    flex: 1,
    margin: 10,
  },
  displayScroll: {
    width: "100%",
    height: "100%",
    backgroundColor: "#333333",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderColor: "#7878d1",
    borderWidth: 1,
  },
  displayPlayer: {
    position: "absolute",
    height: 50,
    width: "100%",
    bottom: 0,
    backgroundColor: "#7878d1",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderColor: "yellow",
    borderWidth: 2,
    borderBottomWidth: 0,
  },
  modeSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
    paddingHorizontal: 10,
  },
  btn: {
    width: "100%",
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "blue",
    color: "white",
  },
});
