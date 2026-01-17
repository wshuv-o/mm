import { API } from "@/api/api";
import { rteCtx } from "@/contexts/ctx";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useContext, useRef } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  Image,
  ActivityIndicator,
} from "react-native";
import CustomIcon from "../custom_icon/CustomIcon";
import { RTE } from "../shared/RTE";
import { moderateScale } from "react-native-size-matters";
import { useMediaLib } from "@/hooks/useMedia";
import { Badge, IconButton } from "react-native-paper";
import { Part } from "@/packages/rte/src";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
import { lobbyMentionConf } from "@/app/(guarded)/(with_layout)/(tabs)/lobby";
import { getFontSize } from "@/utils/fontSize";

export default function PostEditor() {
  const rteId = useRef("post_ed" + Date.now());
  const { renderdRtes } = useContext(rteCtx);
  const { invalidatePostData, communityId } = useCurrentCommunity();
  const { selectedMedia, pickMedia, hasMedia, mediaCount, clearMedia } =
    useMediaLib(true, { allowsMultipleSelection: true }, () =>
      renderdRtes.get(rteId.current)?.fns.focus()
    );
  API.getAllHashtags(communityId);
  const { mutate, isPending } = useMutation({
    mutationFn: (arg) => API.createPost(arg),
    onSuccess: () => {
      return invalidatePostData();
    },
  });

  const form = useForm({
    defaultValues: {
      content: [] as Part[],
    },
    onSubmit: ({ value }) => {
      const payload = {
        communityId,
        attachments: selectedMedia,
        content: value.content,
      };
      mutate(payload, {
        onSuccess: () => {
          cleanup();
        },
      });
    },
  });
  function cleanup() {
    form.reset();
    clearMedia();

    renderdRtes.get(rteId.current)?.fns.reset();
  }
  return (
    <form.Field name="content">
      {(field) => {
        return (
          <View style={styles.inputContainer}>
            {field.getMeta().isTouched && (
              <TouchableOpacity onPress={pickMedia} style={styles.mediaButton}>
                {/* <Text style={styles.mediaButtonText}>ᯤ</Text>  */}
                <CustomIcon name={"image-rectangle"} size={20} color="#fff" />

                {/* {["image-rectangle"].map((ic) => (
                        <TouchableOpacity>
                          <CustomIcon name={ic} size={20} color="#fff" />
                        </TouchableOpacity>
                      ))} */}
              </TouchableOpacity>
            )}

            <RTE
              style={[styles.postInput]}
              placeholder="What's on your mind?"
              placeholderTextColor="#aaa"
              onBlur={field.handleBlur}
              onFocus={() =>
                field.setMeta((v) => ({
                  ...v,
                  isBlurred: false,
                  isTouched: true,
                }))
              }
              instanceId={rteId.current}
              onChangeFn={(content) => field.handleChange(content)}
              onInactive={() => {
                cleanup();
                field.setMeta((v) => ({ ...v, isTouched: false }));
              }}
              multiline
              mentionConf={{
                suggestionProps: {
                  hashtag: {
                    queryKey: ["htgs", communityId],
                    fetch: async (kw) => {
                      const tag = await API.getAllHashtags(communityId);
                      const filtered = tag
                        .filter((t) =>
                          t.tag
                            .toLocaleLowerCase()
                            .includes(kw.toLocaleLowerCase())
                        )
                        .map((t) => ({
                          id: t.tag,
                          name: t.tag,
                        }));
                      return filtered.length
                        ? filtered
                        : [
                            {
                              id: Date.now(),
                              name: kw,
                              isNew: true,
                            },
                          ];
                    },
                  },
                  mention: lobbyMentionConf(communityId),
                },
                type: ["hashtag", "mention"],
              }}
            />
            {field.getMeta().isTouched && (
              <View style={{ marginLeft: 14 }}>
                {hasMedia && (
                  <View>
                    <IconButton
                      icon="close"
                      // containerColor="#D22A38"
                      iconColor="white"
                      // mode="contained"
                      style={{
                        marginLeft: "auto",
                        right: -12,
                        top: 16,
                        zIndex: 2,
                      }}
                      size={10}
                      onPress={clearMedia}
                    />
                    <Image
                      source={{ uri: selectedMedia.at(-1)!.uri }}
                      style={styles.selectedMediaPreview}
                    />
                    <Badge
                      visible={mediaCount > 1}
                      style={{ bottom: 11, backgroundColor: "#D22A38" }}
                      size={17}
                    >
                      {mediaCount}
                    </Badge>
                  </View>
                )}
                {isPending ? (
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
            )}
          </View>
        );
      }}
    </form.Field>
  );
}
const styles = StyleSheet.create({
  postInput: {
    fontSize: getFontSize("medium"),
    fontWeight: "400",
    color: "#D5D5DC",
    fontFamily: "poppins",
    padding: moderateScale(0),
    backgroundColor: "#1C1C1C",
    borderRadius: moderateScale(7),
    flexGrow: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
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
    paddingTop: "auto",
  },
  mediaButtonText: {
    fontSize: 20,
    color: "#D22A38",
  },
  selectedMediaPreview: {
    width: 40,
    height: 40,
    borderRadius: 5,
    // marginLeft: 12,
  },
  sendButton: {
    backgroundColor: "#D22A38",
    borderRadius: 50,
    height: moderateScale(30),
    width: moderateScale(30),
    marginLeft: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: moderateScale(18),
    textAlign: 'center',
    lineHeight: moderateScale(18),
  },
});
