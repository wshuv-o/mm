import {
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  Button,
  TextInput,
  Text,
  ActivityIndicator,
  IconButton,
  Chip,
} from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/api/api";
import RoundCheckbox from "@/components/shared/RoundCheckbox";
import { router } from "expo-router";
import { imgAsset, useMediaLib } from "@/hooks/useMedia";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { UTIL } from "@/lib/utils";
import { merge, omit } from "remeda";
import { MultiSelectWithViewer } from "@/components/shared/MultiSelectWithViewer";
import { Attachment, SingleCourse } from "@/api/types";
export default function CourseEditor({ course }: { course?: SingleCourse }) {
  const { pickMedia } = useMediaLib(true);
  const { mutate, isPending } = useMutation({
    mutationFn: (arg) => API.createOrUpdateCourse(arg, course?.publicId),
    onSuccess: (course) => {
      router.navigate(`/course/${course.publicId}`);
    },
  });
  const form = useForm({
    defaultValues: merge(
      {
        title: "",
        description: "",
        autoApproveEnrollments: true,
        coverImage: null as imgAsset | null,
        tags: [] as string[],
        newTag: {
          value: "",
          editing: false,
        },
        instructors: [] as string[],
        salesPage: "",
      },
      course
        ? {
            ...course,
            instructors: course.instructors.map((i) => i.publicId),
            tags: course.tags.map((t) => t.tag),
            coverImage: {
              uri: API.url(course.coverImage.url),
              fileName: course.coverImage.originalName,
            },
          }
        : {}
    ),
    onSubmit: ({ value }) => {
      mutate(value, { onSuccess: () => form.reset() });
    },
  });
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Form Container */}
        <View style={[styles.formContainer, { gap: 24 }]}>
          {form.state.isValid === false && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <form.Field name="title">
            {(field) => (
              <TextInput
                value={field.state.value}
                onChangeText={field.handleChange}
                style={styles.input}
                mode="flat"
                placeholder="title"
                placeholderTextColor={"#92929D"}
                textColor="#B5B5BE"
              />
            )}
          </form.Field>
          <form.Field name="description">
            {(field) => (
              <TextInput
                value={field.state.value}
                onChangeText={field.handleChange}
                style={styles.input}
                mode="flat"
                placeholder="description"
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
          <form.Field name="instructors">
            {(field) => (
              <MultiSelectWithViewer
                queryFn={async () =>
                  (await API.getUsers()).filter((u) =>
                    u.rolesPlain.includes("instructor")
                  )
                }
                queryKey={["users", "instructors"]}
                labelField="userName"
                valueField="publicId"
                placeholder="add instructors"
                value={field.state.value}
                onChange={field.handleChange}
              ></MultiSelectWithViewer>
            )}
          </form.Field>
          <form.Field name="tags">
            {(field) => (
              <View
                style={{ flexDirection: "row", flexWrap: "wrap", rowGap: 10 }}
              >
                {(field.state.value.length == 0
                  ? ["click (+) to add a tag"]
                  : field.state.value
                ).map((t, i) => (
                  <Chip
                    key={i}
                    style={{
                      marginRight: 8,
                      backgroundColor: "#252525",
                      flexShrink: 1,
                    }}
                    closeIcon={(props) => (
                      <CustomIcon
                        {...props}
                        name="close"
                        style={styles.browseText}
                        // size={16}
                      ></CustomIcon>
                    )}
                    onClose={() => field.removeValue(i)}
                  >
                    <Text style={{ color: "#D5D5DC" }}>{t}</Text>
                  </Chip>
                ))}
                <form.Field name="newTag">
                  {(field) =>
                    field.state.value.editing ? (
                      <TextInput
                        value={field.state.value.value}
                        onChangeText={(v) =>
                          field.handleChange({ ...field.state.value, value: v })
                        }
                        style={{
                          width: UTIL.clamp(
                            field.state.value.value.length * 7,
                            100,
                            250
                          ),
                          height: "auto",
                          paddingVertical: moderateScale(7, 0.25),
                          backgroundColor: "#252525",
                        }}
                        mode="flat"
                        dense
                        placeholder="tag"
                        placeholderTextColor={"#92929D"}
                        textColor="#B5B5BE"
                        right={
                          <TextInput.Icon
                            onPress={() => {
                              if (field.state.value.value)
                                field.form.pushFieldValue(
                                  "tags",
                                  field.state.value.value
                                );
                              field.handleChange({
                                value: "",
                                editing: false,
                              });
                            }}
                            style={{ top: 10, left: 10, width: 21, height: 21 }}
                            icon={(props) => (
                              <CustomIcon
                                {...props}
                                name="check-circle"
                                style={styles.browseText}
                                size={20}
                              ></CustomIcon>
                            )}
                          />
                        }
                      />
                    ) : (
                      <IconButton
                        disabled={isPending}
                        style={{ height: 30, width: 30, margin: 0 }}
                        size={28}
                        onPress={() =>
                          field.handleChange({ value: "", editing: true })
                        }
                        icon={(props) => (
                          <CustomIcon
                            {...props}
                            name="add-circle"
                            style={styles.browseText}
                            // size={25}
                          ></CustomIcon>
                        )}
                      ></IconButton>
                    )
                  }
                </form.Field>
              </View>
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
                        disabled={isPending}
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

          <form.Field name="autoApproveEnrollments">
            {(field) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
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
                    marginLeft: 0,
                  }}
                />
                <Text style={{ color: "#B5B5BE" }}>
                  auto approve enrollments?
                </Text>
              </View>
            )}
          </form.Field>

          {/* FIXME USE BUTTON ELEMEN LOADING ATTR INSTEAD OF ACTIVITYINDICATOR */}
          {isPending ? (
            <ActivityIndicator size="small" color="#D22A38" />
          ) : (
            <Button
              buttonColor="#D22A38"
              mode="contained"
              onPress={form.handleSubmit}
            >
              {course ? "update" : "create"}
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
    width: "95%",
    maxWidth: moderateScale(400, 0.25),
    padding: moderateScale(16, 0.25),
    backgroundColor: "#1a1a1a",
    borderRadius: moderateScale(12, 0.25),
  },
  loginText: {
    fontFamily: "Poppins",

    fontSize: moderateScale(16.9, 0.25),
    color: "#FAFAFB",
    marginBottom: "15",
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
