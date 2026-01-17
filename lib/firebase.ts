// Import the functions you need from the SDKs you need
import { API } from "@/api/api";
import { router } from "expo-router";
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  MessagePayload,
} from "firebase/messaging";
import { Platform } from "react-native";
const FBASE_CONF = {
  apiKey: "AIzaSyDEIoB_4JTUrzhPNXYrVJkz3MK0PeUzeEs",
  authDomain: "tnw4-68046.firebaseapp.com",
  projectId: "tnw4-68046",
  storageBucket: "tnw4-68046.firebasestorage.app",
  messagingSenderId: "522504870988",
  appId: "1:522504870988:web:2150ce052ab45d20c668e9",
  measurementId: "G-VK339MRZB9",
};
const VAPID_KEY =
  "BJ0FCm5ZtR5pg5oPHO49DJ9asC7eaQh_Y2_JW3QeC4Wh8P0Qs1CndQUNsfeuhWYQbFZglVClx4GDZfkiqmpPc3c";

class _FirebaseSvc_ {
  #init = false;
  #bufferedMessages = new Set(); //handle late subscribers
  #listeners = new Map(); //we can also use set here.as it has deduplication inbuilt as well.but there seems to be an issue with duplicate listeners while doing so and i dont have time to debug
  get #shouldHandle() {
    return Platform.OS !== "web" || Notification.permission === "denied";
  }
  async requestWebPermission() {
    if (this.#shouldHandle) return;
    return Notification.requestPermission();
  }
  async syncToken() {
    if (this.#shouldHandle || this.#init) return;
    try {
      if (!navigator?.serviceWorker) {
        throw new Error("No service worker support");
      }
      // Initialize Firebase
      const app = initializeApp(FBASE_CONF);
      const messaging = getMessaging(app);

      if (Notification.permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
        });
        onMessage(messaging, (payload) => {
          if (this.#listeners.size == 0) {
            this.#bufferedMessages.add(payload);
          } else {
            this.#listeners.forEach((fn) => fn(payload));
          }
        });
        await API.saveFcmToken(token);
        this.#init = true;
      }
    } catch (error) {
      //don't let the app crash.but log the error for better debugging
      console.error(error);
    }
  }

  addMsgListener(key: string, fn: Parameters<typeof onMessage>[1]) {
    this.#bufferedMessages.forEach((v, _, set) => {
      fn(v);
      set.delete(v);
    });
    this.#listeners.set(key, fn);
    return () => {
      this.#listeners.delete(key);
    };
  }
  /** @param onClick - optional .return false to prevent url navigation.can be async*/
  showForegroundNotification(
    payload: MessagePayload,
    onClick?: (e: Event) => any
  ) {
    const { title, body } = payload.notification!;
    const notification = new Notification(title!, {
      body: body,
    });
    notification.onclick = async (event) => {
      const link = payload.fcmOptions?.link;
      if (link || onclick) {
        event.preventDefault();
        const shouldNavigate = (await onClick?.(event)) !== false;
        shouldNavigate && link && router.navigate(link);
      }
    };
  }
}
export const FirebaseSvc = new _FirebaseSvc_();
