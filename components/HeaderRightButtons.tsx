import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router, useRouter } from "expo-router";
import { Avatar } from "react-native-paper";
import { useAuthManager } from "@/hooks/useAuthManager";
import LogoutModal from "@/components/LogoutModal";
import { moderateScale } from "react-native-size-matters";
import CustomIcon from "./custom_icon/CustomIcon";
import { API } from "@/api/api";
import { formatDistanceToNow } from "date-fns";
import { useWindowQuery } from "@/hooks/useWindowQuery";
import { Badge } from "react-native-paper";
import { useNotifications } from "@/hooks/useNotifications";
export function HeaderRightButtons() {
  const { unreadDmCount } = useNotifications();
  return (
    <>
      <TouchableOpacity
        onPress={() => router.navigate("/inbox")}
        style={{ marginRight: moderateScale(8) }}
      >
        <CustomIcon name="chat-02" size={24} color="#B5B5BE" />
        <Badge
          visible={!!unreadDmCount}
          style={{
            top: "-50%",
            right: "-35%",
            position: "absolute",
            backgroundColor: "#D22A38",
          }}
          size={24}
        >
          {unreadDmCount}
        </Badge>
      </TouchableOpacity>
      <NotificationModal />
      <AccountDropdown />
    </>
  );
}
function NotificationModal() {
  const modalRef = useRef<View>(null);
  const { isMobile } = useWindowQuery();
  const notifFontSize = isMobile ? 13 : 14;
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { visible, onClose } = useMemo(
    () => ({
      visible: showNotifications,
      onClose: () => setShowNotifications(false),
    }),
    [showNotifications]
  );
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (modalRef.current && !(modalRef.current as any).contains(e.target)) {
        onClose();
      }
    }
    if (visible) {
      document.addEventListener("click", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [visible, onClose]);
  const handleToggleShowUnread = () => {
    setShowUnreadOnly((prev) => !prev);
  };
  const { unreadCount, data, invalidateNotifData } =
    useNotifications(showUnreadOnly);
  const { height } = useWindowQuery();
  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setShowNotifications((prev) => !prev);
        }}
        style={{ marginRight: moderateScale(8) }}
      >
        <CustomIcon name="notification" size={24} color="#B5B5BE" />
        <Badge
          visible={!!unreadCount}
          style={{
            top: "-50%",
            right: "-35%",
            position: "absolute",
            backgroundColor: "#D22A38",
          }}
          size={24}
        >
          {unreadCount}
        </Badge>
      </TouchableOpacity>
      {visible && (
        <View
          style={[styles.container, { maxHeight: height * 0.7 }]}
          ref={modalRef}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {data ? (
              data.length ? (
                [...data, ...data, ...data, ...data].map((notif, i) => (
                  <TouchableOpacity
                    key={notif.id + i}
                    style={styles.notificationItem}
                    onPress={() => {
                      API.markNotificationsAsRead(notif.id).then(() =>
                        invalidateNotifData()
                      );
                      notif.action();
                    }}
                  >
                    <Text
                      style={[styles.userName, { fontSize: notifFontSize }]}
                    >
                      {notif.fullName || notif.userName}
                    </Text>
                    <Text
                      style={[styles.description, { fontSize: notifFontSize }]}
                    >
                      {notif.description}
                    </Text>
                    <View style={styles.timeContainer}>
                      <Text
                        style={[styles.timeText, { fontSize: notifFontSize }]}
                      >
                        {formatDistanceToNow(notif.timestamp, {
                          addSuffix: true,
                        })}
                      </Text>
                      {!notif.hasRead && <View style={styles.unreadDot} />}
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noNotificationsText}>
                  No notifications available
                </Text>
              )
            ) : (
              <ActivityIndicator size="small" color="#D22A38" />
            )}
          </ScrollView>
          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={() => {
                API.markNotificationsAsRead().then(() => invalidateNotifData());
              }}
            >
              <Text style={[styles.markAll, { fontSize: notifFontSize }]}>
                Mark all as read
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.showUnreadBtn}
              onPress={handleToggleShowUnread}
            >
              <Text style={[styles.showUnreadTxt, { fontSize: notifFontSize }]}>
                {showUnreadOnly ? "Show All" : "Show Unread Only"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );
}
function AccountDropdown() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { userFiles } = useAuthManager();
  const router = useRouter();
  const dropdownRef = useRef<any>();
  const toggleDropdown = () => setShowDropdown((prev) => !prev);
  const handleSettings = () => {
    router.navigate("/dashboard/preferences");
    setShowDropdown(false);
  };
  const handleLogout = () => {
    setShowLogoutModal(true);
    setShowDropdown(false);
  };
  const handleOutsideClick = (e: any) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setShowDropdown(false);
    }
  };
  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);
  return (
    <View style={{ position: "relative", marginRight: 0 }}>
      <TouchableOpacity onPress={toggleDropdown} style={styles.modalBackground}>
        <Avatar.Image
          size={moderateScale(20)}
          source={{ uri: API.url(userFiles.avatar.url) }}
        />
      </TouchableOpacity>
      {showDropdown && (
        <View ref={dropdownRef} style={styles.dropdown}>
          <TouchableOpacity
            onPress={handleSettings}
            style={styles.dropdownItem}
          >
            <Text style={styles.dropdownText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
            <Text style={styles.dropdownText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
      {showLogoutModal && (
        <LogoutModal
          visible={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  modalBackground: {
    padding: 2,
    backgroundColor: "#D22A38",
    // marginRight: 20,
    borderRadius: 50,
  },
  dropdown: {
    position: "absolute",
    top: moderateScale(25),
    right: 20,
    backgroundColor: "#393939",
    borderRadius: 8,
    paddingVertical: moderateScale(5),
    paddingHorizontal: moderateScale(30),
    zIndex: 999,
  },
  dropdownItem: {
    paddingVertical: moderateScale(5),
  },
  dropdownText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  ProfileN: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    fontFamily: "poppins",
    color: "#FAFAFB",
    padding: 50,
  },
  IconButtonH: {
    alignItems: "flex-start",
    margin: moderateScale(10),
  },
  headerLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  desktopNav: {
    flexDirection: "row",
    alignItems: "center",
  },
  desktopNavButton: {
    marginHorizontal: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  desktopNavContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  desktopNavIcon: {
    marginRight: 8,
  },
  desktopNavText: {
    color: "#B5B5BE",
    fontSize: 14,
    fontFamily: "poppins",
    fontWeight: "500",
  },
  container: {
    position: "absolute",
    top: moderateScale(30),
    right: 30,
    width: moderateScale(240),
    backgroundColor: "#1a1a1a",
    borderRadius: moderateScale(6),
    padding: moderateScale(10),
    zIndex: 998,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  notificationItem: {
    borderBottomColor: "#333",
    borderBottomWidth: 1,
    paddingBottom: moderateScale(8),
    marginBottom: moderateScale(8),
  },
  userName: {
    color: "#FFF",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  description: {
    color: "#CCC",
    fontSize: moderateScale(12),
    marginTop: moderateScale(2),
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: moderateScale(2),
  },
  timeText: {
    color: "#999",
    fontSize: moderateScale(12),
  },
  unreadDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    backgroundColor: "#D22A38",
    borderRadius: moderateScale(3),
    marginLeft: moderateScale(4),
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: moderateScale(4),
  },
  markAll: {
    color: "#D22A38",
    fontSize: moderateScale(8),
    fontWeight: "500",
  },
  showUnreadBtn: {
    backgroundColor: "#D22A38",
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(4),
    alignItems: "center",
  },
  showUnreadTxt: {
    color: "#FFF",
    fontSize: moderateScale(8),
    fontWeight: "500",
  },
  noNotificationsText: {
    fontSize: moderateScale(10),
    color: "#FFF",
    textAlign: "center",
    marginVertical: moderateScale(8),
  },
});
