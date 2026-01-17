import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import Animated, { FadeIn, SlideInDown } from "react-native-reanimated";
import { moderateScale } from "react-native-size-matters";
import { router, useRouter } from "expo-router";
import { useAuthManager } from "@/hooks/useAuthManager";

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onClose }) => {
  const [loading, setLoading] = React.useState(false);
  const handleCancel = () => {
    if (!loading) onClose();
  };
  const { logout } = useAuthManager();
  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={() => {
        if (!loading) onClose();
      }}
    >
      <Animated.View entering={FadeIn} style={styles.modalOverlay}>
        {/* Dismiss modal when pressing outside */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            if (!loading) onClose();
          }}
        />
        <Animated.View entering={SlideInDown} style={styles.modalContainer}>
          <View style={styles.contentContainer}>
            <Image
              source={require("@/assets/images/sammy-no-connection.png")}
              style={styles.illustration}
              resizeMode="contain"
            />

            <Text style={styles.title}>Do you want to logout?</Text>
            <Text style={styles.description}>
              You need to login to your account again, make sure you remember
              your password.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                disabled={loading}
              >
                <Text style={styles.logoutButtonText}>
                  {loading ? "Logging out..." : "Log Out"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000060",
  },
  modalContainer: {
    // width: "90%",
    // padding:0,
    // height: "80%",
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "white",
  },
  contentContainer: {
    backgroundColor: "#1a1a1a",
    borderRadius: moderateScale(12, 0.25),
    padding: moderateScale(16, 0.25),
    alignItems: "center",
    width: "90%",
    // padding:20,
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  illustration: {
    // backgroundColor:'black',
    width: moderateScale(200, 0.25),
    height: moderateScale(150, 0.25),
    marginBottom: moderateScale(20, 0.25),
  },
  title: {
    fontSize: moderateScale(16, 0.25),
    fontWeight: "bold",
    color: "#FAFAFB",
    textAlign: "center",
    marginBottom: moderateScale(10, 0.25),
  },
  description: {
    fontSize: moderateScale(12, 0.25),
    color: "#B5B5BE",
    textAlign: "center",
    marginBottom: moderateScale(20, 0.25),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: moderateScale(400, 0.25),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#292929",
    borderRadius: moderateScale(8, 0.25),
    paddingVertical: moderateScale(10, 0.25),
    alignItems: "center",
    marginRight: moderateScale(10, 0.25),
  },
  cancelButtonText: {
    color: "#FAFAFB",
    fontSize: moderateScale(14, 0.25),
  },
  logoutButton: {
    flex: 1,
    backgroundColor: "#D22A38",
    borderRadius: moderateScale(8, 0.25),
    paddingVertical: moderateScale(10, 0.25),
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: moderateScale(14, 0.25),
  },
});

export default LogoutModal;
