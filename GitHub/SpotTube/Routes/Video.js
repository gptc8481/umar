import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Pressable,
  Button,
} from "react-native";
import { Video } from "expo-av";
import { theme } from "../config";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  runOnJS,
} from "react-native-reanimated";
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";

import * as MediaLibrary from "expo-media-library";
import VideosComp from "../Components/VideosComp";

const { width, height } = Dimensions.get("window");

const BAR_HEIGHT = 60;

const BREAK_POINT = 100;

const Videos = () => {
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [playbackControls, setPlaybackControls] = useState(true);

  const [userVideos, setUserVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState({});

  const togglePlaybackControls = () => {
    // if (!playbackControls) {
    //   setTimeout(() => {
    //     setPlaybackControls(false);
    //   }, 5000);
    // }
    setPlaybackControls((last) => setPlaybackControls(!last));
  };

  useEffect(() => {
    getVideos();
  }, []);

  useEffect(() => {
    video?.current?.playAsync();
  }, [currentVideo]);

  const getVideos = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        const userVideosTemp = await MediaLibrary.getAssetsAsync({
          first: 999,
          mediaType: MediaLibrary.MediaType.video,
        });
        setUserVideos(userVideosTemp.assets);
        setCurrentVideo(
          userVideosTemp.assets.length > 0 ? userVideosTemp.assets[0] : {}
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const translateY = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const state = useSharedValue("down");

  const onGestureEvent = useAnimatedGestureHandler({
    onActive: ({ translationY }) => {
      translateY.value = translationY + offsetY.value;
    },
    onEnd: ({ translationY, velocityY }) => {
      const point = translationY + 0.2 * velocityY;
      if (state.value === "down") {
        if (point > 0) {
          // Go down rather close the player
          translateY.value = withTiming(BAR_HEIGHT);
          offsetY.value = BAR_HEIGHT;
        } else {
          // Go up
          translateY.value = withTiming(-(height - BAR_HEIGHT));
          offsetY.value = -(height - BAR_HEIGHT);
          state.value = "up";
        }
      } else if (state.value === "up") {
        if (point > 0) {
          // Go down
          translateY.value = withTiming(0);
          offsetY.value = 0;
          state.value = "down";
          runOnJS(setPlaybackControls)(false);
        } else {
          // Go Full Screen
          // TODO: full screen is not happenig... only God knows why
          translateY.value = withTiming(-(height - BAR_HEIGHT));
          offsetY.value = -(height - BAR_HEIGHT);
        }
      }
    },
  });

  const videoContStyle = useAnimatedStyle(() => {
    return {
      width,
      height,
      backgroundColor: "white",
      position: "absolute",
      zIndex: 2,
      top: 0,
      transform: [{ translateY: height - BAR_HEIGHT + translateY.value }],
    };
  });

  const playerContStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        translateY.value,
        [-(height - BAR_HEIGHT), 0],
        [225, BAR_HEIGHT]
      ),
      width: "100%",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "black",
    };
  });

  const videoPlaybackContStyle = useAnimatedStyle(() => {
    return {
      width:
        translateY.value < -BREAK_POINT
          ? "100%"
          : interpolate(
              translateY.value,
              [-BREAK_POINT, 0],
              [width, width / 2]
            ),
      height: "100%",
      position: "relative",
    };
  });

  const goUp = () => {
    translateY.value = withTiming(-(height - BAR_HEIGHT));
    offsetY.value = -(height - BAR_HEIGHT);
    state.value = "up";
  };

  const goDown = () => {
    translateY.value = withTiming(0);
    offsetY.value = 0;
    state.value = "down";
  };

  const goToThisPosition = (translationX) => {
    "worklet";
    const pos = translationX / width;
    runOnJS(setPlaybackPosition)(pos * status.durationMillis);
  };

  function setPlaybackPosition(positionToGoTo) {
    video?.current?.setPositionAsync(positionToGoTo + status.positionMillis);
  }

  const progressGesture = useAnimatedGestureHandler({
    onStart: () => {},
    onActive: () => {},
    onEnd: ({ x }) => {
      goToThisPosition(x);
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.mainCont}>
        {userVideos.length > 0 && (
          <VideosComp
            goUp={goUp}
            setCurrentVideo={setCurrentVideo}
            videos={userVideos}
          />
        )}
      </View>
      <Animated.View style={videoContStyle}>
        <View style={styles.gestureCont}>
          <PanGestureHandler onGestureEvent={onGestureEvent}>
            <Animated.View style={playerContStyle}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => {
                  togglePlaybackControls();
                }}
              >
                <Animated.View style={videoPlaybackContStyle}>
                  <Video
                    ref={video}
                    style={styles.video}
                    source={{
                      uri: currentVideo.uri,
                    }}
                    useNativeControls={false}
                    resizeMode="stretch"
                    onPlaybackStatusUpdate={(newstatus) => {
                      setStatus(newstatus);
                    }}
                  />
                  {playbackControls && (
                    <Animated.View style={styles.playbackControlsCont}>
                      <View style={styles.controllerHeader}>
                        <Pressable
                          onPress={() => {
                            goDown();
                          }}
                        >
                          <AntDesign
                            style={styles.goDownButton}
                            name="down"
                            size={20}
                            color="white"
                          />
                        </Pressable>
                        <Text style={styles.controllerName} numberOfLines={1}>
                          {
                            "A video name will be shown here. It may be too long so be prepard for that"
                          }
                        </Text>
                        <View style={styles.controllerOption}>
                          <Entypo
                            style={styles.controllerOptionIcon}
                            name="dots-three-vertical"
                            size={16}
                            color="white"
                          />
                        </View>
                      </View>
                      <View style={styles.controllerMiddle}>
                        <Pressable
                          onPress={() => {
                            if (status.positionMillis < 5001) {
                              video?.current?.setPositionAsync(0);
                            } else {
                              video?.current?.setPositionAsync(
                                status.positionMillis - 5000
                              );
                            }
                          }}
                        >
                          <Entypo
                            name="controller-fast-backward"
                            size={28}
                            color="white"
                          />
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            if (status.isPlaying) {
                              video?.current?.pauseAsync();
                            } else {
                              video?.current?.playAsync();
                            }
                          }}
                        >
                          {status.isPlaying ? (
                            <Ionicons
                              name="ios-pause"
                              size={36}
                              color="white"
                            />
                          ) : (
                            <Entypo
                              name="controller-play"
                              size={36}
                              color="white"
                            />
                          )}
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            if (
                              status.positionMillis + 5000 >
                              status.durationMillis
                            ) {
                              video?.current?.setPositionAsync(
                                status.durationMillis
                              );
                            } else {
                              video?.current?.setPositionAsync(
                                status.positionMillis + 5000
                              );
                            }
                          }}
                        >
                          <Entypo
                            name="controller-fast-forward"
                            size={28}
                            color="white"
                          />
                        </Pressable>
                      </View>
                      <View style={styles.controllerProgress}>
                        <View style={styles.progressBackground}></View>
                        <View
                          style={{
                            height: "100%",
                            backgroundColor: "red",
                            width:
                              status.positionMillis > 0
                                ? (width * status.positionMillis) /
                                  status.durationMillis
                                : 0,
                          }}
                        ></View>
                        <PanGestureHandler onGestureEvent={progressGesture}>
                          <Animated.View
                            style={{
                              ...styles.progressPoint,
                              left:
                                status.positionMillis > 0
                                  ? (width * status.positionMillis) /
                                    status.durationMillis
                                  : 0,
                            }}
                          ></Animated.View>
                        </PanGestureHandler>
                      </View>
                    </Animated.View>
                  )}
                </Animated.View>
              </Pressable>
            </Animated.View>
          </PanGestureHandler>
        </View>
      </Animated.View>
    </View>
  );
};

export default Videos;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.backgroundColor,
  },
  mainCont: {
    width,
    height,
  },
  videoCont: {
    width,
    height,
    backgroundColor: "lightblue",
    position: "absolute",
    zIndex: 2,
    top: 0,
    transform: [{ translateY: height - BAR_HEIGHT }],
  },
  playerCont: {
    height: BAR_HEIGHT,
    width: "100%",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "black",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  playbackControlsCont: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#0008",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  controllerHeader: {
    height: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  controllerMiddle: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
  },
  controllerProgress: {
    height: 2,
    width: "100%",
  },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff6",
  },
  progressPoint: {
    position: "absolute",
    width: 20,
    height: 20,
    borderRadius: 30,
    backgroundColor: "red",
    top: -7,
  },
  controllerName: {
    flex: 1,
    color: "white",
    marginHorizontal: 20,
  },
});
