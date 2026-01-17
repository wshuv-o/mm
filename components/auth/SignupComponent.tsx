import React, { useState } from "react";
import { moderateScale } from "react-native-size-matters";
import { TextInput, Button } from "react-native-paper";
import { useMutation } from "@tanstack/react-query";
import { API } from "@/api/api";
import { useForm } from "@tanstack/react-form";
import { UserRolesEditor } from "@/components/admin/UserRolesEditor";
import { authInputStyles } from "@/components/auth/AuthFormContainer";
import {
  BillingInfoFields,
  billingInfoSchema,
} from "@/components/BillingInfoForm";
import { StyleSheet } from "react-native";
import { getFontSize } from "@/utils/fontSize";
export function SignupComponent({
  endpoint = "/register",
  showRoleField = false,
  onSuccess = (data: any, variables: void, context: unknown) => {},
}) {
  const signupMutation = useMutation({
    mutationFn: (payload) => API.registerUser(payload, endpoint),
    onSuccess,
  });
  const form = useForm({
    defaultValues: {
      fullName: "",
      userName: "",
      email: "",
      password: "",
      phoneNumber: "",
      roles: ["student"],
      billingInfo: billingInfoSchema(),
    },
    onSubmit: ({ value }) => {
      signupMutation.mutate(value);
    },
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  return (
    <>
      <form.Field name="fullName">
        {(field) => (
          <TextInput
            value={field.state.value}
            onChangeText={field.handleChange}
            placeholder="Full Name"
            {...authInputStyles}
          />
        )}
      </form.Field>

      <form.Field name="userName">
        {(field) => (
          <TextInput
            value={field.state.value}
            onChangeText={field.handleChange}
            placeholder="Username"
            {...authInputStyles}
          />
        )}
      </form.Field>

      <form.Field name="email">
        {(field) => (
          <TextInput
            value={field.state.value}
            onChangeText={field.handleChange}
            placeholder="Your email"
            {...authInputStyles}
          />
        )}
      </form.Field>
      <form.Field name="phoneNumber">
        {(field) => (
          <TextInput
            value={field.state.value}
            onChangeText={field.handleChange}
            placeholder="phone number"
            {...authInputStyles}
          />
        )}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <TextInput
            value={field.state.value}
            onChangeText={field.handleChange}
            placeholder="Password"
            secureTextEntry={!isPasswordVisible}
            right={
              <TextInput.Icon
                icon={isPasswordVisible ? "eye-off" : "eye"}
                color="#92929D"
                size={moderateScale(16)}
                onPress={togglePasswordVisibility}
              />
            }
            {...authInputStyles}
          />
        )}
      </form.Field>
      <BillingInfoFields
        form={form}
        parentFieldName="billingInfo"
      ></BillingInfoFields>
      {showRoleField && (
        <form.Field name="roles">
          {(field) => (
            <UserRolesEditor
              roles={field.state.value}
              onChange={(v) =>
                field.handleChange(
                  v.filter((r) => r.enabled).map((r) => r.role)
                )
              }
            ></UserRolesEditor>
          )}
        </form.Field>
      )}
      <Button
        mode="contained"
        onPress={() => form.handleSubmit()}
        loading={signupMutation.isPending}
        disabled={signupMutation.isPending}
        style={styles.signUpButton}
        buttonColor="#D22A38"
        labelStyle={styles.signUpButtonText}
      >
        {signupMutation.isPending ? "Registering..." : "Register"}
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(8),
  },
  // Logo Row
  logoRow: {
    flexDirection: "row",
    height: moderateScale(44),
    alignItems: "center",
    marginBottom: moderateScale(15),
  },
  logoImage: {
    width: moderateScale(41),
    height: moderateScale(41),
    marginRight: moderateScale(4),
  },
  logoText: {
    fontSize: moderateScale(30),
    color: "#FAFAFB",
    fontFamily: "Poppins",
    fontWeight: "600",
  },

  formCard: {
    width: "100%",
    maxWidth: moderateScale(280),
    backgroundColor: "#1a1a1a",
    borderRadius: moderateScale(12),
    padding: moderateScale(8),

    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    marginBottom: moderateScale(12),
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
    color: "#D22A38",
    fontSize: getFontSize("small"),
    marginBottom: moderateScale(4),
    textAlign: "center",
    width: "100%",
  },
  input: {
    width: "100%",
    height: moderateScale(38),
    backgroundColor: "#252525",
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(15),
    fontFamily: "Poppins",
    fontSize: getFontSize("medium"),
  },
  signUpButton: {
    borderRadius: moderateScale(12),
    marginTop: moderateScale(4),
    width: "100%",
  },
  signUpButtonText: {
    fontSize: getFontSize("small"),
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
    color: "#92929D",
    fontSize: getFontSize("small"),
    fontFamily: "Poppins",
    marginTop: moderateScale(10),
  },

  dividerS: {
    backgroundColor: "#44444F",
    height: 1,
    width: "100%",
  },
  footerButton: {
    backgroundColor: "#1C1C1C",

    borderRadius: moderateScale(4),
    alignItems: "center",
    width: "100%",
  },
  buttonTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: moderateScale(10),
  },
  footerLink: {
    color: "white",
    fontFamily: "Poppins",
    fontSize: getFontSize("small"),
  },
});
