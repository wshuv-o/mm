import { API } from "@/api/api";
import { AuthFormContainer } from "@/components/auth/AuthFormContainer";
import { BillingInfoForm } from "@/components/BillingInfoForm";
import GuardAction from "@/components/guards/GuardAction";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
import { useGuardConf } from "@/hooks/useGuardConf";
import { UTIL } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef } from "react";
import { Linking, Platform, ScrollView } from "react-native";

export default function Payment() {
  const { pkgId, proceed, response } = useLocalSearchParams();

  const { mutate, data: _mtnData } = useMutation({
    mutationFn: (args) => API.tryPayment({ proceed, ...args, pkgId }),
    onSuccess: (data) => {
      if (data.status === "pmt_checkout_redirect") {
        Platform.OS === "web"
          ? window.location.replace(data.url!)
          : Linking.openURL(data.url!);
      }
    },
  });

  const data = useMemo(
    () =>
      _mtnData
        ? _mtnData
        : response
        ? UTIL.decodeB64urlSafe(response, true)
        : null,
    [_mtnData, response]
  );
  const init = useRef(false);
  if (!init.current && !data) {
    mutate();
    init.current = true;
  }
  const conf = useGuardConf(data?.status, {
    pkg_not_repurchasable: {
      header:
        "You've already purchased this package. It can't be bought again.",
    },
    pmt_checkout_redirect: {
      header: "Redirecting to checkout.Click the pay button if not redirected",
      action: { fn: () => Linking.openURL(data!.url!), label: "Pay" },
    },
    trial_started: {
      header: "Congratulations — your free trial is now active!",
      action: { fn: () => router.navigate("/"), label: "go to home" },
    },
  });

  return !data ? (
    <FullPageLoader></FullPageLoader>
  ) : (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: "#000",
        minHeight: "100%",
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {(() => {
        if (data!.status == "no_billing_info" || data.status == "can_proceed")
          return (
            <AuthFormContainer title="Billing Information">
              <BillingInfoForm
                onSuccess={() => mutate({ proceed: true })}
                {...(data.status == "can_proceed" && {
                  existing: data!.billingInfo,
                })}
              ></BillingInfoForm>
            </AuthFormContainer>
          );
        return <GuardAction actionConf={conf.actionConf}></GuardAction>;
      })()}
    </ScrollView>
  );
}
