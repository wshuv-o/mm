import { singleUserDetailed } from "@/api/types";
import { StyleSheet, Text, View } from "react-native";
import { moderateScale } from "react-native-size-matters";
export function DetailSect({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <View
      style={[
        detailSectStyles.outerSpacing,
        {
          gap: 15,
          borderWidth: 1,
          borderRadius: moderateScale(8),
          borderColor: "#2A2A2A",
          backgroundColor: "#1A1A1A",
          padding: moderateScale(8),
        },
      ]}
    >
      <Text
        style={{
          fontSize: moderateScale(18),
          fontWeight: "500",
          fontFamily: "poppins",
          color: "#FAFAFB",
          
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}
export const detailSectStyles = StyleSheet.create({
  outerSpacing: {
    marginHorizontal: 20,
    marginVertical: 10,
    
  },
});
