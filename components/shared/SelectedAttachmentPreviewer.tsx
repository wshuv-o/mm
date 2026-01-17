import { imgAsset } from "@/hooks/useMedia";
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { IconButton } from "react-native-paper";
export function AttachmentPreviewer({
  left,
  top,
  selectedMedia,
  clearMedia,
}: Record<"top" | "left", number> & {
  selectedMedia: imgAsset[];
  clearMedia: (idx: number) => void;
}) {
  return (
    <View
      style={{
        top: top - 90,
        left,
        flexDirection: "row",
        gap: 5,
      }}
    >
      {selectedMedia.slice(0, 3).map((img, idx) => (
        <View style={styles.imgPreviewer}>
          <IconButton
            icon="close"
            // containerColor="#D22A38"
            iconColor="white"
            // mode="contained"
            style={{
              marginLeft: "auto",
              right: -17,
              top: 19,
              zIndex: 2,
            }}
            size={10}
            onPress={() => clearMedia(idx)}
          />
          <Image
            source={{ uri: img!.uri }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 5,
            }}
          />
        </View>
      ))}
      {selectedMedia.length > 3 && (
        <View style={styles.imgPreviewer}>
          <Text
            style={{
              color: "white",
              fontSize: 25,
              top: -9,
              fontWeight: "bold",
            }}
          >
            +{selectedMedia.length - 3}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  imgPreviewer: {
    width: 43,
    justifyContent: "flex-end",
  },
});
