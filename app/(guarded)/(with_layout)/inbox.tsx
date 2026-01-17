import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from "react-native";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { MessageList } from "@/components/shared/MessageList";
import { useWindowQuery } from "@/hooks/useWindowQuery";
import { useAuthManager } from "@/hooks/useAuthManager";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/api/api";
import { InboxData, UserShort } from "@/api/types";
import { differenceInMinutes, formatDistanceToNowStrict } from "date-fns";
import { usePathname } from "expo-router";
import { Badge, TextInput } from "react-native-paper";
import { entries } from "remeda";
type Peer = NonNullable<InboxData["allowedPeers"]>[number];
type InboxItem = InboxData["inboxes"][number] & {
  recipientActive: boolean;
  recipientLastSeen: string;
};
type InboxListprops = {
  inboxes: InboxItem[];
  isMobile: boolean;
  selectedConversation: InboxItem | null;
  handleConversationSelect: (item: InboxItem) => void;
};
function InboxList({
  inboxes,
  selectedConversation,
  handleConversationSelect,
  isMobile,
}: InboxListprops) {
  const path = usePathname();
  // Mock active status: alternate users are active for demo
  const isActive = (idx: number) => idx % 2 === 1;
  const [searchQuery, setSearchQuery] = useState("");
  const { activeUser } = useAuthManager();
  const isStudent =
    activeUser &&
    Array.isArray(activeUser.rolesPlain) &&
    activeUser.rolesPlain.includes("student");
  const filteredInboxes = useMemo(() => {
    if (!searchQuery.trim()) return inboxes;
    return inboxes.filter((item) =>
      item.recipient.userName
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase())
    );
  }, [searchQuery, inboxes]);
  return (
    <View
      style={[
        styles.leftDiv,
        {
          width: isMobile ? "100%" : "25%",
        },
        path == "/" && { borderRadius: 15, borderWidth: 1 },
      ]}
    >
      <Text style={styles.sidebarHeading}>Messages</Text>
      {/* Search Bar (not for students) */}
      {!isStudent && (
        <View style={styles.searchBarContainer}>
          <TextInput
            style={{
              width: "100%",
              height: 40,
              color: "#fff",
              fontSize: 15,
              backgroundColor: "transparent",
            }}
            outlineStyle={{
              borderWidth: 0,
            }}
            value={searchQuery}
            onChangeText={setSearchQuery}
            left={
              <TextInput.Icon
                icon={(p) => (
                  <CustomIcon {...p} name="search-01" color="#92929D" />
                )}
              />
            }
            mode="outlined"
            placeholder="search..."
            placeholderTextColor="#696974"
            textColor="#FAFAFB"
          />
        </View>
      )}
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        data={filteredInboxes}
        renderItem={({ item, index }: { item: InboxItem; index: number }) => (
          <TouchableOpacity
            style={[
              styles.conversationItem,
              selectedConversation?.recipient?.publicId ===
                item.recipient.publicId && styles.selectedConversationItem,
            ]}
            onPress={() => handleConversationSelect(item)}
            activeOpacity={0.8}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                maxWidth: "67%",
              }}
            >
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: API.url(item.recipient.avatar.url) }}
                  style={styles.profileImage}
                />
                <Badge
                  visible={!!item.meta.unread_count}
                  style={{
                    top: "-28%",
                    left: "-10%",
                    position: "absolute",
                    backgroundColor: "#D22A38",
                  }}
                  size={20}
                >
                  {item.meta.unread_count}
                </Badge>
              </View>
              <View style={styles.conversationText}>
                <Text style={styles.sender} numberOfLines={1}>
                  {item.recipient.fullName}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {item.recipientActive ? (
                <View style={styles.activeDot} />
              ) : (
                <Text style={styles.timestamp}>{item.recipientLastSeen}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item: InboxItem) => item.recipient.publicId}
      />
    </View>
  );
}
export function InboxView({
  isEmbedded,
  containerStyle,
}: {
  isEmbedded?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  const [selectedConversation, setSelectedConversation] =
    useState<InboxItem | null>(null);
  const { isMobile: __isMobile, width } = useWindowQuery();
  const isMobile = useMemo(
    () => isEmbedded || __isMobile,
    [isEmbedded, __isMobile]
  );
  const [showRightDiv, setShowRightDiv] = useState(width < 1068);

  const qKey = ["inboxes"];
  const { isPending, data: _data } = useQuery({
    queryKey: qKey,
    queryFn: API.getInboxes,
    refetchInterval: 12000, //FIXME - implement realtime instead of polling
  });

  //FIXME - this is realy unnecessary.width will not change much on real world scenerio.
  useEffect(() => {
    const handleResize = () => {
      const mobile = width < 1068;
      if (!mobile) setShowRightDiv(true);
      else setShowRightDiv(false);
    };
    handleResize();
  }, [width]);
  const { activeUser } = useAuthManager();
  const data = useMemo(() => {
    //NOTE - inject self messaging entity until there exists one
    if (!_data) return [];
    const genStatus = (status: InboxData["activityStatus"][number]) => ({
      recipientActive:
        differenceInMinutes(new Date(), new Date(status.peer_last_seen_at)) <=
        1,
      recipientLastSeen: formatDistanceToNowStrict(status.peer_last_seen_at),
    });
    //@ts-expect-error
    const genIbox = (recipient: UserShort): InboxItem => ({
      meta: {
        last_msg_ts: null,
        unread_count: 0,
      },
      recipient,

      canMessage: true,
    });
    const inboxes = _data.inboxes;
    //NOTE - inject non-existant inox items until there exists one for each of them
    for (const peer of [
      activeUser,
      ...(_data?.allowedPeers ?? []),
    ] as UserShort[]) {
      const status = _data.activityStatus.find(
        (v) => v.peer_public_id === peer.publicId
      );
      const exists = inboxes.find(
        (v) => v.recipient.publicId === peer.publicId
      );
      if (exists) {
        exists.canMessage = true;
        entries(genStatus(status!)).forEach(([k, v]) => (exists[k] = v));
      } else inboxes.push({ ...genIbox(peer), ...genStatus(status!) });
    }

    return inboxes;
  }, [_data]);
  useEffect(() => {
    // Do not auto-select a conversation by default
  }, [data]);

  const handleConversationSelect = (item: InboxItem) => {
    setSelectedConversation(item);
    if (isMobile) setShowRightDiv(true);
  };

  const handleBack = () => {
    setShowRightDiv(false);
    setSelectedConversation(null);
  };

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
    <View style={[styles.container, containerStyle]}>
      {(!isMobile || !showRightDiv || !selectedConversation) && (
        <>
          <InboxList
            {...{
              inboxes: data!,
              selectedConversation,
              handleConversationSelect,
              isMobile,
            }}
          ></InboxList>
        </>
      )}

      {selectedConversation && (!isMobile || showRightDiv) && (
        <MessageList
          handleBack={handleBack}
          isMobile={isMobile}
          peer={selectedConversation?.recipient}
          disableMessaging={!selectedConversation?.canMessage}
        ></MessageList>
      )}
    </View>
  );
}
export default function InboxViewPage() {
  return <InboxView></InboxView>;
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: "#141414",
  },
  leftDiv: {
    backgroundColor: "#1c1c1c",
    // backgroundColor: '',
    borderRightWidth: 1,
    borderRightColor: "#222",
    paddingTop: 10,
    borderColor: "#2A2A2A",
  },
  rightDiv: {
    flex: 1,
    padding: 10,
    backgroundColor: "#000000",
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginHorizontal: 8,

    borderRadius: 12,
    backgroundColor: "#1c1c1c",
  },
  selectedConversationItem: {
    borderColor: "#D22A38",
    borderWidth: 2,
    borderRadius: 12,
  },
  conversationText: {
    flex: 1,
    marginLeft: 0,
  },
  sender: {
    color: "#FAFAFB",
    fontWeight: "600",
    fontSize: 15,
  },
  timestamp: {
    color: "#B5B5BE",
    fontSize: 13,
    marginLeft: 12,
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
  input: {
    flex: 1,
    backgroundColor: "#333",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    color: "#fff",
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
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#D22A38",
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#19191C",
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 16,
    paddingHorizontal: 8,
    height: 44,
  },

  avatarWrapper: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FFD600",
    padding: 2,
    marginRight: 10,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4ADE80",
    marginLeft: 12,
  },
});
