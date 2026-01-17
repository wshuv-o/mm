import { useMemo } from "react";
import { useWindowDimensions } from "react-native";
export function useWindowQuery(mobileThreshold?: number) {
  const { width, height } = useWindowDimensions();
  return useMemo(() => {
    const isMobile = width < (mobileThreshold ?? 1068);
    return {
      isMobile,
      isDesktop: !isMobile,
      width,
      height,
    };
  }, [width, height]);
}
