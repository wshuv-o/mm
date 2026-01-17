import { ReactNode } from "react";
import GuardAction from "./GuardAction";
import { useMemberShip } from "@/hooks/useMemberShip";
import { ForminatorForm } from "./ForminatorForm";
import { useAuthManager } from "@/hooks/useAuthManager";
import { useMutation } from "@tanstack/react-query";
import { API } from "@/api/api";
import { EsignUnderVerification } from "./EsignUnderVerification";
type guardProps = {
  children: ReactNode;
};
export default function MemberShipGuard({ children }: guardProps) {
  const { comCtx, canAcces, actionConf, membership } = useMemberShip();
  const { activeUser ,invalidateUserData} = useAuthManager();

  const mutation = useMutation({
    mutationFn: (arg) => API.updateMembership(membership.publicId, arg),
    onSuccess: async() => {
      await comCtx.invaliDateRelatedQuery();
      await invalidateUserData();
    },
  });
  if (canAcces) return children;
  if (!actionConf) return null;

  if (actionConf.header == "e_sign_required") {
    return (
      <ForminatorForm
        email={activeUser.email}
        membershipId={membership.publicId}
        fullName={activeUser.fullName}
        communityId={comCtx.publicId}
        onSubmit={() => {
          mutation.mutate({ signingStatus: true });
        }}
      ></ForminatorForm>
    );
  } else if (actionConf.header == "under_review") {
    return <EsignUnderVerification></EsignUnderVerification>;
  } else {
    return <GuardAction actionConf={actionConf}></GuardAction>;
  }
}
