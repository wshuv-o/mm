import { ActivityIndicator, StyleProp, View, ViewStyle } from "react-native";


export function FullPageLoader({ styles }: { styles?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#141414",
        },
        styles,
      ]}
    >
      <ActivityIndicator size="large" color="#D22A38" />
    </View>
  );
}
