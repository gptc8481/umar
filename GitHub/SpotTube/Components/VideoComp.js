import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
  Pressable,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import * as VideoThumbnails from "expo-video-thumbnails";

const { width, height } = Dimensions.get("window");

const CARD_HEIGHT = 200;

const VideoComp = ({ goUp, index, video, setCurrentVideo }) => {
  const [thumbnail, setThumbnail] = useState(null);
  const date = new Date(0);
  date.setSeconds(video.duration);
  const duration = date.toISOString().substr(11, 8);

  useEffect(() => {
    generateThumbnail();
  }, []);
  const generateThumbnail = async () => {
    try {
      const { uri } = await VideoThumbnails.getThumbnailAsync(video.uri, {
        time: 15000,
      });
      setThumbnail(uri);
    } catch (e) {
      console.warn(e);
    }
  };
  return (
    <Pressable
      onPress={() => {
        setCurrentVideo(video);
        goUp();
      }}
      style={styles.container}
    >
      {thumbnail ? (
        <Image source={{ uri: thumbnail }} style={styles.thumbnailImage} />
      ) : (
        <View
          style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "grey" }}
        ></View>
      )}
      <View style={styles.infoCont}>
        <Text style={styles.infoHeading}>{video.filename}</Text>
        <Text style={styles.infoResolution}>
          {video.width + "x" + video.height}
        </Text>
        <Text style={styles.infoDuration}>{duration}</Text>
      </View>
    </Pressable>
  );
};

export default VideoComp;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: CARD_HEIGHT,
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  infoCont: {
    position: "absolute",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  infoHeading: {
    color: "white",
    backgroundColor: "#2225",
  },
  infoResolution: {
    color: "white",
    backgroundColor: "#2225",
    position: "absolute",
    left: 0,
    bottom: 0,
  },
  infoDuration: {
    color: "white",
    backgroundColor: "#2225",
    position: "absolute",
    right: 0,
    bottom: 0,
  },
});
