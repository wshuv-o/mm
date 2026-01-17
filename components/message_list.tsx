import { useAuthManager } from "@/hooks/useAuthManager";
import { useState, useMemo } from "react";
import { View } from "react-native";

interface MessageListProps {
  handleBack: () => void;
  isMobile: boolean;
  peer: any; // Replace 'any' with the actual type for peer
  disableMessaging: boolean;
}

interface Message {
  content: Array<{ text: string }>;
}

export function MessageList({ handleBack, isMobile, peer, disableMessaging }: MessageListProps) {
  const { activeUser } = useAuthManager();
  const isAdmin = activeUser && (activeUser as any).role === "admin"; // Adjust this check to your actual user model

  // Only show and use search if admin
  const [searchQuery, setSearchQuery] = useState("");
  const data: Message[] = []; // Replace this with actual data fetching logic

  const filteredMessages = useMemo(() => {
    if (!data) return [];
    if (!isAdmin || !searchQuery.trim()) return data;
    return data.filter((msg: Message) =>
      msg.content.some((content) =>
        content.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery, isAdmin]);

  return (
    <View>
      {/* Only show search box for admin */}
      {isAdmin && (
        <View>
          {/* ... search box code ... */}
        </View>
      )}
      {/* ... rest of the component, use filteredMessages for rendering */}
    </View>
  );
} 