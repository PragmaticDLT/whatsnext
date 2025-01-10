"use client";

import WelcomeBanner from "./welcome-banner";
import MessagesBody from "../../components/messages/messages";
import { useChatsContext } from "../../contexts/chats-context";
import ModalBasic from "../../components/modals/modal-basic";
import { useState } from "react";
import useWindowSize from "react-use/lib/useWindowSize";
import Confetti from "react-confetti";

export default function Home() {
  const { width, height } = useWindowSize();
  const { chatSelected, clearChat } = useChatsContext();
  const [isOpen, setIsOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);


  return (
    <div className="pt-4 pb-2 w-full max-w-[80rem] mx-auto h-full">
      {chatSelected && <WelcomeBanner />}
      {chatSelected && (
        <div className="mx-4 w-full flex flex-end flex-row">
          <button
            className={`btn ${chatSelected.messages.lenght <= 1
                ? "bg-indigo-600"
                : "bg-indigo-500"
              } hover:bg-indigo-600 text-white`}
            disabled={chatSelected.messages.lenght <= 1}
            onClick={() => {
              setIsOpen(true)

            }}
          >
            Start from beginning
          </button>
        </div>
      )}
      {chatSelected && <MessagesBody setShowConfetti={setShowConfetti} />}
      {showConfetti && (
        <div className="fixed top-0 left-0 w-full h-full animate-fade-in-down animate-duration-3000 animate-delay-1000">
          <Confetti
            width={width}
            height={height}
            className="animate-fade-in-down animate-duration-1000"
          />
        </div>
      )}
      <ModalBasic
        title="Are you sure you want to start from the beginning?"
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <div className="flex flex-col m-4">
          <p>This action will delete the chat history and cannot be undone.</p>

          <div className="flex flex-row mt-4 flex-end gap-2">
            <button
              className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
              onClick={() => {
                clearChat();
                setIsOpen(false);
                localStorage.removeItem("firstPlay");
                localStorage.removeItem("breakPlay");
                localStorage.removeItem("endPlay");
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
