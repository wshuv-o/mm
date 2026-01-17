import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

class _Storage {
  async save(key: string, value: any) {
    value = typeof value == "string" ? value : JSON.stringify(value);
    Platform.OS === "web"
      ? localStorage.setItem(key, value)
      : await SecureStore.setItemAsync(key, value);
  }

  async retrive(key: string, defaultValue?: any) {
    const value =
      Platform.OS === "web"
        ? localStorage.getItem(key)
        : await SecureStore.getItemAsync(key);
    if (value === null) {
      return defaultValue;
    }
    try {
      return JSON.parse(value);
    } catch (_error) {
      return value;
    }
  }
  async remove(key: string) {
    Platform.OS === "web"
      ? localStorage.removeItem(key)
      : await SecureStore.deleteItemAsync(key);
  }
}

export const STORAGE = new _Storage();
