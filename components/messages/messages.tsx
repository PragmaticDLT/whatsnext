"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import BotMessage from "./bot-message";
import UserMessage from "./user-message";
import { generateId } from "ai";
import { AssistantStream } from "openai/lib/AssistantStream.mjs";
import { useChatsContext } from "../../app/chats-context";

export default function MessagesBody() {
  const {
    chats,
    setChats,
    chatSelected,
    assistantId,
    setAssistantId,
    currentQuestionNumber,
    setCurrentQuestionNumber,
    quotedTexts,
    setQuotedTexts,
    activeButtons,
    setActiveButtons,
  } = useChatsContext();
  const [messageInput, setMessageInput] = useState("");
  const [inputDisabled, setInputDisabled] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [threadId, setThreadId] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const InputRef = useRef<HTMLTextAreaElement>(null);
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

  const setFunctionalities = () => {
    if (chatSelected) {
      setMessages(chatSelected.messages);
      setThreadId(chatSelected.threadId);
      checkForLastQuestionNumber(
        chatSelected.messages[chatSelected.messages.length - 1].text
      );
      extractQuotedTexts(
        chatSelected.messages[chatSelected.messages.length - 1].text
      );
    }
  };

  useEffect(() => {
    setFunctionalities();
  }, [chatSelected]);

  useEffect(() => {
    const newActiveButtons = Object.keys(buttonOptions).filter((key) =>
      quotedTexts.includes(key.toLowerCase())
    );
    setActiveButtons(newActiveButtons);
  }, [quotedTexts]);

  const sendMessage = async (
    text: string,
    assistantIdPreview: string | null
  ) => {
    try {
      const response = await fetch(
        `/api/assistants/threads/${threadId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: text,
            assistant_id: assistantIdPreview || assistantId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const stream = AssistantStream.fromReadableStream(response.body);
      handleReadableStream(stream);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) => {
        // Remove the last assistant message
        const newMessages = prevMessages.slice(0, -1);
        // Add an error message
        return [
          ...newMessages,
          {
            role: "assistant",
            text: "An error occurred while processing your message. Please try again.",
          },
        ];
      });
      setInputDisabled(false);
    }
  };

  const handleSubmission = (question) => {
    setQuotedTexts([]);
    if (
      question === "Begin Step 2" ||
      question === "begin step 2" ||
      question === "Begin step 2"
    ) {
      sendMessage(
        question || messageInput,
        process.env.NEXT_PUBLIC_3_ASSISTANT_ID || ""
      );
      changeAssistant3();
    } else {
      sendMessage(question || messageInput, null);
    }
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: question || messageInput },
    ]);
    appendMessage("assistant", "");
    setMessageInput("");
    setInputDisabled(true);
  };

  useEffect(() => {
    if (messageInput.length <= 0) {
      adjustTextareaHeight();
    }
  }, [messageInput]);

  const handleReadableStream = (stream: AssistantStream) => {
    stream.on("textDelta", handleTextDelta);
    stream.on("event", (event) => {
      if (event.event === "thread.message.completed")
        handleMessageCompleted(event);
      if (event.event === "thread.run.completed") handleRunCompleted(event);
    });
  };

  const changeAssistant2 = () => {
    setCurrentQuestionNumber(15);
    setAssistantId(process.env.NEXT_PUBLIC_2_ASSISTANT_ID || "");
    localStorage.setItem("currentQuestionNumber", "15");
    localStorage.setItem(
      "assistantId",
      process.env.NEXT_PUBLIC_2_ASSISTANT_ID || ""
    );
  };

  const changeAssistant3 = () => {
    setAssistantId(process.env.NEXT_PUBLIC_3_ASSISTANT_ID || "");
    localStorage.setItem(
      "assistantId",
      process.env.NEXT_PUBLIC_3_ASSISTANT_ID || ""
    );
  };

  useEffect(() => {
    if (activeButtons.includes("begin step 2")) {
    }
  }, [activeButtons]);

  const handleMessageCompleted = async (event) => {
    setInputDisabled(false);

    currentQuestionNumber < 14
      ? checkForLastQuestionNumber(event.data.content[0].text.value)
      : currentQuestionNumber == 14
      ? changeAssistant2()
      : null;
    // Clear quoted texts for the next message
    extractQuotedTexts(event.data.content[0].text.value);
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

  const checkForLastQuestionNumber = (text: string) => {
    const matches = text.match(/Question (\d+):/g);
    if (matches) {
      const lastMatch = matches[matches.length - 1];
      const questionNumber = parseInt(lastMatch.match(/(\d+)/)[0], 10);
      setCurrentQuestionNumber(questionNumber);
      localStorage.setItem("currentQuestionNumber", questionNumber.toString());

      // Call changeAssistant2 if there are multiple matches
      if (matches.length > 1) {
        changeAssistant2();
      }
    }
  };

  const removeSpecialCharacters = (text: string) => {
    return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  };

  const extractQuotedTexts = (text: string) => {
    const regex = /"([^"]*)"/g;
    const matches = text.match(regex);
    if (matches) {
      const newQuotedTexts = matches.map((match) =>
        removeSpecialCharacters(match.slice(1, -1).toLowerCase())
      );
      setQuotedTexts((prevTexts) => [...prevTexts, ...newQuotedTexts]);
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

  const buttonOptions = {
    "ok next": "OK next",
    "start the questions": "Start the questions",
    "ok i'm ready": "OK I'm ready",
    "ok i’m ready": "OK I'm ready",
    next: "Next",
    done: "Done",
    "explore other options": "Explore other options",
    "looks good": "Looks Good",
    "begin step 2": "Begin Step 2",
    regenerate: "Regenerate",
  };

  const adjustTextareaHeight = () => {
    if (InputRef?.current) {
      InputRef.current.style.height = "auto";
      InputRef.current.style.height = `${InputRef.current.scrollHeight}px`;
    }
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
            {activeButtons.map((key) => (
              <button
                key={key}
                className="btn bg-slate-500 text-slate-100 hover:bg-slate-600"
                onClick={() => handleSubmission(buttonOptions[key])}
                disabled={inputDisabled}
              >
                {buttonOptions[key]}
              </button>
            ))}
            {((quotedTexts.includes("thought starter") &&
              messages.length > 4) ||
              (currentQuestionNumber <= 14 && currentQuestionNumber >= 1)) && (
              <button
                className="btn bg-slate-500 text-slate-100 hover:bg-slate-600"
                onClick={() => handleSubmission("Thought starter")}
                disabled={inputDisabled}
              >
                Thought starter
              </button>
            )}
          </div>
        )}
        {/*TESTING*/}
        {/* <div className="sticky top-0 bg-white dark:bg-slate-900 p-2 text-center">
          Current Question: {currentQuestionNumber}
        </div>
        <div className="sticky top-8 bg-white dark:bg-slate-900 p-2 text-center">
          Quoted Texts: {quotedTexts.join(", ")}
        </div>
        <div className="sticky top-0 bg-white dark:bg-slate-900 p-2 text-center">
          Current Bot: {assistantId}
        </div>
        <div className="flex flex-row gap-2">
          <button
            className="btn bg-slate-500 text-slate-100 hover:bg-slate-600"
            onClick={() =>
              setAssistantId(process.env.NEXT_PUBLIC_1_ASSISTANT_ID || "")
            }
          >
            bot 1
          </button>
          <button
            className="btn bg-slate-500 text-slate-100 hover:bg-slate-600"
            onClick={() =>
              setAssistantId(process.env.NEXT_PUBLIC_2_ASSISTANT_ID || "")
            }
          >
            bot 2
          </button>
          <button
            className="btn bg-slate-500 text-slate-100 hover:bg-slate-600"
            onClick={() =>
              setAssistantId(process.env.NEXT_PUBLIC_3_ASSISTANT_ID || "")
            }
          >
            bot 3
          </button>
        </div> */}

        <div className="flex min-h-16 items-center justify-between border-t border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900 sm:px-6 md:px-5 py-2">
          {/* Message input */}
          <div className="flex grow">
            <div className="mr-3 grow">
              <label htmlFor="message-input" className="sr-only">
                Type a message
              </label>
              <textarea
                id="message-input"
                className="form-textarea w-full bg-slate-100 dark:bg-slate-800 border-transparent dark:border-transparent focus:bg-white dark:focus:bg-slate-800 placeholder-slate-500 resize-none overflow-hidden"
                placeholder=" Ask something"
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  adjustTextareaHeight();
                }}
                disabled={inputDisabled}
                ref={InputRef}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    messageInput.trim() !== ""
                  ) {
                    event.preventDefault();
                    handleSubmission(messageInput);
                  }
                }}
                rows={1}
                style={{ minHeight: "2.5rem", maxHeight: "10rem" }}
              />
            </div>
            <div className="flex">
              <button
                onClick={() => {
                  handleSubmission(messageInput);
                  setMessageInput("");
                }}
                disabled={messageInput === "" || inputDisabled}
                type="submit"
                className="btn bg-indigo-500 hover:bg-indigo-600 text-white whitespace-nowrap h-10"
              >
                Send -&gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
