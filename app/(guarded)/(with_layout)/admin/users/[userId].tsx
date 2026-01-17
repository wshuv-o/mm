import { API } from "@/api/api";
import { CommunityAccessList } from "@/components/admin/CommunityAccessList";
import { DetailSect } from "@/components/admin/DetailSect";
import { EnrollmentList } from "@/components/admin/EnrollmentList";
import UserDataViewer from "@/components/admin/UserDataViewer";
import {
  UserRolesEditor,
} from "@/components/admin/UserRolesEditor";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { ScrollView } from "react-native-gesture-handler";
import { map, omit } from "remeda";

export default function singleUser() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  
  const qk = ["users"];
  const { data: __origData } = useQuery({
    queryKey: qk,
    queryFn: API.getUsers, //rn paper counts page from 0
  });
  //client side filtering
  const { data, invalidator } = useMemo(() => {
    const data = __origData?.find((u) => u.publicId == userId);
    return {
      data,
      invalidator: () => queryClient.invalidateQueries({ queryKey: qk }),
    };
  }, [__origData]);
  const queryClient = useQueryClient();

  const communityAccess = useMemo(
    () =>
      !data
        ? []
        : [
            ...data.managedCommunities,
            ...map(data.memberships, (v) => ({
              membership: omit(v, ["community"]),
              ...v.community,
            })),
          ],
    [data]
  );
  return !data ? (
    <FullPageLoader></FullPageLoader>
  ) : (
    <ScrollView style={{ backgroundColor: "#141414" }}>
      <DetailSect title="Profile">
        <UserDataViewer
          avatarUrl={data.avatar.url}
          data={[
            { label: "name", value: data.userName },
            { label: "email", value: data.email },
            {
              label: "roles",
              value: (
                <UserRolesEditor
                  invaliDator={invalidator}
                  uId={userId}
                  roles={data.rolesPlain}
                />
              ),
            },
          ]}
        ></UserDataViewer>
      </DetailSect>
   

      <DetailSect title="Enrollments">
        <EnrollmentList
          data={data.enrollments}
          invalidator={invalidator}
        ></EnrollmentList>
      </DetailSect>

      <DetailSect title="Community access">
        <CommunityAccessList
          data={communityAccess}
          invalidator={invalidator}
        ></CommunityAccessList>
      </DetailSect>
    </ScrollView>
  );
}

