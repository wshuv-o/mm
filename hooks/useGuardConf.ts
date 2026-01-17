import { AccessHint } from "@/api/types";
import { router } from "expo-router";
import { useMemo } from "react";
export type GuardActionConf<T = string> = {
  header: T | (string & {}); //a hack to improve intellisense
  action?: { fn: () => any; label: string };
};

type confObj<T> = Partial<Record<T, GuardActionConf<T>>>;
export function useGuardConf<T>(
  accessStatus: T,
  extraConf: confObj<T>,
  autoRedirectToPkgLinkFor?: string
) {
  const getConf = (status: T): GuardActionConf<NonNullable<T>> => {
    const _conf: confObj<AccessHint<T>[string]["status"]> = {
      pmt_under_review: { header: "Payment is under review" },
      pmt_failed: { header: "Payment failed.Please contact support" },
      pmt_rejected: { header: "Payment rejected.Please contact support" },
      pmt_processing: { header: "Payment is being processed" },
      ...extraConf,
    };
    //@ts-expect-error
    if (status in _conf) return _conf[status];
    if (autoRedirectToPkgLinkFor && (status as string).startsWith("pmt_")) {
      //FIXME - not sure whether redirecting from here is a good idea.but it works without any issue
      router.navigate(`/payment/${autoRedirectToPkgLinkFor}`);
      return { header: "" };
    }
    //@ts-expect-error
    return { header: status };
  };
  const computedRes = useMemo(() => {
    return {
      canAcces: accessStatus === true,
      actionConf: getConf(accessStatus),
    };
  }, [accessStatus, extraConf]);
  return { ...computedRes };
}
