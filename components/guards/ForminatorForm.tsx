"use dom";

import { useEffect, useState } from "react";
import { View } from "react-native";
import { FullPageLoader } from "../shared/FullPageLoader";

export function ForminatorForm({ membershipId, email, onSubmit, fullName,communityId }: any) {
  const [height, setHeight] = useState(0);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const msgHandler = (event: MessageEvent) => {
      switch (event.data.type) {
        case "fmtr_resize":
          setHeight(event.data.height);
          break;
        case "fmtr_submitted":
          onSubmit();
          break;
        case "fmtr_frm_loaded":
          setLoaded(true);
        default:
          break;
      }
    };
    window.addEventListener("message", msgHandler);
    () => window.removeEventListener("message", msgHandler);
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: "#141414" }}>
      <iframe
        src={`https://wordpress-1256868-4514271.cloudwaysapps.com/1263_ceos_frm?membershipId=${membershipId}&email=${encodeURIComponent(
          email
        )}&fullName=${encodeURIComponent(fullName)}&communityId=${communityId}`}
        style={{
          border: 0,
          height,
          width: "100%",
          ...(!loaded && { display: "none" }),
        }}
      ></iframe>
      {!loaded && <FullPageLoader />}
    </View>
  );
}
