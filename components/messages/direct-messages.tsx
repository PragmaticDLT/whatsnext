"use client";
import { useChatsContext } from "../../app/chats-context";
import { useEffect, useState } from "react";

export default function DirectMessages() {
  const { chats } = useChatsContext();
  return (
    <div className="my-4">
      <ul className="mb-4">
        {chats &&
          chats?.map((chat) => <ChatItem chat={chat} key={chat.threadId} />)}
      </ul>
    </div>
  );
}

const ChatItem = ({ chat }) => {
  const { chats, setChatSelected, setChats } = useChatsContext();
  const [isInput, setIsInput] = useState(false);
  const [chatInput, setChatInput] = useState(chat.title);

  const saveMessage = () => {
    const NewChats = chats.map((chatI) => {
      if (chatI.threadId === chat.threadId) {
        return {
          ...chatI,
          title: chatInput,
        };
      } else {
        return chatI;
      }
    });
    localStorage.setItem("chats", JSON.stringify(NewChats));
    setChats(NewChats);
  };

  return (
    <li className="mb-1">
      <div className="flex items-center justify-between w-full p-1 rounded bg-indigo-500/30">
        {isInput ? (
          <div className="flex items-end flex-col gap-1">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="text-sm font-medium"
            />
            <button
              className="btn bg-indigo-500 hover:bg-indigo-600 text-white flex items-center ml-2"
              onClick={() => {
                setIsInput(false);
                saveMessage();
              }}
            >
              save
            </button>
          </div>
        ) : (
          <>
            <button
              className="text-sm font-medium text-slate-300"
              onClick={() => setChatSelected(chat)}
            >
              {chat.title}
            </button>
            <button
              className="flex items-center ml-2 text-slate-300"
              onClick={() => setIsInput(true)}
            >
              ...
            </button>
          </>
        )}
      </div>
    </li>
  );
};
