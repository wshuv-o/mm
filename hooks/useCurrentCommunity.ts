import { API } from "@/api/api";
import { communityCtx } from "@/contexts/ctx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useState } from "react";
import { merge } from "remeda";
export function useCurrentCommunity() {
  const comCtx = useContext(communityCtx);
  if (!comCtx) {
    throw new Error("not inside community context");
  }
  const qc = useQueryClient();

  const qKey = useMemo(
    () => [
      "posts",
      comCtx.publicId,
      ...(comCtx.ctxExtra?.tags ? comCtx.ctxExtra?.tags : []),
    ],
    [comCtx.ctxExtra, comCtx.publicId]
  );
  const { data, ...q } = useQuery({
    queryKey: qKey,
    queryFn: () => API.getPosts(comCtx.publicId, comCtx.ctxExtra?.tags),
  });
  const { data: hashTags } = useQuery({
    queryKey: ["htags", comCtx.publicId],
    queryFn: () => API.getAllHashtags(comCtx.publicId),
  });
  const [filteredPosts, setPosts] = useState(data);

  useEffect(() => {
    if (!comCtx.ctxExtra.postSearch) {
      return setPosts(data);
    }
    setPosts(
      data?.filter((p) =>
        JSON.stringify(p.content)
          .toLowerCase()
          .includes(comCtx.ctxExtra.postSearch!.toLowerCase())
      )
    );
  }, [comCtx.ctxExtra.postSearch, data]);
  return merge(q, {
    communityId: comCtx.publicId,
    posts: filteredPosts,
    pageInfo: undefined,
    hashTags,
    qc,
    qKey,
    invalidatePostData: () => qc.invalidateQueries({ queryKey: qKey }),
  });
}
