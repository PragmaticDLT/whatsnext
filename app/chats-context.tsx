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
    LocalChats && setChats(JSON.parse(LocalChats));
  }, []);

  const newChat = async () => {
    const res = await fetch(`/api/assistants/threads`, {
      method: "POST",
    });
    const data = await res.json();
    const newchat = {
      threadId: data.threadId,
      title: "Identifying Passions: What's Next?",
      messages: [{ role: "assistant", text: "Welcome!!!" }],
    };
    chats
      ? localStorage.setItem("chats", JSON.stringify([...chats, newchat]))
      : localStorage.setItem("chats", JSON.stringify([newchat]));
    chats ? setChats((chats) => [...chats, newchat]) : setChats([newchat]);
    setChatSelected(newchat);
  };

  const clearChat = async () => {
    setChatSelected((chatSelect) => ({
      ...chatSelect,
      messages: [{ role: "assistant", text: "Welcome!!!" }],
    }));
    const NewChats = chats.map((chatI) => {
      console.log(chatI);
      if (chatI.threadId === chatSelected?.threadId) {
        return {
          ...chatI,
          messages: [{ role: "assistant", text: "Welcome!!!" }],
        };
      } else {
        return chatI;
      }
    });
    setChats(NewChats);
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
