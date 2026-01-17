import React, { useEffect, useState } from "react";
import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import { TextInput, Text, Button, Divider, Portal } from "react-native-paper";
import { useMutation } from "@tanstack/react-query";
import { API } from "@/api/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthManager } from "@/hooks/useAuthManager";
import { getFontSize } from "@/utils/fontSize";

import {
  AuthFormContainer,
  authInputStyles,
} from "@/components/auth/AuthFormContainer";
import { FirebaseSvc } from "@/lib/firebase";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
import { UTIL } from "@/lib/utils";
export default function Login() {
  const router = useRouter();
  const {authCreds} = useLocalSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { saveAuthToken } = useAuthManager();
  const loginMutation = useMutation({
    mutationFn: API.loginUser,
    onSuccess: async (data) => {
      await saveAuthToken(data);
      //permissions can only asked from a user generated event.so we will call this method here
      FirebaseSvc.requestWebPermission().then(() => FirebaseSvc.syncToken());
    },
  });

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };
  useEffect(() => {
    if (authCreds) {
      loginMutation.mutate(UTIL.decodeB64urlSafe(authCreds,true));
    }
  }, [authCreds]);
  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {authCreds ? (
        <FullPageLoader></FullPageLoader>
      ) : (
        <AuthFormContainer title="Login to your account">
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Your email"
            {...authInputStyles}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={!isPasswordVisible}
            right={
              <TextInput.Icon
                size={moderateScale(16)}
                icon={isPasswordVisible ? "eye-off" : "eye"}
                color="#92929D"
                onPress={togglePasswordVisibility}
              />
            }
            {...authInputStyles}
          />
          <Button
            mode="contained"
            onPress={() => loginMutation.mutate({ email, password })}
            loading={loginMutation.isPending}
            disabled={loginMutation.isPending}
            style={styles.signInButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            buttonColor="#C72937"
          >
            {loginMutation.isPending ? "Signing In..." : "Sign In"}
          </Button>
          <View style={styles.dividerRow}>
            <Divider style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <Divider style={styles.divider} />
          </View>
          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={() => router.navigate("/forgot-password")}
            >
              <Text style={styles.footerLink}>Can't login?</Text>
            </TouchableOpacity>
            {/* <Text style={styles.footerDot}>•</Text>
            <TouchableOpacity onPress={() => router.navigate("/sign-up")}>
              <Text style={styles.footerLink}>Sign up for new user?</Text>
            </TouchableOpacity> */}
          </View>
        </AuthFormContainer>
      )}
    </ScrollView>
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
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(8),
    minHeight: "100%",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(15),
  },
  logoImage: {
    width: moderateScale(41),
    height: moderateScale(41),
    marginRight: moderateScale(4),
  },
  logoText: {
    fontSize: 30,
    color: "#FAFAFB",
    fontFamily: "Poppins",
    fontWeight: "600",
  },

  formTitle: {
    fontSize: getFontSize("xlarge"),
    color: "#FAFAFB",
    fontFamily: "Poppins",
    fontWeight: "500",
    marginBottom: moderateScale(10),
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontSize: getFontSize("small"),
    marginBottom: moderateScale(4),
    textAlign: "center",
  },
  input: {
    backgroundColor: "#252525",
    height: moderateScale(38),
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(15),
    fontFamily: "Poppins",
    fontSize: getFontSize("medium"),
  },
  signInButton: {
    borderRadius: moderateScale(12),
    marginTop: moderateScale(4),
    width: "100%",
  },
  buttonContent: {
    height: "100%",
    justifyContent: "center",
  },
  buttonLabel: {
    fontSize: getFontSize("medium"),
    fontFamily: "Poppins",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: moderateScale(6),
    width: "100%",
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#44444F",
  },
  orText: {
    marginHorizontal: moderateScale(4),
    color: "#92929D",
    fontSize: getFontSize("small"),
    fontFamily: "Poppins",
  },
  socialButton: {
    borderRadius: moderateScale(4),
    marginBottom: moderateScale(4),
    width: "100%",
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
    fontSize: getFontSize("small"),
  },
  footerDot: {
    color: "#FFFFFF",
    marginHorizontal: moderateScale(6),
    fontFamily: "Poppins",
    fontSize: getFontSize("medium"),
  },
});
