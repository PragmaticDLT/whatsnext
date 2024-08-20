"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ChatsContextProps {
  chats: any;
  setChats: (chatsOpen: any) => void;
  chatSelected: any;
  setChatSelected: (chatsOpen: any) => void;
  newChat: any;
  clearChat: any;
}

const ChatsContext = createContext<ChatsContextProps | undefined>(undefined);

export const ChatsProvider = ({
  children,
  initialState = [],
}: {
  children: React.ReactNode;
  initialState?: boolean;
}) => {
  const [chats, setChats] = useState(initialState);
  const [chatSelected, setChatSelected] = useState();

  useEffect(() => {
    const LocalChats = localStorage.getItem("chats");
    LocalChats ? setChats(JSON.parse(LocalChats)) : newChat();
    LocalChats && setChatSelected(JSON.parse(LocalChats)[0]);
  }, []);

  const newChat = async () => {
    const res = await fetch(`/api/assistants/threads`, {
      method: "POST",
    });
    const data = await res.json();
    const newchat = {
      threadId: data.threadId,
      title: "What's Next life Coach",
      messages: [{ role: "assistant", text: "Welcome!!!" }],
    };
    localStorage.setItem("chats", JSON.stringify([newchat]));
    setChats([newchat]);
    setChatSelected(newchat);
  };

  const clearChat = async () => {
    const res = await fetch(`/api/assistants/threads`, {
      method: "POST",
    });
    const data = await res.json();
    const newchat = {
      threadId: data.threadId,
      title: chatSelected?.title || "What's Next life Coach",
      messages: [{ role: "assistant", text: "Welcome!!!" }],
    };
    localStorage.setItem("chats", JSON.stringify([newchat]));
    setChats([newchat]);
    setChatSelected(newchat);
  };

  return (
    <ChatsContext.Provider
      value={{
        chats,
        setChats,
        chatSelected,
        setChatSelected,
        newChat,
        clearChat,
      }}
    >
      {children}
    </ChatsContext.Provider>
  );
};

export const useChatsContext = () => {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error("useChats must be used within a ChatsProvider");
  }
  return context;
};
