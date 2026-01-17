import { API } from "@/api/api";
import CommunityEditor from "@/components/admin/CommunityEditor";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Text } from "react-native";
//FIXME - missing
export default function EditCommuniity() {
  const { communityId } = useLocalSearchParams();
  const { data } = useQuery({
    queryKey: ["communities", "detail", communityId],
    queryFn: () => API.getCommunityDetail(communityId!),
  });
  return !data ? (
    <FullPageLoader></FullPageLoader>
  ) : (
    <CommunityEditor com={data}></CommunityEditor>
  );
}
