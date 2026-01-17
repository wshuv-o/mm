import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { API } from "@/api/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMediaLib } from "@/hooks/useMedia";
import { Part } from "@/packages/rte/src";
import { useForm } from "@tanstack/react-form";
import { RTE, RTECtxProviderHOC } from "./RTE";
import { IconButton } from "react-native-paper";
import { useAuthManager } from "@/hooks/useAuthManager";
import { AttachmentPreviewer } from "@/components/shared/SelectedAttachmentPreviewer";
import { UserShort } from "@/api/types";
import { MemizedHorizonTalScrollingPreviewer } from "./AttachMentPreviewers";
import { format } from "date-fns";
import { usePathname } from "expo-router";
import { UTIL } from "@/lib/utils";
import { moderateScale } from "react-native-size-matters";
import { groupBy } from "remeda";

const HighlightedText = ({
  text,
  searchQuery,
}: {
  text: string;
  searchQuery: string;
}) => {
  if (!searchQuery) return <Text style={styles.messageText}>{text}</Text>;

  // Split text into words while preserving spaces and punctuation
  const words = text.split(/(\s+|[.,!?;])/);
  const lowerQuery = searchQuery.toLowerCase();

  return (
    <Text style={styles.messageText}>
      {words.map((word, wordIndex) => {
        const lowerWord = word.toLowerCase();

        // If it's a space or punctuation, render as is
        if (/^\s+$|^[.,!?;]$/.test(word)) {
          return <Text key={wordIndex}>{word}</Text>;
        }

        // Check if word starts with the search query
        if (lowerWord.startsWith(lowerQuery)) {
          const matchLength = searchQuery.length;
          return (
            <Text key={wordIndex}>
              <Text style={styles.highlightedText}>
                {word.slice(0, matchLength)}
              </Text>
              {word.slice(matchLength)}
            </Text>
          );
        }

        // No match, render word as is
        return <Text key={wordIndex}>{word}</Text>;
      })}
    </Text>
  );
};

const formatTimestamp = (dateStr: string) => {
  return format(new Date(dateStr), "hh:mm a");
};

export function MessageList({
  peer,
  handleBack,
  disableMessaging,
  isMobile,
}: {
  isMobile: boolean;
  peer?: UserShort;
  handleBack: any;
  disableMessaging: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const qKey = ["dm", peer?.publicId];

  const { isPending, data, isSuccess } = useQuery({
    queryKey: qKey,
    queryFn: () => API.getInboxMsgs(peer?.publicId || ""),
    refetchInterval: 7000, //FIXME - implement realtime instead of polling
  });
  const queryClient = useQueryClient();
  const rteInstance = useMemo(() => qKey.join("-"), [peer]);
  const rteRef = useRef<any>(null);

  function cleanup() {
    form.reset();
    clearMedia();
    rteRef.current?.fns?.reset();
  }

  const mutation = useMutation({
    mutationFn: API.postInboxMessage,
    onSuccess: () => {
      cleanup();
      return queryClient.invalidateQueries({ queryKey: qKey });
    },
  });

  const { selectedMedia, pickMedia, hasMedia, clearMedia } = useMediaLib(
    true,
    { allowsMultipleSelection: true },
    () => rteRef.current?.fns?.focus()
  );

  const form = useForm({
    defaultValues: {
      content: [] as Part[],
    },
    onSubmit: ({ value }) => {
      if (!peer?.publicId) return;
      const payload = {
        recipientId: peer.publicId,
        attachments: selectedMedia,
        content: value.content,
      };
      mutation.mutate(payload);
    },
  });

  const { activeUser } = useAuthManager();

  const filteredMessages = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;

    return data.filter((msg) =>
      msg.content.some((content) =>
        content.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);
  const path = usePathname();

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
  const groupedMessages = filteredMessages.length
    ? groupBy(filteredMessages, (msg) => getGroupLabel(msg.createdAt))
    : {};
  const groupOrder = filteredMessages.length
    ? Array.from(
        new Set(filteredMessages.map((msg) => getGroupLabel(msg.createdAt)))
      )
    : [];
  const sRef = useRef();
  return isPending ? (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#141414",
      }}
    >
      <ActivityIndicator size="large" color="#D22A38" />
    </View>
  ) : (
    <View
      style={[
        styles.rightDiv,
        { minHeight: 350 },
        path == "/" && { borderRadius: 15, borderWidth: 1 },
      ]}
    >
      <View style={styles.header}>
        {isMobile && (
          <IconButton icon="arrow-left" iconColor="#fff" onPress={handleBack} />
        )}
        <Image
          source={{ uri: API.url(peer?.avatar?.url ?? "") }}
          style={styles.profileImage}
        />
        <Text style={styles.customerName}>{peer?.fullName}</Text>
        {/* <TouchableOpacity 
          style={styles.searchIcon}
          onPress={() => setShowSearch(!showSearch)}
        >
          <CustomIcon name="search-02" size={24} color="#fff" />
        </TouchableOpacity> */}
      </View>

      {showSearch && (
        <View style={styles.searchWrapper}>
          <View style={styles.searchContainer}>
            <CustomIcon name="search-02" size={20} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search messages..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery("");
                  setShowSearch(false);
                }}
                style={styles.clearButton}
              >
                <CustomIcon name="close" size={20} color="#888" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        style={styles.conversationView}
        ref={sRef}
        onContentSizeChange={() => {
          sRef.current?.scrollToEnd();
          isSuccess && API.sendInboxOpenedEvent(peer?.publicId);
        }}
      >
        {!filteredMessages?.length ? (
          <Text style={styles.noMessages}>
            {searchQuery ? "No messages found" : "No messages available"}
          </Text>
        ) : (
          groupOrder.map((groupLabel) => (
            <View key={groupLabel + "-group"}>
              <View style={{ marginVertical: 10, alignItems: "center" }}>
                <Text
                  style={{ color: "#92929D", fontSize: 13, fontWeight: "bold" }}
                >
                  {groupLabel}
                </Text>
              </View>
              {groupedMessages[groupLabel].map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageContainer,
                    (msg.author as any).publicId === activeUser?.publicId
                      ? styles.sentMessage
                      : styles.receivedMessage,
                  ]}
                >
                  <MemizedHorizonTalScrollingPreviewer
                    attachments={msg.attachments.map((a) => a.src)}
                  />
                  {Array.isArray(msg.content)
                    ? msg.content.map((content, contentIndex) => (
                        <HighlightedText
                          key={contentIndex}
                          text={content.text}
                          searchQuery={searchQuery}
                        />
                      ))
                    : typeof msg.content === "string"
                    ? (() => {
                        try {
                          const parsed = JSON.parse(msg.content);
                          if (Array.isArray(parsed)) {
                            return parsed.map((content, contentIndex) => (
                              <HighlightedText
                                key={contentIndex}
                                text={content.text}
                                searchQuery={searchQuery}
                              />
                            ));
                          }
                        } catch (e) {
                          // Not a JSON string, just render as plain text
                        }
                        return (
                          <Text style={styles.messageText}>{msg.content}</Text>
                        );
                      })()
                    : null}
                  <Text style={styles.timestamp}>
                    {formatTimestamp(msg.createdAt)}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
      {!disableMessaging && (
        <RTECtxProviderHOC>
          {(ctx) => {
            rteRef.current = ctx.renderdRtes.get(rteInstance);
            return (
              <View
                style={[
                  styles.inputContainer,
                  { gap: 8, marginHorizontal: 10 },
                ]}
                ref={ctx.svRef}
              >
                <TouchableOpacity onPress={() => pickMedia()}>
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
                        style={{
                          backgroundColor: "#1C1C1C",
                          height: multiline ? 75 : 56,
                        }}
                        contentStyle={{
                          paddingLeft: 12,
                          paddingRight: 3,
                        }}
                        placeholder="Type a message"
                        placeholderTextColor="#888"
                        onShiftEnter={form.handleSubmit}
                        onBlur={field.handleBlur}
                        instanceId={rteInstance}
                        multiline={multiline}
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
                        mentionConf={{
                          suggestionProps: {},
                          suggesTionPos: "top",
                          type: [],
                        }}
                      />
                    );
                  }}
                </form.Field>
                {mutation.isPending ? (
                  <ActivityIndicator size="small" color="#D22A38" />
                ) : (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={form.handleSubmit}
                  >
                    <Text style={styles.sendButtonText}>➤</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        </RTECtxProviderHOC>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,

    backgroundColor: "#141414",
  },
  leftDiv: {
    backgroundColor: "  red",
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
    color: "#fff",
    fontWeight: "bold",
  },
  message: {
    color: "#ccc",
    marginVertical: 2,
  },
  timestamp: {
    color: "#ff949e",
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
  mediaButton: {
    // marginRight: 10,
    padding: 10,
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
    height: moderateScale(30),
    width: moderateScale(30),
    marginLeft: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: moderateScale(18),
    textAlign: "center",
    lineHeight: moderateScale(18),
  },
  messageContainer: {
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
    maxWidth: "80%",
  },
  sentMessage: {
    backgroundColor: "#D22A38",
    alignSelf: "flex-end",
  },
  receivedMessage: {
    backgroundColor: "#333",
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
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
  searchIcon: {
    marginLeft: "auto",
    padding: 8,
  },
  searchWrapper: {
    backgroundColor: "#1C1C1C",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#252525",
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 5,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
  },
  clearButton: {
    padding: 5,
  },
  highlightedText: {
    backgroundColor: "rgba(0, 255, 0, 0.3)", // Semi-transparent green
    color: "#fff",
  },
});
