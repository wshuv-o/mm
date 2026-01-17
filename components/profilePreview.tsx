import React from "react";
import { View, Text, Image, StyleSheet, ImageStyle } from "react-native";
import { API } from "@/api/api";
import { useAuthManager } from "@/hooks/useAuthManager";
import { moderateScale } from "react-native-size-matters";

export default function ProfilePreview() {



  const { activeUser, userFiles } = useAuthManager();

  return (
    <View style={styles.container}>

      <View style={styles.coverContainer}>
        <Image
          source={{ uri: API.url(userFiles.coverImage.url) }}
          style={styles.coverPhoto}
        />
        
      </View>
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: API.url(userFiles.avatar.url) }}
          style={styles.avatar as ImageStyle}
        />
      </View>
       <View style={styles.infoContainer}>
        <Text style={styles.userName}>{activeUser.fullName}</Text>
        <Text style={styles.tagline}>{activeUser.bio }
            
          {/* UI/X Designer, specialized in SaaS | Open to project */}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  coverContainer: {
    width: "100%",
    height: 100,
  },
  coverPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarContainer: {
    position: "absolute",
    top: 60,  
    left: "50%",
    transform: [{ translateX: -40 }],  
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#1E1E1E",
    backgroundColor:'#C72937',
  },
  avatar: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  infoContainer: {
    marginTop: 45, // Ensures text is below the avatar
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: "center",
  },
  userName: {
    color: "#FAFAFB",
    fontSize: moderateScale(13),
    fontWeight: "600",
    marginBottom: 4,
  },
  tagline: {
    color: "#BBBBBB",
    fontSize: 13,
  },
});
