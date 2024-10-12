"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ChatsContextProps {
  chats: any;
  setChats: (chatsOpen: any) => void;
  chatSelected: any;
  setChatSelected: (chatsOpen: any) => void;
  newChat: any;
  clearChat: any;
  assistantId: string;
  setAssistantId: (assistantId: string) => void;
  currentQuestionNumber: number;
  setCurrentQuestionNumber: (currentQuestionNumber: number) => void;
  quotedTexts: string[];
  setQuotedTexts: (quotedTexts: string[]) => void;
  activeButtons: string[];
  setActiveButtons: (activeButtons: string[]) => void;
  parsedJson: any;
  setParsedJson: (parsedJson: any) => void;
  inputDate: any;
  setInputDate: any;
  specialButtons: any;
  setSpecialButtons: any;
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

  const [assistantId, setAssistantId] = useState(
    process.env.NEXT_PUBLIC_1_ASSISTANT_ID || ""
  );
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [quotedTexts, setQuotedTexts] = useState<string[]>([]);
  const [activeButtons, setActiveButtons] = useState<string[]>([]);

  const [parsedJson, setParsedJson] = useState<any>(null);
  const [inputDate, setInputDate] = useState<any>({ active: false });
  const [specialButtons, setSpecialButtons] = useState<any>([]);

  useEffect(() => {
    const LocalChats = localStorage.getItem("chats");
    LocalChats ? setChats(JSON.parse(LocalChats)) : newChat();
    LocalChats && setChatSelected(JSON.parse(LocalChats)[0]);
    const currentQuestionNumber = localStorage.getItem("currentQuestionNumber");
    if (currentQuestionNumber) {
      setCurrentQuestionNumber(parseInt(currentQuestionNumber, 10));
    }
    setAssistantId(
      localStorage.getItem("assistantId") ||
        process.env.NEXT_PUBLIC_1_ASSISTANT_ID ||
        ""
    );
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
    setAssistantId(process.env.NEXT_PUBLIC_1_ASSISTANT_ID || "");
    setCurrentQuestionNumber(0);
    setQuotedTexts([]);
    setActiveButtons([]);
    localStorage.removeItem("currentQuestionNumber");
    localStorage.removeItem("assistantId");
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
        assistantId,
        setAssistantId,
        currentQuestionNumber,
        setCurrentQuestionNumber,
        quotedTexts,
        setQuotedTexts,
        activeButtons,
        setActiveButtons,
        parsedJson,
        setParsedJson,
        inputDate,
        setInputDate,
        specialButtons,
        setSpecialButtons,
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
