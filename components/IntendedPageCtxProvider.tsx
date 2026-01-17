import { IntendedPageCtx, SnackBarFeedbackCtx } from "@/contexts/ctx";
import { UTIL } from "@/lib/utils";
import {
  Href,
  useGlobalSearchParams,
  useLocalSearchParams,
  usePathname,
} from "expo-router";
import React, { ReactNode, useRef } from "react";
import { Portal } from "react-native-paper";
import { entries, isDefined } from "remeda";

export function IntendedPageCtxProvider({ children }: { children: ReactNode }) {
  const { payment } = useGlobalSearchParams();
  //these two will capture  the intendent route of visitor.just an ephemeral cache
  const explicitRedirectTarget = useRef<Href>();
  const intentData = useRef();
  const currentPath = usePathname();
  if (!isDefined(explicitRedirectTarget.current)) {
    explicitRedirectTarget.current = currentPath;
  }

  return (
    <IntendedPageCtx.Provider
      value={{
        redirectUrl(_default, deleteOnRead = true) {
          const url = explicitRedirectTarget.current || _default;
          if (deleteOnRead) explicitRedirectTarget.current = null;
          return url;
        },
        geIntendData(deleteOnRead = false) {
          const d = intentData.current;
          if (deleteOnRead) intentData.current = undefined;
          return isDefined(d) ? d : {};
        },
        modifyData(fn) {
          fn(explicitRedirectTarget, intentData);
        },
      }}
    >
      {children}
    </IntendedPageCtx.Provider>
  );
}
