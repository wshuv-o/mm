import { API } from "@/api/api";
import { ClassItem } from "@/api/types";
import { useWindowQuery } from "@/hooks/useWindowQuery";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as React from "react";
import { View } from "react-native";
import { List } from "react-native-paper";
import { moderateScale } from "react-native-size-matters";

const LessonAttachments = ({
  files,
  currentVid,
  setVid,
  width,
}: {
  files: Required<ClassItem>["attachments"];
  currentVid: string | undefined;
  setVid: React.Dispatch<React.SetStateAction<string | undefined>>;
  width: number;
}) => {
  return (
    !!files?.length && (
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 30,
        }}
      >
        <List.Accordion
          title="Attachments"
          titleStyle={{ color: "#FAFAFB" }}
          style={{
            backgroundColor: "#252525",
            borderRadius: moderateScale(6),
            width,
          }}
          theme={{ colors: { background: "transparent" } }}
        >
          {files.map((v, i) => (
            <List.Item
              titleStyle={{ color: "#FAFAFB", marginRight: 11 }}
              style={{
                paddingVertical: 10,
                backgroundColor: "#252525",
                borderRadius: moderateScale(6),
                paddingHorizontal: moderateScale(10),
                marginTop: moderateScale(10),
                width,
                ...(currentVid === v.src.url && {
                  backgroundColor: "#5A1C1C",
                }),
              }}
              onPress={() => {
                if (v.src.mimeType.startsWith("video")) {
                  setVid((u) => (u == v.src.url ? undefined : v.src.url));
                } else {
                  API.downloader(API.url(v.src.url!), v.src.originalName);
                }
              }}
              title={v.src.originalName}
              right={() =>
                v.src.mimeType.startsWith("video") ? (
                  <Ionicons
                    size={18}
                    name={
                      currentVid === v.src.url
                        ? "close-circle-outline"
                        : "play-circle-outline"
                    }
                    color="#D22A38"
                  />
                ) : (
                  <Ionicons
                    size={18}
                    name="cloud-download-outline"
                    color="#D22A38"
                  />
                )
              }
            />
          ))}
        </List.Accordion>
      </View>
    )
  );
};

export default LessonAttachments;
