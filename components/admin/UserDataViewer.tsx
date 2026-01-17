import React, { ReactNode } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { moderateScale } from "react-native-size-matters";
import { API } from "@/api/api";
import { useWindowQuery } from "@/hooks/useWindowQuery";
import { isString } from "remeda";
type _props = {
  data: { label: string; value: string | ReactNode }[];
  avatarUrl: string;
};

export default function UserDataViewer({ data, avatarUrl }: _props) {
  const { isMobile } = useWindowQuery(768);

  const profileDetails = (
    <View style={[styles.insideContainer]}>
      {data.map((item, index) =>
        isMobile ? (
          <View
            key={item.key}
            style={[styles.row, index % 2 !== 0 && styles.altRow]}
          >
            <View>
              {isString(item.value) ? (
                <Text style={styles.value}>{item.value}</Text>
              ) : (
                item.value
              )}
            </View>
          </View>
        ) : (
          <View
            key={item.key}
            style={[styles.rowWeb, index % 2 !== 0 && styles.altRow]}
          >
            <View style={{ flex: 2 }}>
              <Text style={styles.labelWeb}>{item.label}</Text>
            </View>
            <View style={{ flex: 3 }}>
              {isString(item.value) ? (
                <Text style={styles.valueWeb}>{item.value}</Text>
              ) : (
                item.value
              )}
            </View>
            <View style={{ flex: 1, alignItems: "flex-end" }}></View>
          </View>
        )
      )}
    </View>
  );

  return (
    <>
      {isMobile ? (
        <>{profileDetails}</>
      ) : (
        <View style={styles.webLayout}>
          <View style={styles.webAvatarColumn}>
            <Image
              source={{ uri: API.url(avatarUrl) }}
              style={styles.webAvatar}
            />
          </View>
          <View style={styles.webMiddleColumn}>{profileDetails}</View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  secondContainer: {
    alignSelf: "stretch",
  },
  insideContainer: {
    borderRadius: moderateScale(8),
  },
  rowDash: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#1A1A1A",
    padding: moderateScale(8),
    borderRadius: moderateScale(10),
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
    fontSize: moderateScale(10),
    color: "#FAFAFB",
    fontWeight: "500",
    fontFamily: "poppins",
    marginBottom: moderateScale(1),
  },
  value: {
    fontSize: moderateScale(14),
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
    backgroundColor: "#1A1A1A",
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(10),
    marginBottom: moderateScale(4),
  },
  labelWeb: {
    fontSize: moderateScale(16),
    color: "#FAFAFB",
    fontWeight: "500",
    fontFamily: "poppins",
  },
  valueWeb: {
    fontSize: moderateScale(14),
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
