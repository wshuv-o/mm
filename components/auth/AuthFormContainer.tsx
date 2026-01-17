import { moderateScale } from "react-native-size-matters";
import { getFontSize } from "@/utils/fontSize";
import { StyleSheet } from "react-native";
import React from "react";
import { View, Image } from "react-native";
import { TextInput, Text, Button } from "react-native-paper";

export function AuthFormContainer({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View style={styles.container}>
      {/* Logo + Text in one row */}
      <View style={styles.logoRow}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logoImage}
        />
        <Text style={styles.logoText}>Ceo Society</Text>
      </View>
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>{title}</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#000",
    minHeight: "100%",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: moderateScale(25),
    paddingHorizontal: moderateScale(16),
    minHeight: "100%",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(16),
  },
  logoImage: {
    width: 42,
    height: 42,
    marginRight: moderateScale(13),
  },
  logoText: {
    fontSize: 30,
    color: "#FAFAFB",
    fontFamily: "Poppins",
    fontWeight: "600",
  },

  formTitle: {
    fontSize: moderateScale(12),
    color: "#FAFAFB",
    fontFamily: "Poppins",
    fontWeight: "500",
    marginBottom: moderateScale(12),
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: moderateScale(10),
    marginBottom: moderateScale(6),
    textAlign: "center",
  },
  signInButton: {
    borderRadius: moderateScale(6),
    marginTop: moderateScale(4),
    // height: moderateScale(20),
  },
  buttonContent: {
    height: "100%",
    justifyContent: "center",
  },
  buttonLabel: {
    fontSize: moderateScale(10),
    fontFamily: "Poppins",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: moderateScale(10),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#44444F",
  },
  orText: {
    marginHorizontal: moderateScale(6),
    color: "#92929D",
    fontSize: moderateScale(8),
    fontFamily: "Poppins",
  },
  socialButton: {
    borderRadius: moderateScale(6),
    marginBottom: moderateScale(8),
    // height: moderateScale(24),
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: moderateScale(3),
  },
  footerLink: {
    color: "#FFFFFF",
    fontFamily: "Poppins",
    fontSize: moderateScale(10),
  },
  footerDot: {
    color: "#FFFFFF",
    marginHorizontal: moderateScale(6),
    fontFamily: "Poppins",
    fontSize: moderateScale(12),
  },
  formCard: {
    width: "100%",
    maxWidth: moderateScale(331, 0.3),
    backgroundColor: "#1A1A1A",
    borderRadius: moderateScale(12),
    paddingHorizontal: Math.min(moderateScale(16, 0.43), 24),
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  outlineStyle: {
    backgroundColor: "#252525",
    borderWidth: 1.5,
    borderRadius: 12,
  },
  input: {
    backgroundColor: "#252525",
    height: Math.min(moderateScale(37.4, 0.16), 45),
    marginBottom: moderateScale(15),
    fontFamily: "Poppins",
    fontSize: getFontSize("medium"),
    width: "100%",
  },
});
export const authInputStyles = {
  style: styles.input,
  mode: "outlined",
  outlineStyle: styles.outlineStyle,
  placeholderTextColor: "#92929D",
  textColor: "#B5B5BE",
  outlineColor: "transparent",
  activeOutlineColor: "#D22A38",
};
