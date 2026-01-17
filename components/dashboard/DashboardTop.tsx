import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { API } from "@/api/api";
import { useMutation } from "@tanstack/react-query";
import {
  launchImageLibrary,
  ImagePickerResponse,
  Asset,
} from "react-native-image-picker";
import { useAuthManager } from "@/hooks/useAuthManager";
import { format } from "date-fns";
import { useMediaLib } from "@/hooks/useMedia";

type ImageSource = { uri: string } | null;

export default function DashboardTop() {
  const { pickMedia } = useMediaLib(true);
  const [isMobile, setIsMobile] = useState(
    Dimensions.get("window").width < 768
  );
  const { activeUser, userMeta, userFiles, invalidateUserData } =
    useAuthManager();

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setIsMobile(window.width < 768);
    });
    return () => subscription.remove();
  }, []);

  const mutation = useMutation({
    mutationFn: (args: [Asset, string]) => API.updateProfileImages(...args),
    onSuccess: () => {
      return invalidateUserData();
    },
  });

  const handleImagePicker = async (type: "profile" | "cover") => {
    const [asset] = await pickMedia(true);
    if (!asset) return;
    if (type === "profile") {
      mutation.mutate([asset, "avatar"]);
    } else if (type === "cover") {
      mutation.mutate([asset, "coverImage"]);
    }
  };

  if (isMobile) {
    // Preserve exact mobile layout
    return (
      <>
        <View style={styles.coverPhotoContainer as ViewStyle}>
          <Image
            source={{
              uri: API.url(userFiles.coverImage.url),
            }}
            style={styles.coverPhoto as ImageStyle}
          />
          <TouchableOpacity
            style={styles.editCoverPhoto as ViewStyle}
            onPress={() => handleImagePicker("cover")}
          >
            <CustomIcon name="edit" size={moderateScale(18)} color="#C72937" />
          </TouchableOpacity>
          <View style={styles.avatarContainer as ViewStyle}>
            <Image
              source={{ uri: API.url(userFiles.avatar.url) }}
              style={styles.avatar as ImageStyle}
            />
            <TouchableOpacity
              style={styles.editProfilePhoto as ViewStyle}
              onPress={() => handleImagePicker("profile")}
            >
              <CustomIcon
                name="edit"
                size={moderateScale(18)}
                color="#C72937"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.profileDetailsContainer as ViewStyle}>
            <Text style={styles.greeting as TextStyle}>Hello,</Text>
            <Text style={styles.name as TextStyle}>{activeUser.fullName}</Text>
          </View>
        </View>
        <View style={styles.profileInfo as ViewStyle}>
          <View style={styles.infoRow as ViewStyle}>
            <CustomIcon
              name="user-circle"
              size={moderateScale(20)}
              color="#C72937"
              style={styles.iconB as TextStyle}
            />
            <Text
              style={[
                styles.label as TextStyle,
                styles.memberSinceBg as TextStyle,
              ]}
            >
              Member Since: {format(new Date(userMeta.createdAt), "dd MMM yy")}
            </Text>
          </View>
          <View style={styles.infoRow as ViewStyle}>
            <CustomIcon
              name="clock-circle"
              size={moderateScale(20)}
              color="#C72937"
              style={styles.iconB as TextStyle}
            />
            <Text
              style={[
                styles.label as TextStyle,
                styles.joinedOnBg as TextStyle,
              ]}
            >
              {format(new Date(userMeta.createdAt), "dd MMM yy")}
            </Text>
          </View>
          <View style={styles.infoRow as ViewStyle}>
            <CustomIcon
              name="eye-01"
              size={moderateScale(20)}
              color="#C72937"
              style={styles.iconB as TextStyle}
            />
            <Text
              style={[
                styles.label as TextStyle,
                styles.profileViewsBg as TextStyle,
              ]}
            >
              0 Profile Views
            </Text>
          </View>
        </View>
      </>
    );
  }

  // Web Layout
  return (
    <View style={styles.webContainer as ViewStyle}>
      {/* Cover Photo Area */}
      <View style={styles.webCoverContainer as ViewStyle}>
        <Image
          source={{
            uri: API.url(userFiles.coverImage.url),
          }}
          style={styles.webCoverPhoto as ImageStyle}
        />
        <TouchableOpacity
          style={styles.editCoverPhoto as ViewStyle}
          onPress={() => handleImagePicker("cover")}
        >
          <CustomIcon name="edit" size={moderateScale(18)} color="#C72937" />
        </TouchableOpacity>
      </View>

      {/* Profile Section */}
      <View style={styles.webProfileSection as ViewStyle}>
        {/* Profile Photo - Floating with z-index */}
        <View style={styles.webAvatarContainer as ViewStyle}>
          <Image
            source={{ uri: API.url(userFiles.avatar.url) }}
            style={styles.webAvatar as ImageStyle}
          />
          <TouchableOpacity
            style={styles.editProfilePhoto as ViewStyle}
            onPress={() => handleImagePicker("profile")}
          >
            <CustomIcon name="edit" size={moderateScale(18)} color="#C72937" />
          </TouchableOpacity>
        </View>

        {/* Content Row */}
        <View style={styles.webContentRow as ViewStyle}>
          {/* Greeting Column */}
          <View style={styles.webGreetingColumn as ViewStyle}>
            <Text style={styles.webGreeting as TextStyle}>Hello,</Text>
            <Text style={styles.webName as TextStyle}>
              {activeUser.fullName}
            </Text>
          </View>

          {/* Stats Row */}
          <View style={styles.webStatsRow as ViewStyle}>
            <View style={styles.webStatItem as ViewStyle}>
              <CustomIcon
                name="user-circle"
                size={moderateScale(12)}
                color="#C72937"
              />
              <Text style={styles.webStatText as TextStyle}>
                Member Since:{" "}
                {format(new Date(userMeta.createdAt), "dd MMM yy")}
              </Text>
            </View>
            <View style={styles.webStatItem as ViewStyle}>
              <CustomIcon
                name="clock-circle"
                size={moderateScale(12)}
                color="#C72937"
              />
              <Text style={styles.webStatText as TextStyle}>
                {format(new Date(userMeta.createdAt), "dd MMM yy")}
              </Text>
            </View>
            <View style={styles.webStatItem as ViewStyle}>
              <CustomIcon
                name="eye-01"
                size={moderateScale(12)}
                color="#C72937"
              />
              <Text style={styles.webStatText as TextStyle}>
                0 Profile Views
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Preserve all existing mobile styles exactly as they are
  coverPhotoContainer: {
    position: "relative",
    marginBottom: moderateScale(50),
    padding: moderateScale(12),
  } as ViewStyle,
  coverPhoto: {
    width: "100%",
    height: moderateScale(95),
    borderRadius: moderateScale(12),
  } as ImageStyle,
  editCoverPhoto: {
    position: "absolute",
    top: moderateScale(10),
    right: moderateScale(10),
    backgroundColor: "transparent",
    borderRadius: moderateScale(10),
    padding: moderateScale(5),
    zIndex: 3,
  } as ViewStyle,
  avatarContainer: {
    position: "absolute",
    bottom: -moderateScale(30),
    left: "50%",
    transform: [{ translateX: -moderateScale(37.5) }],
    zIndex: 2,
  } as ViewStyle,
  avatar: {
    width: moderateScale(75),
    height: moderateScale(75),
    borderRadius: moderateScale(10),
    borderWidth: moderateScale(2),
    borderColor: "#fff",
    backgroundColor: "#000",
  } as ImageStyle,
  editProfilePhoto: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "transparent",
    borderRadius: moderateScale(10),
    padding: moderateScale(5),
    zIndex: 3,
  } as ViewStyle,
  profileDetailsContainer: {
    position: "absolute",
    bottom: -moderateScale(100),
    left: "0%",
    width: "100%",
    backgroundColor: "#141414",
  } as ViewStyle,
  greeting: {
    fontSize: moderateScale(14),
    fontWeight: "400",
    fontFamily: "poppins",
    color: "#696974",
    marginBottom: moderateScale(5),
    textAlign: "center",
  } as TextStyle,
  name: {
    fontSize: moderateScale(18),
    fontWeight: "500",
    fontFamily: "poppins",
    color: "#FAFAFB",
    textAlign: "center",
    paddingBottom: moderateScale(10),
  } as TextStyle,
  profileInfo: {
    marginTop: moderateScale(50),
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    marginBottom: moderateScale(1),
    padding: moderateScale(12),
    borderRadius: 15,
  } as ViewStyle,
  infoRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    padding: moderateScale(10),
    borderRadius: moderateScale(10),
    marginVertical: moderateScale(5),
  } as ViewStyle,
  iconB: {
    marginRight: moderateScale(8),
  } as TextStyle,
  label: {
    fontWeight: "600",
    fontFamily: "poppins",
    color: "#FAFAFB",
    flex: 1,
  } as TextStyle,
  memberSinceBg: {
    backgroundColor: "#252525",
    paddingHorizontal: moderateScale(5),
    borderRadius: moderateScale(5),
    color: "#FAFAFB",
    fontWeight: "400",
    fontFamily: "poppins",
  } as TextStyle,
  joinedOnBg: {
    backgroundColor: "#252525",
    paddingHorizontal: moderateScale(5),
    borderRadius: moderateScale(5),
    color: "#FAFAFB",
    fontWeight: "400",
    fontFamily: "poppins",
  } as TextStyle,
  profileViewsBg: {
    backgroundColor: "#252525",
    paddingHorizontal: moderateScale(5),
    borderRadius: moderateScale(5),
    color: "#FAFAFB",
    fontWeight: "400",
    fontFamily: "poppins",
  } as TextStyle,

  // Web-specific styles
  webContainer: {
    width: "100%",
    position: "relative",
  } as ViewStyle,
  webCoverContainer: {
    position: "relative",
    width: "98%",
    margin: moderateScale(10),
    height: moderateScale(140),
    marginBottom: moderateScale(60),
  } as ViewStyle,
  webCoverPhoto: {
    width: "100%",
    height: "100%",
    borderRadius: moderateScale(12),
  } as ImageStyle,
  webProfileSection: {
    position: "relative",
    marginTop: -moderateScale(65),
    paddingHorizontal: moderateScale(20),
    marginBottom: -35,
  } as ViewStyle,
  webAvatarContainer: {
    position: "absolute",
    top: -moderateScale(50),
    left: moderateScale(40),
    zIndex: 2,
  } as ViewStyle,
  webAvatar: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(10),
    borderWidth: moderateScale(2),
    borderColor: "#fff",
    // backgroundColor: "#000",
    backgroundColor: "#C72937",
  } as ImageStyle,
  webContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginLeft: moderateScale(160),
    paddingTop: moderateScale(10),
    height: moderateScale(100),
  } as ViewStyle,
  webGreetingColumn: {
    flexDirection: "column",
  } as ViewStyle,
  webGreeting: {
    fontSize: moderateScale(14),
    fontWeight: "400",
    fontFamily: "poppins",
    color: "#696974",
    marginBottom: moderateScale(2),
  } as TextStyle,
  webName: {
    fontSize: moderateScale(18),
    fontWeight: "500",
    fontFamily: "poppins",
    color: "#FAFAFB",
  } as TextStyle,
  webStatsRow: {
    flexDirection: "row",
    gap: moderateScale(10),
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    height: moderateScale(25),
    marginTop: moderateScale(5),
  } as ViewStyle,
  webStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
    backgroundColor: "#252525",
    padding: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(8),
  } as ViewStyle,
  webStatText: {
    fontSize: moderateScale(8),
    fontFamily: "poppins",
    color: "#FAFAFB",
  } as TextStyle,
});
