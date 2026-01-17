import { API } from "@/api/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";

export function useCommunitiesQuery() {
  const comListQKey = ["communities", "communities_for_drawer"];
  const query = useQuery({
    queryKey: comListQKey,
    queryFn: API.getCommunities,
  });
  const qClient = useQueryClient();
  return {
    ...query,
    comListQKey,
    invaliDateRelatedQuery: () => qClient.invalidateQueries({ queryKey: comListQKey }),
  };
}
