"use client";
import WelcomeBanner from "./welcome-banner";
import MessagesBody from "../../../components/messages/messages";
import { useChatsContext } from "../../chats-context";

export default function Dashboard() {
  const { chatSelected, clearChat } = useChatsContext();
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-[96rem] mx-auto h-full">
      {chatSelected && <WelcomeBanner />}
      {chatSelected && (
        <div className="w-full flex flex-end flex-row">
          <button
            className={`btn ${
              chatSelected.messages.lenght <= 1
                ? "bg-indigo-600"
                : "bg-indigo-500"
            } hover:bg-indigo-600 text-white`}
            disabled={chatSelected.messages.lenght <= 1}
            onClick={() => {
              clearChat();
            }}
          >
            Clear Chat
          </button>
        </div>
      )}
      {chatSelected && <MessagesBody />}
    </div>
  );
}
