import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Divider, Button } from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import { store } from "@/store/Store";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { useMutation } from "@tanstack/react-query";
import RoundCheckbox from "@/components/shared/RoundCheckbox";
import { useAuthManager } from "@/hooks/useAuthManager";
import { API } from "@/api/api";
import { SnackBarFeedbackCtx } from "@/contexts/ctx";
import Ionicons from "@expo/vector-icons/Ionicons";

const PrSettings = () => {
  const [notificationStates, setNotificationStates] = React.useState({
    commentedPost: { red: false, gray: false },
    reactedPost: { red: false, gray: false },
    reactedComment: { red: false, gray: false },
    repliedComment: { red: false, gray: false },
    profilePost: { red: false, gray: false },
    mentionedPost: { red: false, gray: false },
    mentionedComment: { red: false, gray: false },
    securityAlert: { red: false, gray: false },
    newPost: { red: false, gray: false },
  });
  const [_, setForceUpdate] = useState(false);
  const [activeShortcut, setActiveShortcut] = useState("enable"); // default to 'enable'
  const { userPrefs, invalidateUserData } = useAuthManager();
  const snackCtx = useContext(SnackBarFeedbackCtx);
  // Add mutation status handling
  const { mutate: updatePrefs, isPending: isSaving } = useMutation({
    mutationFn: async (preferences: any) => API.updatePreferences(preferences),
    onSuccess: () => {
      snackCtx("Preferences updated successfully!");
      return invalidateUserData();
    },
  });

  // Initialize state with profile data
  useEffect(() => {
    setNotificationStates({
      commentedPost: {
        red: Boolean(userPrefs.appNotifEngagedPostComment),
        gray: Boolean(userPrefs.mailNotifEngagedPostComment),
      },
      reactedPost: {
        red: Boolean(userPrefs.appNotifEngagedPostReact),
        gray: Boolean(userPrefs.mailNotifEngagedPostReact),
      },
      reactedComment: {
        red: Boolean(userPrefs.appNotifMyCommentReact),
        gray: Boolean(userPrefs.mailNotifMyCommentReact),
      },
      repliedComment: {
        red: Boolean(userPrefs.appNotifMyCommentReply),
        gray: Boolean(userPrefs.mailNotifMyCommentReply),
      },
      profilePost: {
        red: Boolean(userPrefs.appNotifProfilePost),
        gray: Boolean(userPrefs.mailNotifProfilePost),
      },
      mentionedPost: {
        red: Boolean(userPrefs.appNotifPostMention),
        gray: Boolean(userPrefs.mailNotifPostMention),
      },
      mentionedComment: {
        red: Boolean(userPrefs.appNotifCommentMention),
        gray: Boolean(userPrefs.mailNotifCommentMention),
      },
      securityAlert: {
        red: Boolean(userPrefs.appNotifSecurityAlert),
        gray: Boolean(userPrefs.mailNotifSecurityAlert),
      },
      newPost: {
        red: Boolean(userPrefs.appNotifNewPost),
        gray: Boolean(userPrefs.mailNotifNewPost),
      },
    });

    store.profileVisibility = userPrefs.profileVisibility.toUpperCase();
    store.showOnlineStatus = Boolean(userPrefs.showOnlineStatus);
  }, []);

  // Handle saving changes
  const handleSaveChanges = () => {
    const updatedPreferences = {
      profileVisibility: store.profileVisibility.toLowerCase(),
      showOnlineStatus: Number(store.showOnlineStatus),
      appNotifEngagedPostComment: Number(notificationStates.commentedPost.red),
      mailNotifEngagedPostComment: Number(
        notificationStates.commentedPost.gray
      ),
      appNotifEngagedPostReact: Number(notificationStates.reactedPost.red),
      mailNotifEngagedPostReact: Number(notificationStates.reactedPost.gray),
      appNotifMyCommentReact: Number(notificationStates.reactedComment.red),
      mailNotifMyCommentReact: Number(notificationStates.reactedComment.gray),
      appNotifMyCommentReply: Number(notificationStates.repliedComment.red),
      mailNotifMyCommentReply: Number(notificationStates.repliedComment.gray),
      appNotifProfilePost: Number(notificationStates.profilePost.red),
      mailNotifProfilePost: Number(notificationStates.profilePost.gray),
      appNotifPostMention: Number(notificationStates.mentionedPost.red),
      mailNotifPostMention: Number(notificationStates.mentionedPost.gray),
      appNotifCommentMention: Number(notificationStates.mentionedComment.red),
      mailNotifCommentMention: Number(notificationStates.mentionedComment.gray),
      appNotifSecurityAlert: Number(notificationStates.securityAlert.red),
      mailNotifSecurityAlert: Number(notificationStates.securityAlert.gray),
      appNotifNewPost: Number(notificationStates.newPost.red),
      mailNotifNewPost: Number(notificationStates.newPost.gray),
    };

    updatePrefs(updatedPreferences);
  };

  const handleCheckboxToggle = (key: string, option: "red" | "gray") => {
    setNotificationStates((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [option]: !prev[key][option],
      },
    }));
  };

  const handleEnableAll = () => {
    setActiveShortcut("enable");
    setNotificationStates((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        newState[key] = { red: true, gray: true };
      });
      return newState;
    });

    // Save to server
    const updatedPreferences = {
      profileVisibility: store.profileVisibility.toLowerCase(),
      showOnlineStatus: Number(store.showOnlineStatus),
      appNotifEngagedPostComment: 1,
      mailNotifEngagedPostComment: 1,
      appNotifEngagedPostReact: 1,
      mailNotifEngagedPostReact: 1,
      appNotifMyCommentReact: 1,
      mailNotifMyCommentReact: 1,
      appNotifMyCommentReply: 1,
      mailNotifMyCommentReply: 1,
      appNotifProfilePost: 1,
      mailNotifProfilePost: 1,
      appNotifPostMention: 1,
      mailNotifPostMention: 1,
      appNotifCommentMention: 1,
      mailNotifCommentMention: 1,
      appNotifSecurityAlert: 1,
      mailNotifSecurityAlert: 1,
      appNotifNewPost: 1,
      mailNotifNewPost: 1,
    };
    updatePrefs(updatedPreferences);
  };

  const handleDisableAll = () => {
    setActiveShortcut("disable");
    setNotificationStates((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        newState[key] = { red: false, gray: false };
      });
      return newState;
    });

    // Save to server
    const updatedPreferences = {
      profileVisibility: store.profileVisibility.toLowerCase(),
      showOnlineStatus: Number(store.showOnlineStatus),
      appNotifEngagedPostComment: 0,
      mailNotifEngagedPostComment: 0,
      appNotifEngagedPostReact: 0,
      mailNotifEngagedPostReact: 0,
      appNotifMyCommentReact: 0,
      mailNotifMyCommentReact: 0,
      appNotifMyCommentReply: 0,
      mailNotifMyCommentReply: 0,
      appNotifProfilePost: 0,
      mailNotifProfilePost: 0,
      appNotifPostMention: 0,
      mailNotifPostMention: 0,
      appNotifCommentMention: 0,
      mailNotifCommentMention: 0,
      appNotifSecurityAlert: 0,
      mailNotifSecurityAlert: 0,
      appNotifNewPost: 0,
      mailNotifNewPost: 0,
    };
    updatePrefs(updatedPreferences);
  };

  const handleDisableEmail = () => {
    setActiveShortcut("disableEmail");
    setNotificationStates((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        newState[key] = { ...newState[key], gray: false };
      });
      return newState;
    });

    // Save to server
    const updatedPreferences = {
      profileVisibility: store.profileVisibility.toLowerCase(),
      showOnlineStatus: Number(store.showOnlineStatus),
      // Keep app notifications unchanged
      appNotifEngagedPostComment: Number(notificationStates.commentedPost.red),
      appNotifEngagedPostReact: Number(notificationStates.reactedPost.red),
      appNotifMyCommentReact: Number(notificationStates.reactedComment.red),
      appNotifMyCommentReply: Number(notificationStates.repliedComment.red),
      appNotifProfilePost: Number(notificationStates.profilePost.red),
      appNotifPostMention: Number(notificationStates.mentionedPost.red),
      appNotifCommentMention: Number(notificationStates.mentionedComment.red),
      appNotifSecurityAlert: Number(notificationStates.securityAlert.red),
      // Disable all email notifications
      mailNotifEngagedPostComment: 0,
      mailNotifEngagedPostReact: 0,
      mailNotifMyCommentReact: 0,
      mailNotifMyCommentReply: 0,
      mailNotifProfilePost: 0,
      mailNotifPostMention: 0,
      mailNotifCommentMention: 0,
      mailNotifSecurityAlert: 0,
      mailNotifNewPost: 0,
    };
    updatePrefs(updatedPreferences);
  };

  return (
    <View contentContainerStyle={styles.container}>
      {/* Customisation need to start from here */}
      {/* <View style={[styles.secondContainer, { width: isMobile ? '100%' : '70%', marginLeft: isMobile ? 0 : '30%' }]}> */}
      <View style={[styles.secondContainer, {}]}>
        <View
          style={styles.insideContainer}
          contentContainerStyle={styles.Chartcontent}
        >
          <View style={styles.insideContainer}>
            {/* Header */}

            <>
              <View style={styles.rowDash}>
                <Text style={styles.sectionHeaderTitle}>Profile</Text>
              </View>

              <View style={styles.sectionContainer}>
                {/* FIXME THIS FEATURE IS NON EXISTENT.ASK CLIENT FOR  CLARIFICATION AND USECASE */}
                {false && (
                  <>
                    <View style={styles.rowContainer}>
                      <Text style={styles.label}>Who can see my profile</Text>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => {
                          store.profileVisibility =
                            store.profileVisibility === "PUBLIC"
                              ? "PRIVATE"
                              : "PUBLIC";
                          // Force a re-render
                          setForceUpdate((prev) => !prev);
                        }}
                      >
                        <CustomIcon
                          name="globe"
                          size={moderateScale(15)}
                          color="#C72937"
                          style={styles.iconB}
                        />
                        <Text style={styles.buttonText}>
                          {store.profileVisibility || "PUBLIC"}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.TextContainer}>
                      <Text style={styles.alertText}>
                        Using any other setting than 'public' might limit the
                        visibility and reach of your posts
                      </Text>
                    </View>
                  </>
                )}
                {/* My Profile Status */}
                <View style={styles.rowContainer}>
                  <Text style={styles.label}>My online Status</Text>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => {
                      store.showOnlineStatus = !store.showOnlineStatus;
                      // Force a re-render
                      setForceUpdate((prev) => !prev);
                    }}
                  >
                    <CustomIcon
                      name="globe"
                      size={moderateScale(15)}
                      color="#C72937"
                      style={styles.iconB}
                    />
                    <Text style={styles.buttonText}>
                      {store.showOnlineStatus ? "Show" : "Hide"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Divider style={styles.divider} />
            </>

            {/* Shortcut Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Shortcut</Text>
              <View style={styles.tabContainer}>
                <Button
                  mode="text"
                  textColor="#FAFAFB"
                  buttonColor={
                    activeShortcut === "enable" ? "#C72937" : undefined
                  }
                  onPress={handleEnableAll}
                >
                  Enable All
                </Button>
                <Button
                  mode="text"
                  textColor="#FAFAFB"
                  buttonColor={
                    activeShortcut === "disable" ? "#C72937" : undefined
                  }
                  onPress={handleDisableAll}
                >
                  Disable All
                </Button>
                <Button
                  mode="text"
                  textColor="#FAFAFB"
                  buttonColor={
                    activeShortcut === "disableEmail" ? "#C72937" : undefined
                  }
                  onPress={handleDisableEmail}
                >
                  Disable Email
                </Button>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Post and Comment Selection */}
            <View style={styles.rowContainer}>
              <Text style={styles.postCommentContainer}> </Text>

              <View style={styles.iconContainer}>
                <View style={styles.iconWrapper}>
                  <CustomIcon
                    name="notification"
                    size={moderateScale(19)}
                    color="#C72937"
                    style={styles.iconB}
                  />
                </View>
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={moderateScale(17)}
                    color="#C72937"
                    style={styles.iconB}
                  />
                </View>
              </View>
            </View>

            {/* Advanced Notification Options */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Notifications</Text>

              {/* Posts and Comments */}

              {[
                {
                  label: "New community post",
                  key: "newPost",
                  mailAvailable: true,
                },
                { label: "Someone commented on a post", key: "commentedPost" },
                { label: "Someone reacted to a post", key: "reactedPost" },
                {
                  label: "Someone reacted to my comment",
                  key: "reactedComment",
                },
              ].map((item) => (
                <View key={item.key} style={styles.checkboxRow}>
                  <Text style={styles.checkboxLabel}>{item.label}</Text>
                  <View
                    style={{
                      ...styles.checkboxContainer,
                      ...(!item?.mailAvailable && {
                        marginRight: moderateScale(44.3),
                      }),
                    }}
                  >
                    <RoundCheckbox
                      checked={notificationStates[item.key]?.red}
                      onPress={() => handleCheckboxToggle(item.key, "red")}
                      color="#C72937"
                    />
                    {item?.mailAvailable === true && (
                      <RoundCheckbox
                        checked={notificationStates[item.key]?.gray}
                        onPress={() => handleCheckboxToggle(item.key, "gray")}
                        color="#C72937"
                      />
                    )}
                  </View>
                </View>
              ))}

              {/* Mentions Section */}
              <Text style={styles.subSectionTitle}>Mentions</Text>
              {[
                {
                  label: "Someone mentioned me in a post",
                  key: "mentionedPost",
                },
                {
                  label: "Someone mentioned me in a comment",
                  key: "mentionedComment",
                },
              ].map((item) => (
                <View key={item.key} style={styles.checkboxRow}>
                  <Text style={styles.checkboxLabel}>{item.label}</Text>
                  <View
                    style={[
                      styles.checkboxContainer,
                      { marginRight: moderateScale(44.3) },
                    ]}
                  >
                    <RoundCheckbox
                      checked={notificationStates[item.key]?.red}
                      onPress={() => handleCheckboxToggle(item.key, "red")}
                      color="#C72937"
                    />
                    {/* <RoundCheckbox
                      checked={notificationStates[item.key]?.gray}
                      onPress={() => handleCheckboxToggle(item.key, "gray")}
                      color="#C72937"
                    /> */}
                  </View>
                </View>
              ))}
            </View>

            {/* <View style={styles.notificationLegend}>
              <Text style={styles.legendTitle}>Notifications via:</Text>
              <View style={styles.iconLegendContainer}>
                <View style={styles.legendItem}>
                  <CustomIcon
                    name="notification" // Device notification icon
                    size={moderateScale(19)}
                    color="#C72937"
                    style={styles.iconB}
                  />
                  <Text style={styles.legendText}>Device</Text>
                </View>
                <View style={styles.legendItem}>
                  <CustomIcon
                    name="globe" // Email notification icon
                    size={moderateScale(17)}
                    color="#C72937"
                    style={styles.iconB}
                  />
                  <Text style={styles.legendText}>Email</Text>
                </View>
              </View>
            </View> */}
          </View>
          <Button
            mode="contained"
            style={styles.saveButton}
            onPress={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1C1C1C",
    flexGrow: 1,
    padding: 0,
    margin: 0,
  },

  secondContainer: {
    width: "100%",
    alignSelf: "stretch",
    backgroundColor: "#141414",
    padding: moderateScale(10),
    marginHorizontal: 0,
  },
  // customisation need to start from here

  insideContainer: {
    marginBottom: moderateScale(5),
    padding: moderateScale(10),
    backgroundColor: "#1C1C1C",
    // borderWidth: 1 ,
    borderRadius: moderateScale(12),
    borderColor: "#282828",
    marginTop: moderateScale(5),
    marginBottom: moderateScale(2),
  },
  rowDash: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#1A1A1A",
    padding: moderateScale(8),
    borderRadius: moderateScale(10),
  },

  iconB: {
    // marginRight: moderateScale(8),
    fontSize: moderateScale(18),
  },

  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderTitle: {
    fontSize: moderateScale(20),
    fontFamily: "poppins",
    fontWeight: "600",
    marginBottom: 16,
    color: "#FAFAFB",
    marginLeft: -10,
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontFamily: "poppins",
    fontWeight: "600",
    marginBottom: 16,
    color: "#FAFAFB",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    // marginBottom: 16,
  },
  TextContainer: {
    flexDirection: "row",

    alignItems: "flex-start",
    marginBottom: 16,
  },
  alertText: {
    fontSize: moderateScale(9),
    color: "#B5B5BE",
    fontFamily: "poppins",
    fontWeight: "300",
  },
  label: {
    color: "#FAFAFB",
    fontSize: moderateScale(12),
    fontFamily: "poppins",
    fontWeight: "500",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#252525",
    marginBottom: 16,
    borderRadius: moderateScale(12),
  },
  iconButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    padding: 10,
    borderRadius: 5,
  },
  resetButton: {
    marginTop: 16,
    backgroundColor: "#252525",
    color: "#FAFAFB",
    fontSize: moderateScale(14),
    fontFamily: "poppins",
    fontWeight: "500",
  },
  divider: {
    height: 2,
    width: "100%",
    backgroundColor: "#252525",
    marginVertical: 24,
  },
  postCommentContainer: {
    fontSize: moderateScale(14),
    fontFamily: "poppins",
    fontWeight: "500",
  },
  logoutButton: {
    marginTop: moderateScale(20),
    backgroundColor: "#D22A38",
  },
  subSectionTitle: {
    fontSize: moderateScale(14),
    color: "#FAFAFB",
    fontFamily: "poppins",
    fontWeight: "500",
    marginTop: moderateScale(20),
    marginBottom: moderateScale(12),
  },
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScale(16),
  },
  checkboxLabel: {
    color: "#909090",
    fontSize: moderateScale(12),
    fontFamily: "poppins",
    fontWeight: "300",
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(8),
  },
  saveButton: {
    marginTop: moderateScale(20),
    backgroundColor: "#C72937",
  },
  loadingText: {
    color: "#FAFAFB",
    fontSize: moderateScale(14),
    textAlign: "center",
  },
  errorText: {
    color: "#C72937",
    fontSize: moderateScale(14),
    textAlign: "center",
  },
  buttonText: {
    color: "#fff",
    marginLeft: 8,
  },
  checkboxLegend: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: moderateScale(10),
    marginBottom: moderateScale(8),
  },
  notificationLegend: {
    // backgroundColor:'green',
    flexDirection: "row",

    // marginBottom: moderateScale(20),
    // padding: moderateScale(10),
  },
  legendTitle: {
    color: "#FAFAFB",
    fontSize: moderateScale(14),
    fontFamily: "poppins",
    fontWeight: "500",
    backgroundColor: "green",

    // marginBottom: moderateScale(8),
  },
  iconLegendContainer: {
    // backgroundColor:'blue',

    flexDirection: "row",
    justifyContent: "flex-end",
    marginLeft: "auto",
    // paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(8),
    gap: moderateScale(10),
  },
  legendItem: {
    backgroundColor: "#252525",
    borderRadius: moderateScale(15),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    flexDirection: "row",
    alignItems: "center",
    gap: moderateScale(2),
  },
  legendText: {
    color: "#7A7A7A",
    fontSize: moderateScale(9),
    fontFamily: "poppins",
  },
  iconContainer: {
    flexDirection: "row",
    gap: moderateScale(12),
    marginHorizontal: moderateScale(8),
  },
  iconWrapper: {
    padding: moderateScale(8),
    backgroundColor: "#252525",
    borderRadius: moderateScale(8),
  },
});

export default PrSettings;
