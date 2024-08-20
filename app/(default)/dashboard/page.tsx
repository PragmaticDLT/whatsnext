"use client";
import WelcomeBanner from "./welcome-banner";
import MessagesBody from "../../../components/messages/messages";
import { useChatsContext } from "../../chats-context";
import ModalBasic from "../../../components/modal-basic";
import { useState } from "react";

export default function Dashboard() {
  const { chatSelected, clearChat } = useChatsContext();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="py-8 w-full max-w-[80rem] mx-auto h-full">
      {chatSelected && <WelcomeBanner />}
      {chatSelected && (
        <div className="mx-4 w-full flex flex-end flex-row">
          <button
            className={`btn ${
              chatSelected.messages.lenght <= 1
                ? "bg-indigo-600"
                : "bg-indigo-500"
            } hover:bg-indigo-600 text-white`}
            disabled={chatSelected.messages.lenght <= 1}
            onClick={() => {
              setIsOpen(true);
            }}
          >
            Clear Chat
          </button>
        </div>
      )}
      {chatSelected && <MessagesBody />}
      <ModalBasic
        title="Are you sure you want to clear the chat?"
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <div className="flex flex-col m-4">
          <p>This action cannot be undone.</p>

          <div className="flex flex-row mt-4 flex-end gap-2">
            <button
              className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
              onClick={() => {
                clearChat();
                setIsOpen(false);
              }}
            >
              Yes
            </button>
            <button
              className="btn bg-slate-500 hover:bg-slate-600 text-white"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              No
            </button>
          </div>
        </div>
      </ModalBasic>
    </div>
  );
}
