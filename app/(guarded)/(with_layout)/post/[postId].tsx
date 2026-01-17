import { API } from "@/api/api";
import PostItem from "@/components/home/PostItem";
import { HorizonTalScrollingPreviewer } from "@/components/shared/AttachMentPreviewers";
import { ContentRenderer } from "@/components/shared/ContentRenderer";
import { RteScrollView, RteCtxHOC } from "@/components/shared/RTE";
import { CommentEditorCtx } from "@/contexts/ctx";
import { useAuthManager } from "@/hooks/useAuthManager";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, usePathname } from "expo-router";
import { useContext, useMemo, useRef } from "react";
import { ActivityIndicator, Text, View, Image } from "react-native";
import { Button } from "react-native-paper";
import { moderateScale } from "react-native-size-matters";
import { format } from "date-fns";
import { UTIL } from "@/lib/utils";
import { WithConfirmationHOC } from "@/components/shared/WithConfirmationHOC";

export default function CommunityPostViewer() {
  const { postId } = useLocalSearchParams();
  const { posts, isSuccess, qKey } = useCurrentCommunity();
  const key = [...qKey, "post_comments", postId];
  const {
    data,
    isSuccess: c_isSuccess,
    refetch,
  } = useQuery({
    queryKey: key,
    queryFn: () => API.getPostComments(postId as string),
    refetchInterval: 12000, //FIXME - implement realtime instead of polling
  });
  const currentPost = useMemo(() => {
    return posts?.find((v) => v.publicId == postId);
  }, [postId, posts]);
  const { activeUser, userIsAdmin } = useAuthManager();
  const likeMtn = useMutation({
    mutationFn: (arg: any[]) => API.updateComment(...arg),
    onSuccess: async () => {
      return refetch();
    },
  });
  const rmMtn = useMutation({
    mutationFn: (arg) => API.deletePostComment(...arg),
    onSuccess: () => {
      return refetch();
    },
  });
  const parentIdSetter = useRef();
  return (
    <CommentEditorCtx.Provider
      value={{
        setParentIdSetter(_) {
          parentIdSetter.current = _;
        },
      }}
    >
      <RteScrollView>
        {currentPost ? (
          <View style={{ padding: moderateScale(8), gap: 20 }}>
            <PostItem item={currentPost!}></PostItem>

            {data?.map((c) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  paddingVertical: 3,
                }}
              >
                <Image
                  source={{ uri: API.url(c.author.avatar.url) }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 10,
                    marginTop: 5,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <View
                    key={c.publicId}
                    style={{
                      borderRadius: 15,
                      backgroundColor: "#1C1C1C",
                      padding: 10,
                    }}
                  >
                    <HorizonTalScrollingPreviewer
                      attachments={c.attachments.map((a) => a.src)}
                    ></HorizonTalScrollingPreviewer>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          color: "#696974",
                          fontSize: 12,
                          marginTop: 5,
                          width:'60%'
                        }}
                        numberOfLines={1}
                      >
                        {c.author.fullName}
                      </Text>
                      <Text
                        style={{
                          color: "#696974",
                          fontSize: 12,
                          marginTop: 5,
                        }}
                      >
                        {UTIL.formatMessageDate(c.createdAt)}
                      </Text>
                    </View>
                    <ContentRenderer
                      content={c.content}
                      rootTxtStyle={{
                        color: "#777",
                        fontSize: 12,
                        marginTop: 5,
                      }}
                    ></ContentRenderer>
                  </View>
                  <RteCtxHOC>
                    {({ renderdRtes }) => (
                      <View style={{ flexDirection: "row", marginTop: 10 }}>
                        <Button
                          mode="text"
                          style={{ alignSelf: "flex-start", left: -10 }}
                          onPress={() => {
                            renderdRtes.get(postId)?.fns.reset();
                            parentIdSetter.current?.(c.publicId);
                            renderdRtes.get(postId)?.fns.focus();
                          }}
                          textColor="#D22A38"
                        >
                          reply
                        </Button>

                        <Button
                          mode={c.meta.liked_by_me ? "outlined" : "text"}
                          theme={{
                            colors: {
                              onSurfaceDisabled: "#D22A38",
                              outline: "#D22A38",
                            },
                          }}
                          loading={
                            likeMtn.isPending &&
                            likeMtn.variables[0] == c.publicId
                          }
                          disabled={
                            likeMtn.isPending &&
                            likeMtn.variables[0] == c.publicId
                          }
                          style={{ left: -10 }}
                          onPress={() => {
                            likeMtn.mutate([
                              c.publicId,
                              { interactions: { liked: !c.meta.liked_by_me } },
                            ]);
                          }}
                          textColor="#D22A38"
                        >
                          like {c.meta.likes_count}
                        </Button>
                        {(userIsAdmin ||
                          activeUser!.publicId === c.author.publicId) && (
                          <WithConfirmationHOC isPending={rmMtn.isPending}>
                            {(confirm) => (
                              <Button
                                mode="text"
                                style={{ alignSelf: "flex-start", left: -10 }}
                                onPress={() =>
                                  confirm("Are you sure?", () =>
                                    rmMtn.mutate([c.publicId])
                                  )
                                }
                                textColor="#D22A38"
                              >
                                delete
                              </Button>
                            )}
                          </WithConfirmationHOC>
                        )}
                      </View>
                    )}
                  </RteCtxHOC>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              marginVertical: 100,
            }}
          >
            <ActivityIndicator size="large" color="#D22A38" />
          </View>
        )}
      </RteScrollView>
    </CommentEditorCtx.Provider>
  );
}
