import {type Icon } from '@expo/vector-icons/build/createIconSet';
import createIconSetFromIcoMoon from '@expo/vector-icons/createIconSetFromIcoMoon';
import { IcoMoonNames } from './IcoMoonNames';
const CustomIcon = createIconSetFromIcoMoon(
  require("@/assets/icons/selection.json"),
  "IcoMoon",
  "@/assets/icons/icomoon.ttf"
);

export default CustomIcon as Icon<IcoMoonNames,'IcoMoon'>;
