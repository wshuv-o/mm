import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { moderateScale } from "react-native-size-matters";

import { useRouter } from "expo-router";

export function EsignUnderVerification()  {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Your Document Under Verification</Text>
        <Text style={styles.description}>
          After the verification process is complete, you will be able to use
          all the features.
        </Text>
        <Image
          source={require("@/assets/images/meditation.png")}
          style={styles.image}
          resizeMode="contain"
        />
        {/* NOTE I think we can add resubmit feature on this button in here.leaving it commented for future maybe */}
        {/* <TouchableOpacity style={styles.button} onPress={handleBackToSignIn}>
          <Text style={styles.buttonText}>Back to Sign In</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    width: "100%",
  },
  logoContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: moderateScale(30, 0.25),
    marginTop: moderateScale(20, 0.25),
    height: moderateScale(50, 0.25),
  },
  logoImage: {
    width: moderateScale(42, 0.25),
    height: moderateScale(42, 0.25),
    marginRight: moderateScale(10, 0.25),
  },
  logoText: {
    fontSize: moderateScale(30, 0.25),
    color: "#FAFAFB",
    fontFamily: "Poppins",
  },
  contentContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: moderateScale(12, 0.25),
    padding: moderateScale(16, 0.25),
    alignItems: "center",
    width: "90%",
    maxWidth: moderateScale(400, 0.25),
  },
  title: {
    fontSize: moderateScale(20, 0.25),
    fontWeight: "bold",
    color: "#FAFAFB",
    textAlign: "center",
    marginBottom: moderateScale(10, 0.25),
  },
  description: {
    fontSize: moderateScale(16, 0.25),
    color: "#B5B5BE",
    textAlign: "center",
    marginBottom: moderateScale(20, 0.25),
  },
  image: {
    width: moderateScale(200, 0.25),
    height: moderateScale(200, 0.25),
    marginBottom: moderateScale(28, 0.25),
  },
  button: {
    backgroundColor: "#D22A38",
    borderRadius: moderateScale(8, 0.25),
    paddingVertical: moderateScale(10, 0.25),
    paddingHorizontal: moderateScale(30, 0.25),
    position: "absolute",
    bottom: 20,
    width: "90%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: moderateScale(14, 0.25),
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
});

