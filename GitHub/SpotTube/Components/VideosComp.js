import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PanGestureHandler, ScrollView } from "react-native-gesture-handler";
import VideoComp from "./VideoComp";

const VideosComp = ({ goUp, videos, setCurrentVideo }) => {
  const uris = videos.map((video) => video.uri.slice(27));

  let paths = {};
  // abc/123/xyz
  // abc/edc/edf
  // esf/efr

  return (
    <ScrollView scrollEventThrottle={16} bounces={false}>
      <View>
        <Text>{uris.toString()}</Text>
        {videos.map((video, i) => {
          return (
            <VideoComp
              setCurrentVideo={setCurrentVideo}
              key={i}
              video={video}
              index={i}
              goUp={goUp}
            />
          );
        })}
      </View>
    </ScrollView>
  );
};

export default VideosComp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
