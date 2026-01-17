import {
  ScrollView,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  TextInput,
  Text,
  ActivityIndicator,
  Checkbox,
  Portal,
  IconButton,
} from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "@/api/api";
import RoundCheckbox from "@/components/shared/RoundCheckbox";
import { router } from "expo-router";
import { useContext } from "react";
import { communityCtx } from "@/contexts/ctx";
import { MultiSelectWithViewer } from "@/components/shared/MultiSelectWithViewer";
import { useCourseDataMgr } from "@/hooks/useCourseDataMgr";
import { CommunityDetailed } from "@/api/types";
import { merge } from "remeda";
import { imgAsset, useMediaLib } from "@/hooks/useMedia";
import CustomIcon from "../custom_icon/CustomIcon";
export default function CommunityEditor({ com }: { com?: CommunityDetailed }) {
  const { pickMedia } = useMediaLib(true);
  const queryClient = useQueryClient();
  const comCtx = useContext(communityCtx);
  const mutation = useMutation({
    mutationFn: (arg) => API.createOrUpdateCommunity(arg, com?.publicId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["communities"] });
      router.navigate("/");
    },
  });
  const { listQKey } = useCourseDataMgr();
  const form = useForm({
    defaultValues: merge(
      {
        name: "",
        autoApproveMembers: false,
        coverImage: null as imgAsset | null,
        accountabilityMgrs: [] as string[],
        salesPage:""
      },
      com
        ? {
            ...com,
            accountabilityMgrs: com.accountabilityMgrs.map((v) => v.publicId),
            coverImage: {
              uri: API.url(com.coverImage.url),
              fileName: com.coverImage.originalName,
            },
          }
        : {}
    ),
    onSubmit: ({ value }) => {
      mutation.mutate(value);
    },
  });
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Form Container */}
        <View style={[styles.formContainer, { gap: 15 }]}>
          {form.state.isValid === false && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <form.Field name="name">
            {(field) => (
              <TextInput
                value={field.state.value}
                onChangeText={field.handleChange}
                style={styles.input}
                mode="flat"
                placeholder="name"
                placeholderTextColor={"#92929D"}
                textColor="#B5B5BE"
              />
            )}
          </form.Field>


          <form.Field name="salesPage">
            {(field) => (
              <TextInput
                value={field.state.value}
                onChangeText={field.handleChange}
                style={styles.input}
                mode="flat"
                placeholder="sales page"
                placeholderTextColor={"#92929D"}
                textColor="#B5B5BE"
              />
            )}
          </form.Field>
          <form.Field name="accountabilityMgrs">
            {(field) => (
              <MultiSelectWithViewer
                queryFn={API.getUsers}
                queryKey="users"
                labelField="userName"
                valueField="publicId"
                placeholder="add accountability managers"
                value={field.state.value}
                onChange={field.handleChange}
              ></MultiSelectWithViewer>
            )}
          </form.Field>
          <form.Field name="coverImage">
            {(field) => (
              <>
                <View
                  style={[
                    styles.dropArea,
                    {
                      flexDirection: "row",
                      justifyContent: "center",
                      gap: 18,
                    },
                  ]}
                >
                  ;{" "}
                  {field.state.value ? (
                    <>
                      <Image
                        source={{
                          uri: field.state.value.uri,
                        }}
                        style={{ width: 60, height: 60, borderRadius: 5 }}
                      />
                      <Text style={[styles.browseText]} numberOfLines={3}>
                        {field.state.value.fileName ?? "unnamed image"}
                      </Text>
                      <IconButton
                        disabled={mutation.isPending}
                        style={{ height: 26, top: -1, width: 26, margin: 0 }}
                        onPress={() => field.handleChange(null)}
                        icon={(props) => (
                          <CustomIcon
                            {...props}
                            name="close"
                            style={styles.browseText}
                            size={25}
                          ></CustomIcon>
                        )}
                      ></IconButton>
                    </>
                  ) : (
                    <TouchableOpacity
                      onPress={async () =>
                        field.handleChange((await pickMedia())[0])
                      }
                    >
                      <Text style={styles.browseText}>
                        select a cover image (optional)
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </form.Field>

          {/* <form.Field name="autoApproveMembers">
            {(field) => (
              <View
                style={{
                  justifyContent: "flex-start",
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 14,
                }}
              >
                <RoundCheckbox
                  checked={field.state.value}
                  onPress={() => field.handleChange(!field.state.value)}
                  color="#C72937"
                  style={{
                    width: moderateScale(15),
                    height: moderateScale(15),
                    borderRadius: 4,
                  }}
                />
                <Text style={{ color: "#B5B5BE" }}>auto approve members?</Text>
              </View>
            )}
          </form.Field> */}
          {/* FIXME USE BUTTON ELEMEN LOADING ATTR INSTEAD OF ACTIVITYINDICATOR */}
          {mutation.isPending ? (
            <ActivityIndicator size="small" color="#D22A38" />
          ) : (
            <Button
              buttonColor="#D22A38"
              mode="contained"
              onPress={form.handleSubmit}
            >
              {com ? "update" : "create"}
            </Button>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: moderateScale(20, 0.25),
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
  formContainer: {
    width: "98%",
    maxWidth: moderateScale(400, 0.25),
    padding: moderateScale(16, 0.25),
    backgroundColor: "#1a1a1a",
    borderRadius: moderateScale(12, 0.25),
    margin: moderateScale(18, 0.25),
  },
  loginText: {
    fontFamily: "Poppins",

    fontSize: moderateScale(16.9, 0.25),
    color: "#FAFAFB",
    marginBottom: 15,
  },
  errorText: {
    color: "#D22A38",
    fontSize: moderateScale(14, 0.25),
    marginBottom: moderateScale(10, 0.25),
    textAlign: "center",
    width: "100%",
  },
  input: {
    width: "100%",
    height: "5%",
    padding: moderateScale(15, 0.25),
    backgroundColor: "#252525",
    borderRadius: moderateScale(12, 0.25),
    fontFamily: "Poppins",
  },

  buttonText: {
    width: "100%",
    height: "10%",
    alignItems: "center",
    fontSize: moderateScale(12.9, 0.25),
    padding: moderateScale(5, 0.25),
    marginBottom: moderateScale(10, 0.25),
  },
  orText: {
    fontSize: moderateScale(11, 0.25),
    color: "#92929D",
    marginBottom: moderateScale(10, 0.25),
  },
  socialButton: {
    width: "100%",
    height: "10%",
    padding: moderateScale(5, 0.25),
    backgroundColor: "#444",
    borderRadius: moderateScale(5, 0.25),
    alignItems: "center",
    marginBottom: moderateScale(10, 0.25),
    fontFamily: "Poppins",
  },

  dividerS: {
    backgroundColor: "#44444F",
    height: 2,
    width: "100%",
  },
  footerButton: {
    backgroundColor: "#1C1C1C",
    padding: moderateScale(12, 0.25),
    borderRadius: 5,
    alignItems: "center",
  },
  buttonTextContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonTextLeft: {
    color: "white",
    fontFamily: "Poppins",

    fontSize: moderateScale(12, 0.25),
  },
  dot: {
    color: "white",
    marginHorizontal: moderateScale(15, 0.25),
    fontFamily: "Poppins",

    fontSize: moderateScale(20, 0.25),
  },
  buttonTextRight: {
    color: "white",
    fontFamily: "Poppins",

    fontSize: moderateScale(12, 0.25),
  },
  dropArea: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#B5B5BE",
    borderRadius: moderateScale(8, 0.25),
    width: "100%",
    alignItems: "center",
    padding: moderateScale(13, 0.25),
  },
  browseText: {
    color: "#D22A38",
  },
  dropSubText: {
    color: "#B5B5BE",
    fontSize: moderateScale(12, 0.25),
    marginTop: moderateScale(5, 0.25),
  },
});
