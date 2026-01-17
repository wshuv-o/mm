import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
} from "react-native";
import CustomIcon from "../custom_icon/CustomIcon";
import { useContext, useEffect } from "react";
import { API } from "@/api/api";
import { useMediaLib } from "@/hooks/useMedia";
import { Part } from "@/packages/rte/src";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { CommentEditorCtx, rteCtx } from "@/contexts/ctx";
import { AttachmentPreviewer } from "@/components/shared/SelectedAttachmentPreviewer";
import { RTE } from "../shared/RTE";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";

export default function CommentEditor({ postId }: { postId: string }) {
  const { invalidatePostData } = useCurrentCommunity();
  const { renderdRtes } = useContext(rteCtx);
  const { selectedMedia, pickMedia, hasMedia, mediaCount, clearMedia } =
    useMediaLib(true, { allowsMultipleSelection: true }, () => {
      renderdRtes.get(postId)?.fns.focus();
    });
  const { mutate, isPending } = useMutation({
    mutationFn: (arg) => API.createComment(arg),
    onSuccess: () => {
      return invalidatePostData();
    },
  });
  const form = useForm({
    defaultValues: {
      content: [] as Part[],
      parentId: null,
    },
    onSubmit: ({ value }) => {
      const payload = {
        postId,
        attachments: selectedMedia,
        ...value,
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
    renderdRtes.get(postId)?.fns.reset();
  }
  const ctx = useContext(CommentEditorCtx);
  useEffect(() => {
    ctx?.setParentIdSetter?.((id) => {
      form.setFieldValue("parentId", (_) => id);
    });
  });
  return (
    <form.Field name="content">
      {(field) => {
        const multiline = Boolean(
          field.state.meta.isTouched &&
            (!field.state.meta.isBlurred || field.state.value?.[0]?.text)
        );
        return (
          <>
            <RTE
              style={[{ height: multiline ? 75 : 46, backgroundColor: "#1A1A1A" ,fontSize:15}]}
              placeholder={`Write your comment`}
              placeholderTextColor="#aaa"
              onBlur={field.handleBlur}
              instanceId={postId}
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
                  mention: {
                    fetch: async (kw) => {
                      const peoples = await API.getAllCommenters(postId);
                      return peoples
                        .filter((p) =>
                          p.userName
                            .toLocaleLowerCase()
                            .includes(kw.toLocaleLowerCase())
                        )
                        .map((p) => ({
                          id: p.publicId,
                          name: p.userName,
                        }));
                    },
                    queryKey: "commenters_of" + postId,
                  },
                },
                suggesTionPos: "top",
                type: ["mention"],
              }}
            />
            <View style={styles.commentIcons}>
              <TouchableOpacity onPress={() => pickMedia()}>
                <CustomIcon name="image-rectangle" size={20} color="#fff" />
              </TouchableOpacity>
              {isPending ? (
                <ActivityIndicator size="small" color="#D22A38" />
              ) : (
                field.getMeta().isTouched && (
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={form.handleSubmit}
                  >
                    <Text style={styles.sendButtonText}>➤</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </>
        );
      }}
    </form.Field>
  );
}
const styles = StyleSheet.create({
  commentIcons: {
    flexDirection: "row",
    marginLeft: 10,
    gap: 12,
  },
  sendButton: {
    paddingVertical: 4,
    paddingHorizontal: 7.5,
    backgroundColor: "#D22A38",
    borderRadius: 20,
  },
  sendButtonText: {
    top: -1,
    left: 1,
    color: "#fff",
    fontWeight: "bold",
  },
  imgPreviewer: {
    width: 43,
    justifyContent: "flex-end",
  },
});
