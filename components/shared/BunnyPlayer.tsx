"use dom";

import { useEffect } from "react";
import { Image, View } from "react-native";
export function BunnyPlayer({
  url,
  availableWidth,
  onLoad,
  loaded,
  isStandalonePage,
}) {
  const size = { height: availableWidth * 0.56, width: "100%" };
  return url ? (
    <iframe
      onLoad={onLoad}
      src={url}
      key={url}
      loading="lazy"
      style={{
        border: 0,
        ...size,
        ...(!loaded && { height: 0 }),
        ...(isStandalonePage && { width: "95%", padding: "2.5%" }),
      }}
      allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
      allowFullScreen={true}
    ></iframe>
  ) : (
    <Image
      source={require("@/assets/images/novid.png")}
      style={[
        {
          transform: [{ scale: 0.5 }],
        },
        size,
      ]}
      resizeMode="contain"
    />
  );
}
