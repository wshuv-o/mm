import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import { Button } from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { useMutation } from "@tanstack/react-query";
import { useAuthManager } from "@/hooks/useAuthManager";
import { API } from "@/api/api";
import { useWindowQuery } from "@/hooks/useWindowQuery";

const MyProfilePrScreen = () => {
  const [editingField, setEditingField] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const { isMobile } = useWindowQuery(768);

  const { userMeta, activeUser, userFiles, invalidateUserData } =
    useAuthManager();

  const profileFields = [
    {
      label: "full name",
      value: activeUser.fullName || "-",
      editable: true,
      key: "fullName",
    },
    {
      label: "user name",
      value: activeUser.userName || "-",
      editable: true,
      key: "userName",
    },
    {
      label: "email",
      value: activeUser.email || "-",
      editable: true,
      key: "email",
    },
    {
      label: "phone",
      value: activeUser.phoneNumber || "-",
      editable: true,
      key: "phoneNumber",
    },
    {
      label: "website",
      value: activeUser.website || "-",
      editable: true,
      key: "website",
    },
    {
      label: "skills",
      value: activeUser.skills || "-",
      editable: true,
      key: "skills",
    },
    {
      label: "bio",
      value: activeUser.bio || "-",
      editable: true,
      key: "bio",
    },
  ];
  const mutation = useMutation({
    mutationFn: ({
      fieldKey,
      newValue,
    }: {
      fieldKey: string;
      newValue: string;
    }) => API.updateProfileField(fieldKey, newValue),
    onSuccess: () => {
      setEditingField(null);
      invalidateUserData();
    },
  });

  const handleEdit = (fieldIndex: number) => {
    setEditingField(fieldIndex);
    setEditValue(profileFields[fieldIndex].value);
  };

  const handleSave = () => {
    if (editingField === null) return;
    const { key } = profileFields[editingField];
    mutation.mutate({ fieldKey: key, newValue: editValue });
  };

  const renderFields = () => {
    return profileFields.map((item, index) => {
      if (isMobile) {
        return (
          <View
            key={item.key}
            style={[styles.row, index % 2 !== 0 && styles.altRow]}
          >
            <View>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{item.value}</Text>
            </View>
            {item.editable ? (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(index)}
              >
                <CustomIcon
                  name="edit"
                  size={moderateScale(20)}
                  color="#C72937"
                  style={styles.iconB}
                />
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              item.value && (
                <CustomIcon
                  name="check-circle"
                  size={moderateScale(15)}
                  color="#4CAF50"
                  style={styles.iconB}
                />
              )
            )}
          </View>
        );
      }
      return (
        <View
          key={item.key}
          style={[styles.rowWeb, index % 2 !== 0 && styles.altRow]}
        >
          <View style={{ flex: 2 }}>
            <Text style={styles.labelWeb}>{item.label}</Text>
          </View>
          <View style={{ flex: 3 }}>
            <Text style={styles.valueWeb}>{item.value}</Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            {item.editable ? (
              <TouchableOpacity
                style={styles.editButtonWeb}
                onPress={() => handleEdit(index)}
              >
                <CustomIcon
                  name="edit"
                  size={moderateScale(15)}
                  color="#C72937"
                  style={styles.iconB}
                />
                <Text style={styles.editTextWeb}>Edit</Text>
              </TouchableOpacity>
            ) : (
              item.value && (
                <CustomIcon
                  name="check-circle"
                  size={moderateScale(15)}
                  color="#4CAF50"
                  style={styles.iconB}
                />
              )
            )}
          </View>
        </View>
      );
    });
  };

  const profileDetails = (
    <View style={styles.secondContainer}>
      <View style={styles.insideContainer}>
        <View style={[styles.insideContainer, styles.Chartcontent]}>
          {renderFields()}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.rowDash}>
        <Text style={styles.sectionTitle}>My Profile</Text>
      </View>
      {isMobile ? (
        <>{profileDetails}</>
      ) : (
        <View style={styles.webLayout}>
          <View style={styles.webAvatarColumn}>
            <Image
              source={{ uri: API.url(userFiles.avatar.url) }}
              style={styles.webAvatar}
            />
          </View>
          <View style={styles.webMiddleColumn}>{profileDetails}</View>
        </View>
      )}
      <Modal
        visible={editingField !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingField(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Edit{" "}
              {editingField !== null ? profileFields[editingField].label : ""}
            </Text>
            <TextInput
              style={styles.input}
              value={editValue}
              onChangeText={setEditValue}
              placeholder="Enter new value"
              placeholderTextColor="#666"
            />
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setEditingField(null)}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                loading={mutation.isPending}
                disabled={mutation.isPending}
                style={[styles.modalButton, styles.saveButton]}
              >
                Save
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MyProfilePrScreen;

const styles = StyleSheet.create({
  container: {
    margin: 20,
    borderWidth: 1,
    borderRadius: moderateScale(8),
    borderColor: "#2A2A2A",
    backgroundColor: "#1C1C1C",
  },
  secondContainer: {
    alignSelf: "stretch",
    backgroundColor: "#1C1C1C",
  },
  insideContainer: {
    backgroundColor: "#1C1C1C",
    borderRadius: moderateScale(8),
  },
  Chartcontent: {
    padding: moderateScale(16),
    backgroundColor: "#1C1C1C",
  },
  rowDash: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#1C1C1C",
    padding: moderateScale(8),
    borderRadius: moderateScale(10),
  },
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: "500",
    fontFamily: "poppins",
    color: "#FAFAFB",
    backgroundColor: "#1C1C1C",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    padding: moderateScale(12),
    marginBottom: moderateScale(8),
  },
  altRow: {
    backgroundColor: "#252525",
  },
  label: {
    fontSize: moderateScale(13),
    color: "#FAFAFB",
    fontWeight: "500",
    fontFamily: "poppins",
    marginBottom: moderateScale(1),
  },
  value: {
    fontSize: moderateScale(11),
    color: "#B5B5BE",
    fontWeight: "400",
    fontFamily: "poppins",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  editText: {
    fontSize: moderateScale(8),
    color: "#808080",
    fontWeight: "400",
    fontFamily: "poppins",
  },
  rowWeb: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1C1C1C",
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
    marginBottom: moderateScale(4),
  },
  labelWeb: {
    fontSize: moderateScale(10),
    color: "#FAFAFB",
    fontWeight: "500",
    fontFamily: "poppins",
  },
  valueWeb: {
    fontSize: moderateScale(10),
    color: "#B5B5BE",
    fontWeight: "400",
    fontFamily: "poppins",
  },
  editButtonWeb: {
    flexDirection: "row",
    alignItems: "center",
  },
  editTextWeb: {
    fontSize: moderateScale(9),
    color: "#C72937",
    marginLeft: moderateScale(4),
    fontFamily: "poppins",
  },
  webLayout: {
    flexDirection: "row",
  },
  webAvatarColumn: {
    width: moderateScale(140),
    padding: moderateScale(10),
    alignItems: "flex-start",
  },
  webAvatar: {
    width: moderateScale(120),
    height: moderateScale(120),
    borderRadius: moderateScale(12),
    backgroundColor: "#C72937",
    resizeMode: "cover",
    borderWidth: 2,
    borderColor: "#D72937",
  },
  webMiddleColumn: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1A1A1A",
    padding: moderateScale(20),
    borderRadius: moderateScale(12),
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: moderateScale(18),
    color: "#FFFFFF",
    marginBottom: moderateScale(15),
  },
  input: {
    backgroundColor: "#252525",
    color: "#FFFFFF",
    padding: moderateScale(10),
    borderRadius: moderateScale(8),
    marginBottom: moderateScale(20),
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    minWidth: 100,
    marginLeft: moderateScale(8),
  },
  saveButton: {
    backgroundColor: "#C72937",
  },
});
