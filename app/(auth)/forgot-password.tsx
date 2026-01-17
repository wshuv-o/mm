import React, { useContext, useState } from "react";
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
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { useAuthManager } from "@/hooks/useAuthManager";
import { SnackBarFeedbackCtx } from "@/contexts/ctx";
import { AuthFormContainer, authInputStyles } from "@/components/auth/AuthFormContainer";
export default function ForgotPwd() {
  const { ep } = useLocalSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const fCtx = useContext(SnackBarFeedbackCtx);
  const { mutate, isPending } = useMutation({
    mutationFn: ep ? (arg) => API.pwdReset(ep, arg) : API.requestPwdReset,
    onSuccess: () =>
      ep
        ? router.navigate("/sign-in")
        : fCtx("check you mail box for password reset link"),
  });

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <AuthFormContainer title="Reset Password">
        {ep ? (
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="New password"
            {...authInputStyles}
            secureTextEntry={!isPasswordVisible}
            right={
              <TextInput.Icon
                size={moderateScale(12)}
                icon={isPasswordVisible ? "eye-off" : "eye"}
                color="#92929D"
                onPress={togglePasswordVisibility}
              />
            }
          />
        ) : (
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Your email"
            {...authInputStyles}
          />
        )}

        <Button
          mode="contained"
          onPress={() => mutate({ email, password })}
          loading={isPending}
          disabled={isPending}
          style={styles.signInButton}
          contentStyle={styles.buttonContent}
          labelStyle={styles.buttonLabel}
          buttonColor="#C72937"
        >
          reset
        </Button>
      </AuthFormContainer>
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
    width: moderateScale(32),
    height: moderateScale(32),
    marginRight: moderateScale(6),
  },
  logoText: {
    fontSize: 30,
    color: "#FAFAFB",
    fontFamily: "Poppins",
    fontWeight: "600",
  },
  formCard: {
    width: "100%",
    maxWidth: moderateScale(280),
    backgroundColor: "#1A1A1A",
    borderRadius: moderateScale(10),
    padding: moderateScale(14),
    borderWidth: 1,
    borderColor: "#2A2A2A",
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
  input: {
    backgroundColor: "#252525",
    height: moderateScale(24),
    borderRadius: moderateScale(6),
    marginBottom: moderateScale(8),
    fontFamily: "Poppins",
    fontSize: moderateScale(10),
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
});
