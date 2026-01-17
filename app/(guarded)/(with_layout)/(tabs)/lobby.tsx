import React, { useContext, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from "react-native";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { useWindowQuery } from "@/hooks/useWindowQuery";
import { API } from "@/api/api";
import { communityCtx } from "@/contexts/ctx";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMediaLib } from "@/hooks/useMedia";
import { Part } from "@/packages/rte/src";
import { useForm } from "@tanstack/react-form";
import { RTE, RTECtxProviderHOC } from "@/components/shared/RTE";
import { Divider } from "react-native-paper";
import { ContentRenderer } from "@/components/shared/ContentRenderer";
import { useAuthManager } from "@/hooks/useAuthManager";
import { AttachmentPreviewer } from "@/components/shared/SelectedAttachmentPreviewer";
import MemberShipGuard from "@/components/guards/MembershipGuard";
import { format } from "date-fns";
import { usePathname } from "expo-router";
import { UTIL } from "@/lib/utils";
import { getFontSize } from "@/utils/fontSize";
import { moderateScale } from "react-native-size-matters";
import { groupBy } from "remeda";
import { MemizedHorizonTalScrollingPreviewer } from "@/components/shared/AttachMentPreviewers";

export const lobbyMentionConf = (comId: string) => ({
  fetch: async (kw) => {
    const peoples = await API.getAllLobbyPeople(comId);
    return peoples
      .filter((p) =>
        p.userName.toLocaleLowerCase().includes(kw.toLocaleLowerCase())
      )
      .map((p) => ({
        id: p.publicId,
        name: p.userName,
      }));
  },
  queryKey: "lobby-people",
});
export function LobbyScreen({
  containerStyle,
  isEmbedded,
}: {
  containerStyle?: StyleProp<ViewStyle>;
  isEmbedded?: boolean;
}) {
  const comCtx = useContext(communityCtx)!;
  const qKey = ["lobby", comCtx.publicId];
  const { isPending, data } = useQuery({
    queryKey: qKey,
    queryFn: () => API.getLobbyMessages(comCtx.publicId),
    refetchInterval: 12000, //FIXME - implement realtime instead of polling
  });

  const queryClient = useQueryClient();
  const rteInstance = useMemo(
    () => "lobby" + comCtx.publicId,
    [comCtx.publicId]
  );
  let renderdRtes;
  function cleanup() {
    form.reset();
    clearMedia();
    renderdRtes.get(rteInstance)?.fns.reset();
  }
  const mutation = useMutation({
    mutationFn: API.postLobbyMessage,
    onSuccess: () => {
      cleanup();
      return queryClient.invalidateQueries({ queryKey: qKey });
    },
  });

  const { selectedMedia, pickMedia, hasMedia, mediaCount, clearMedia } =
    useMediaLib(true, { allowsMultipleSelection: true }, () =>
      renderdRtes?.get(rteInstance)?.fns.focus()
    );
  const form = useForm({
    defaultValues: {
      content: [] as Part[],
    },
    onSubmit: ({ value }) => {
      const payload = {
        communityId: comCtx.publicId,
        attachments: selectedMedia,
        content: value.content,
        // parentId?: string;
      };
      mutation.mutate(payload);
    },
  });
  const { width } = useWindowQuery();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (data?.length && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  }, [data]);

  // Helper to get group label for divider
  function getGroupLabel(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const messageDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    if (messageDate.getTime() === today.getTime()) {
      return "Today";
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return "Yesterday";
    } else {
      return UTIL.formatMessageDate(dateString).split(",")[0]; // e.g. '03 May 25'
    }
  }

  // Group messages by date label
  const groupedMessages = data
    ? groupBy(data, (msg) => getGroupLabel(msg.createdAt))
    : {};
  const groupOrder = data
    ? Array.from(new Set(data.map((msg) => getGroupLabel(msg.createdAt))))
    : [];

  return (
    <MemberShipGuard>
      <View style={[styles.rightDiv, containerStyle]}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          style={[styles.conversationView]}
          contentContainerStyle={{ paddingVertical: 27 }}
        >
          {!data?.length ? (
            <Text style={styles.noMessages}>No messages available</Text>
          ) : (
            groupOrder.map((groupLabel) => (
              <View key={groupLabel + "-group"}>
                <View style={{ marginVertical: 10, alignItems: "center" }}>
                  <Text
                    style={{
                      color: "#92929D",
                      fontSize: 13,
                      fontWeight: "bold",
                    }}
                  >
                    {groupLabel}
                  </Text>
                </View>
                {groupedMessages[groupLabel].map((msg, i) => (
                  <View
                    key={msg.createdAt + i}
                    style={{ marginHorizontal: 10 }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <Image
                          source={{ uri: API.url(msg.user.avatar.url) }}
                          style={styles.profileImage}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "bold",
                            color: "#FAFAFB",
                          }}
                        >
                          {UTIL.truncateTxt(msg.user.fullName, {
                            width: isEmbedded ? 130 : width * 0.6,
                            fontSize: 13,
                          })}
                        </Text>
                      </View>
                      <Text style={styles.timestamp}>
                        {format(new Date(msg.createdAt), "hh:mm a")}
                      </Text>
                    </View>
                    <MemizedHorizonTalScrollingPreviewer
                      attachments={msg.attachments.map((a) => a.src)}
                    />
                    <ContentRenderer
                      rootTxtStyle={[styles.messageText]}
                      content={msg.content}
                    ></ContentRenderer>
                    {
                      <Divider
                        style={{
                          marginVertical: 13,
                          backgroundColor: "#1c1c1c",
                        }}
                      />
                    }
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
        <RTECtxProviderHOC>
          {(ctx) => {
            renderdRtes = ctx.renderdRtes;
            return (
              <View
                style={[
                  styles.inputContainer,
                  { gap: 8, marginHorizontal: 10 },
                ]}
                ref={ctx.svRef}
              >
                <TouchableOpacity onPress={pickMedia}>
                  <CustomIcon name={"image-rectangle"} size={20} color="#fff" />
                </TouchableOpacity>
                <form.Field name="content">
                  {(field) => {
                    const multiline = Boolean(
                      field.state.meta.isTouched &&
                        (!field.state.meta.isBlurred ||
                          field.state.value?.[0]?.text)
                    );
                    return (
                      <RTE
                        style={[
                          {
                            backgroundColor: "#1C1C1C",
                            height: multiline ? 75 : 56,
                          },
                        ]}
                        contentStyle={{
                          paddingLeft: 12,
                          paddingRight: 3,
                        }}
                        placeholder="Type a message"
                        placeholderTextColor="#888"
                        onBlur={field.handleBlur}
                        wrapperStyle={
                          isEmbedded &&
                          width < 1400 && {
                            maxWidth: `${70 + width * 0.003}%`,
                          }
                        }
                        onShiftEnter={form.handleSubmit}
                        instanceId={rteInstance}
                        onFocus={() =>
                          field.setMeta((v) => ({
                            ...v,
                            isBlurred: false,
                            isTouched: true,
                          }))
                        }
                        onChangeFn={(content) => field.handleChange(content)}
                        onInactive={() => {
                          cleanup();
                          field.setMeta((v) => ({ ...v, isTouched: false }));
                        }}
                        multiline={multiline}
                        inputTop={({ top, left }) =>
                          hasMedia && (
                            <AttachmentPreviewer
                              clearMedia={clearMedia}
                              selectedMedia={selectedMedia}
                              left={left}
                              top={top}
                            />
                          )
                        }
                        // numberOfLines={5}

                        mentionConf={{
                          suggestionProps: {
                            mention: lobbyMentionConf(comCtx.publicId),
                          },
                          suggesTionPos: "top",
                          type: ["mention"],
                        }}
                      />
                    );
                  }}
                </form.Field>
                {mutation.isPending ? (
                  <ActivityIndicator size="small" color="#D22A38" />
                ) : (
                  <TouchableOpacity
                    style={[styles.sendButton]}
                    onPress={form.handleSubmit}
                  >
                    <Text style={styles.sendButtonText}>➤</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        </RTECtxProviderHOC>
      </View>
    </MemberShipGuard>
  );
}
export default function LobbyScreenPage() {
  return <LobbyScreen></LobbyScreen>;
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: "#141414",
  },
  leftDiv: {
    backgroundColor: "#121212",
    // backgroundColor: '',
    borderRightWidth: 1,
    borderRightColor: "#222",
    paddingTop: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    margin: 4,
    // padding: moderateScale(12),
  },
  rightDiv: {
    flex: 1,
    padding: 10,
    backgroundColor: "#1C1C1C",
    borderColor: "#2A2A2A",
  },
  sidebarHeading: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    paddingBottom: 6,
    // marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor:'red',
  },
  customerName: {
    color: "#D22A38",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 20,
  },
  conversationItem: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#1e1e1e",
  },
  selectedConversationItem: {
    backgroundColor: "#292929",
    borderColor: "#D22A38",
    borderWidth: 1,
  },
  conversationText: {
    flex: 1,
    marginLeft: 10,
  },
  sender: {
    color: "FAF9F6",
    fontWeight: "bold",
  },
  message: {
    color: "FAF9F6",
    marginVertical: 2,
  },
  timestamp: {
    color: "#696974",
    fontSize: 12,
    marginTop: 5,
  },
  conversationView: {
    flex: 1,
    // marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#444",
    paddingVertical: 10,
  },
  mediaButtonText: {
    fontSize: 20,
    color: "#D22A38",
  },
  selectedMediaPreview: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginLeft: 10,
  },
  sendButton: {
    backgroundColor: "#D22A38",
    borderRadius: 50,
    height: moderateScale(24),
    width: moderateScale(24),
    marginLeft: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: moderateScale(12),
    textAlign: "center",
    lineHeight: moderateScale(12),
  },
  messageContainer: {
    padding: 10,

    borderRadius: 15,
    marginVertical: 5,
    maxWidth: "80%",
  },
  sentMessage: {
    backgroundColor: "#222222",

    alignSelf: "flex-end",
  },
  receivedMessage: {
    backgroundColor: "#141414",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#B5B5BE",
  },
  noMessages: {
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
  },
  imgPreviewer: {
    width: 43,
    justifyContent: "flex-end",
  },
});
