import {
  StyleProp,
  TouchableOpacity,
  TouchableWithoutFeedbackProps,
} from "react-native";
import { moderateScale, ViewStyle } from "react-native-size-matters";
interface RoundCheckboxProps {
  checked: boolean;
  onPress: () => void;
  color: string;
  style?: TouchableWithoutFeedbackProps["style"];
}

const RoundCheckbox: React.FC<RoundCheckboxProps> = ({
  checked,
  onPress,
  color,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          width: moderateScale(18),
          height: moderateScale(18),
          borderRadius: moderateScale(4),
          borderWidth: moderateScale(1),
          marginHorizontal: moderateScale(9),
        },
        {
          backgroundColor: checked ? color : "#252525",
          borderColor: checked ? color : "#7A7A7A",
        },
        style,
      ]}
    />
  );
};

export default RoundCheckbox;
