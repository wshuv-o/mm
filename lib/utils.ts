import { isPlainObject, isString } from "remeda";
import { format } from "date-fns";

class _Util {
  truncateTxt(
    txt: string,
    maxCharConf: number | { width: number; fontSize: number }
  ) {
    let maxChar: number;
    if (isPlainObject(maxCharConf)) {
      // Estimate how many characters can fit in the given width
      const avgCharWidth = maxCharConf.fontSize * 0.65;
      maxChar = Math.floor(maxCharConf.width / avgCharWidth);
    } else {
      maxChar = maxCharConf;
    }
    return txt.slice(0, maxChar) + (txt.length > maxChar ? "..." : "");
  }
   vwToPx(vw:string) {
    // Extract numeric value, e.g. 8 from "8vw"
    const vwValue = parseFloat(vw);
    // Get viewport width in pixels
    const viewportWidth = window.innerWidth;
    // Calculate pixels
    return (viewportWidth * vwValue) / 100;
  }
  clamp(num: number, min: number, max: number) {
    return Math.min(Math.max(num, min), max);
  }

  formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  }

  formatMessageDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const messageDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    if (messageDate.getTime() === today.getTime()) {
      return `Today, ${format(date, "hh:mm a")}`;
    } else if (messageDate.getTime() === yesterday.getTime()) {
      return `Yesterday, ${format(date, "hh:mm a")}`;
    } else {
      return format(date, "dd MMM yy, hh:mm a");
    }
  }
  encodeB64urlSafe(str: any) {
    const base64 = btoa(isString(str) ? str : JSON.stringify(str));
    return encodeURIComponent(base64);
  }
  decodeB64urlSafe(str: string, jsonDecode = false) {
    const base64 = decodeURIComponent(str);
    return jsonDecode ? JSON.parse(atob(base64)) : atob(base64);
  }
}

export const UTIL = new _Util();
