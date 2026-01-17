import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Button, IconButton } from "react-native-paper";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { router } from "expo-router";
import { moderateScale } from "react-native-size-matters";
import { API } from "@/api/api";
import { useAuthManager } from "@/hooks/useAuthManager";
import CommentEditor from "./CommentEditor";
import { entries } from "remeda";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { communityCtx } from "@/contexts/ctx";
import { useContext } from "react";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
import { CommunityPosts } from "@/api/types";
import { ContentRenderer } from "../shared/ContentRenderer";
import { MasonryPreviewer } from "../shared/AttachMentPreviewers";
import { format } from "date-fns";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { WithConfirmationHOC } from "../shared/WithConfirmationHOC";
//FIXME - add types
export default function PostItem({ item }: { item: CommunityPosts[number] }) {
  const { userFiles, userIsAdmin, activeUser } = useAuthManager();
  const { invalidatePostData } = useCurrentCommunity();
  const { setCtxExtra } = useContext(communityCtx)!;
  const { mutate, isPending, variables } = useMutation({
    mutationFn: (arg: Parameters<typeof API["updateInteraction"]>[1]) =>
      API.updateInteraction(item.publicId, arg),
    onSuccess: () => {
      return invalidatePostData();
    },
  });
  const rmMtn = useMutation({
    mutationFn: () => API.deletePost(item.publicId),
    onSuccess: () => {
      return invalidatePostData();
    },
  });
  function getPostTimestamp(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const postDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    if (postDate.getTime() === today.getTime()) {
      return ` ${format(date, "hh:mm a")}`;
    }
    return format(date, "dd MMM yy, hh:mm a");
  }
  return (
    <View style={styles.postContainer}>
      {/* User Information */}
      <View
        style={{
          flexDirection: "row",

          justifyContent: "space-between",
        }}
      >
        <View style={styles.userContainer}>
          <Image
            source={{ uri: API.url(item.author.avatar.url) }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.name} numberOfLines={1}>
              {item.author.fullName}
            </Text>
            <Text style={styles.date}>{getPostTimestamp(item.createdAt)}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row" }}>
          {(userIsAdmin || activeUser!.publicId === item.author.publicId) && (
            <WithConfirmationHOC isPending={rmMtn.isPending}>
              {(confirm) => (
                <IconButton
                  theme={{ colors: { onSurfaceDisabled: "#D22A38" } }}
                  style={{
                    height: 26,
                    width: 26,
                    margin: 0,
                  }}
                  onPress={() => {
                    confirm("Are you sure?", rmMtn.mutate);
                  }}
                  iconColor="#D22A38"
                  icon={(props) => (
                    <CustomIcon {...props} name="trash"></CustomIcon>
                  )}
                ></IconButton>
              )}
            </WithConfirmationHOC>
          )}
          <IconButton
            disabled={isPending || !userIsAdmin}
            loading={isPending && "isPinned" in variables}
            theme={{ colors: { onSurfaceDisabled: "#D22A38" } }}
            style={{
              height: 26,
              width: 26,
              margin: 0,
              ...(!userIsAdmin && !item.isPinned && { display: "none" }),
            }}
            onPress={() => mutate({ isPinned: !item.isPinned })}
            iconColor="#D22A38"
            icon={(props) => (
              <MaterialCommunityIcons
                {...props}
                name={item.isPinned ? "pin" : "pin-off"}
              />
            )}
          ></IconButton>
        </View>
      </View>
      <ContentRenderer
        onHashClick={(m) => setCtxExtra((v) => ({ ...v, tags: [m.data.name] }))}
        content={item.content}
      ></ContentRenderer>
      <MasonryPreviewer
        attachments={item.attachments.map((a) => a.src)}
      ></MasonryPreviewer>
      <View style={styles.actionsContainer}>
        {entries({
          ic_comment: {
            value: item.meta.count_comments,
            by_me: undefined,
            action: () => router.navigate(`/post/${item.publicId}`),
          },
          ic_like: {
            value: item.meta.count_loved,
            by_me: item.meta.loved_by_me,
            action: () =>
              mutate({
                loved: !item.meta.loved_by_me,
              }),
          },

          ic_Saved: {
            value: item.meta.count_bookmarked,
            by_me: item.meta.bookmarked_by_me,
            action: () => mutate({ bookmarked: !item.meta.bookmarked_by_me }),
          },
        }).map(([k, v]) => (
          <Button
            onPress={v.action}
            icon={() => <CustomIcon name={k} size={15} color="#D22A38" />}
            mode={v.by_me ? "outlined" : "contained"}
            style={{
              backgroundColor: "#191919",
              padding: "8",
            }}
            labelStyle={{
              fontSize: 14, // Change the font size of the button text
            }}
            theme={{ colors: { outline: "#D22A38" } }}
          >
            <Text style={styles.actionText}>{v.value} </Text>
          </Button>
        ))}
      </View>

      {/* Write Your Comment Section */}
      <View style={styles.commentSection}>
        <TouchableOpacity onPress={() => router.navigate("/dashboard/profile")}>
          <Image
            source={{ uri: API.url(userFiles.avatar.url) }}
            style={styles.avatar}
          />
        </TouchableOpacity>

        <CommentEditor postId={item.publicId}></CommentEditor>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141414",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: moderateScale(10),
    backgroundColor: "#1C1C1C",
  },

  ProfileN: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    fontFamily: "poppins",
    color: "#FAFAFB",
    position: "absolute",
    left: "60%",
    transform: [{ translateX: -moderateScale(50) }], // Center the text
  },
  IconButtonH: {
    alignItems: "flex-start",
    margin: moderateScale(10),
  },
  postSomethingContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: moderateScale(8),
    backgroundColor: "#1C1C1C",
    border: "2",
    borderRadius: moderateScale(12),
    borderColor: "#282828",

    margin: moderateScale(8),
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#1c1c1c",
    position: "absolute", // Always fixed at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    height: 60, // Fixed height for navigation bar
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: "500",
    color: "#FAFAFB",
    textAlign: "left",
    padding: moderateScale(10),
    fontFamily: "poppins",
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  DividerD: {
    height: moderateScale(1),

    backgroundColor: "transparent",
  },
  postInput: {
    fontSize: moderateScale(14),
    fontWeight: "400",
    color: "#696974",
    textAlign: "left",
    padding: moderateScale(10),
    fontFamily: "poppins",
    marginBottom: moderateScale(20),
  },
  list: {
    paddingHorizontal: 10,
  },
  postContainer: {
    backgroundColor: "#1C1C1C",
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    color: "#FAFAFB",
    fontWeight: "500",
    fontSize: 16,
  },
  date: {
    color: "#aaa",
    fontSize: 12,
  },

  mediaContainer: {
    marginVertical: moderateScale(10),
    alignItems: "center",
  },
  mediaImage: {
    width: "95%",
    height: moderateScale(100),
    borderRadius: moderateScale(8),
    marginRight: moderateScale(10),
  },
  mediaVideo: {
    width: moderateScale(300),
    height: moderateScale(200),
    borderRadius: moderateScale(8),
    marginRight: moderateScale(10),
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  overlayText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  noMediaText: {
    color: "#aaa",
    fontStyle: "italic",
    textAlign: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "end",
    gap: 10,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
  },
  commentSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  contentText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },

  navItem: { alignItems: "center" },
  navText: { color: "#fff", fontSize: 12, marginTop: 4 },
});
