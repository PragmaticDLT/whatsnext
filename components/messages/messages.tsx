"use client";

import { useEffect, useRef, useState } from "react";
import BotMessage from "./bot-message";
import UserMessage from "./user-message";
import { generateId } from "ai";
import { AssistantStream } from "openai/lib/AssistantStream.mjs";
import { useChatsContext } from "../../app/chats-context";

export default function MessagesBody() {
  const { chats, setChats, chatSelected, setChatSelected } = useChatsContext();
  const [messageInput, setMessageInput] = useState("");
  const [inputDisabled, setInputDisabled] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [threadId, setThreadId] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    !chatSelected
      ? setMessages([
          {
            id: generateId(),
            status: "first.bot.message",
            text: "Welcome!!!",
            role: "assistant",
          },
        ])
      : setMessages(chatSelected.messages);
  }, [chatSelected]);

  useEffect(() => {
    chatSelected && setMessages(chatSelected.messages);
    chatSelected && setThreadId(chatSelected.threadId);
  }, [chatSelected]);

  const sendMessage = async (text) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: text,
        }),
      }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const handleSubmission = (question) => {
    sendMessage(question || messageInput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: question || messageInput },
    ]);
    appendMessage("assistant", "");
    setMessageInput("");
    setInputDisabled(true);
  };

  const handleReadableStream = (stream: AssistantStream) => {
    stream.on("textDelta", handleTextDelta);
    stream.on("event", (event) => {
      if (event.event === "thread.message.completed")
        handleMessageCompleted(event);
      if (event.event === "thread.run.completed") handleRunCompleted(event);
    });
  };

  const handleMessageCompleted = async (event) => {
    setInputDisabled(false);
  };
  const handleRunCompleted = async (event) => {
    setInputDisabled(false);
  };

  // textDelta - append text to last assistant message
  const handleTextDelta = (delta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    }
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  useEffect(() => {
    const NewChats = chats.map((chatI) => {
      if (chatI.threadId === threadId) {
        return {
          ...chatI,
          messages: messages,
        };
      } else {
        return chatI;
      }
    });
    localStorage.setItem("chats", JSON.stringify(NewChats));
    setChats(NewChats);
  }, [messages]);

  /*
    =======================
    === Utility Helpers ===
    =======================
  */

  const appendToLastMessage = (text) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role, text) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const annotateLastMessage = (annotations) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation) => {
        if (annotation.type === "file_path") {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      });
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  return (
    <div className="flex h-full grow flex-col transition-transform duration-300 ease-in-out md:translate-x-0 w-full">
      <div className="h-full grow px-4 py-6 sm:px-6 md:px-5">
        {/* Chat msg */}
        {messages.map((message, index: number) => {
          if (message?.role === "user") {
            return <UserMessage key={message.id} text={message?.text} />;
          } else {
            return (
              <BotMessage
                key={message.id}
                text={message.text}
                activeQuestions={index === 0}
                handleSendMessage={handleSubmission}
              />
            );
          }
        })}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>
      <div className="sticky bottom-0 w-full">
        {messages.length > 2 && (
          <div className="flex flex-wrap gap-2 py-2 px-4 bg-transparent">
            {["Ok next", "Start the questions", "Thought starter"].map(
              (option, index) => (
                <button
                  key={index}
                  className="btn bg-slate-500 text-slate-100  hover:bg-slate-600"
                  onClick={() => handleSubmission(option)}
                  disabled={inputDisabled}
                >
                  {option}
                </button>
              )
            )}
          </div>
        )}

        <div className="flex h-16 items-center justify-between border-t border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900 sm:px-6 md:px-5">
          {/* Message input */}
          <div className="flex grow">
            <div className="mr-3 grow">
              <label htmlFor="message-input" className="sr-only">
                Type a message
              </label>
              <input
                id="message-input"
                className="form-input w-full bg-slate-100 dark:bg-slate-800 border-transparent dark:border-transparent focus:bg-white dark:focus:bg-slate-800 placeholder-slate-500"
                type="text"
                placeholder=" Ask something"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                disabled={inputDisabled}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && messageInput !== "") {
                    handleSubmission(messageInput);
                  }
                }}
              />
            </div>
            <button
              onClick={() => {
                handleSubmission(messageInput);
                setMessageInput("");
              }}
              disabled={messageInput === "" || inputDisabled}
              type="submit"
              className="btn bg-indigo-500 hover:bg-indigo-600 text-white whitespace-nowrap"
            >
              Send -&gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
