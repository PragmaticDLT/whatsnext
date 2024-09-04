"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import BotMessage from "./bot-message";
import UserMessage from "./user-message";
import { generateId } from "ai";
import { AssistantStream } from "openai/lib/AssistantStream.mjs";
import { useChatsContext } from "../../app/chats-context";
import {
  parseISO,
  addWeeks,
  setHours,
  setMinutes,
  format,
  addMinutes,
  parse,
} from "date-fns";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
import { marked } from "marked";

export default function MessagesBody({
  setShowConfetti,
}: {
  setShowConfetti: (show: boolean) => void;
}) {
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
  const [showDownloadPDF, setShowDownloadPDF] = useState(false);

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

  useEffect(() => {
    if (currentQuestionNumber === 15) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }
  }, [currentQuestionNumber]);

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
      if (event.event === "thread.run.failed") {
        console.log(event);
        if (event.data.last_error.code === "rate_limit_exceeded") {
          setMessages((prevMessages) => {
            // Remove the last assistant message
            const newMessages = prevMessages.slice(0, -1);
            // Add an error message
            return [
              ...newMessages,
              {
                role: "assistant",
                text: "Wow, you type really fast! Please take a minute and try again later.",
              },
            ];
          });
        } else {
          setMessages((prevMessages) => {
            // Remove the last assistant message
            const newMessages = prevMessages.slice(0, -1);
            // Add an error message
            return [
              ...newMessages,
              {
                role: "assistant",
                text: "An error occurred while processing your message. Please try again later.",
              },
            ];
          });
        }

        setInputDisabled(false);
      }
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

    const messageText = event.data.content[0].text.value;

    if (
      messageText.includes(
        "Here's where you'll finalize your What's Next intention in the chosen life area that you've decided on."
      )
    ) {
      setShowDownloadPDF(true);
    }

    currentQuestionNumber < 14
      ? checkForLastQuestionNumber(messageText)
      : currentQuestionNumber == 14
      ? changeAssistant2()
      : null;

    extractQuotedTexts(messageText);
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
    "ok i'm ready": "OK I'm ready",
    next: "Next",
    done: "Done",
    "explore other options": "Explore other options",
    "looks good": "Looks Good",
    "begin step 2": "Begin Step 2",
    regenerate: "Regenerate",
    "complete & continue": "Complete & Continue",
  };

  const adjustTextareaHeight = () => {
    if (InputRef?.current) {
      InputRef.current.style.height = "auto";
      InputRef.current.style.height = `${InputRef.current.scrollHeight}px`;
    }
  };

  const createGoogleCalendarEvent = (
    activity: string,
    weekOffset: number,
    dayOfWeek: number,
    dayName: string,
    time: string
  ) => {
    const startDate = addWeeks(new Date(), weekOffset);
    const [hour, period] = time.match(/(\d{1,2})(am|pm)/)?.slice(1) || [];
    const eventHour =
      parseInt(hour) +
      (period.toLowerCase() === "pm" && hour !== "12" ? 12 : 0);
    const eventDate = setHours(setMinutes(startDate, 0), eventHour);
    const formattedDate = format(eventDate, "yyyyMMdd'T'HHmmss'Z'");
    const endDate = format(addMinutes(eventDate, 30), "yyyyMMdd'T'HHmmss'Z'");
    const url = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(
      activity
    )}&dates=${formattedDate}/${endDate}`;
    window.open(url, "_blank");
  };

  const renderTableButtons = (message: string) => {
    const tableRegex = /\|\s*Week\s*\|.*?\|/;
    const tableMatch = message.match(tableRegex);
    if (!tableMatch) return null;

    const tableStartIndex = message.indexOf(tableMatch[0]);
    const tableEndIndex = message.indexOf("\n\n", tableStartIndex);
    const tableContent = message.slice(
      tableStartIndex,
      tableEndIndex > -1 ? tableEndIndex : undefined
    );

    const rows = tableContent.split("\n").slice(2); // Skip header rows

    const dayRegex =
      /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*\((\d{1,2}(?:am|pm))\)/g;
    const headerMatch = tableContent.match(dayRegex);

    if (!headerMatch) return null;

    const days = headerMatch.map((day) => {
      const [, dayName, time] = day.match(/(.*?)\s*\((.*?)\)/) || [];
      return { dayName, time };
    });

    return (
      <div className="grid grid-cols-3 gap-2 mt-4">
        {rows.map((row, weekIndex) => {
          const cells = row.split("|").slice(2, -1); // Skip week number and last empty cell
          return cells.map((cell, dayIndex) => {
            if (dayIndex >= days.length) return null;
            const { dayName, time } = days[dayIndex];
            return (
              <button
                key={`${weekIndex}-${dayIndex}`}
                className="btn bg-indigo-500 text-white hover:bg-indigo-600 text-sm p-2"
                onClick={() =>
                  createGoogleCalendarEvent(
                    cell.trim(),
                    weekIndex + 1,
                    dayIndex + 1,
                    dayName,
                    time
                  )
                }
              >
                Schedule: Week {weekIndex + 1}, {dayName} ({time})
              </button>
            );
          });
        })}
      </div>
    );
  };

  const downloadPDF = (text: string) => {
    const doc = new jsPDF();
    const html = marked(text);

    doc.setFontSize(12);

    doc.html(html, {
      callback: function (doc) {
        doc.save("whats_next_intention.pdf");
      },
      x: 10,
      y: 10,
      html2canvas: {
        scale: 0.3,
      },
      autoPaging: "text",
      width: 100,
      windowWidth: 600,
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
              <div key={message.id}>
                <BotMessage
                  text={message.text}
                  activeQuestions={index === 0}
                  handleSendMessage={handleSubmission}
                  downloadPDF={downloadPDF}
                />
                {renderTableButtons(message.text)}
              </div>
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
        {showDownloadPDF && (
          <button
            className="btn bg-green-500 text-white hover:bg-green-600"
            onClick={() =>
              downloadPDF(
                "Here's where you'll finalize your What's Next intention in the chosen life area that you've decided on."
              )
            }
          >
            Download PDF
          </button>
        )}
        <div className="flex min-h-16 items-center justify-between border-t border-slate-200 bg-white px-4 dark:border-slate-700 dark:bg-slate-900 sm:px-6 md:px-5 py-2">
          {/* Message input */}
          <div className="flex grow">
            <div className="mr-3 grow">
              <label htmlFor="message-input" className="sr-only">
                Type a message
              </label>
              <textarea
                id="message-input"
                className="form-textarea w-full bg-slate-100 dark:bg-slate-800 border-transparent dark:border-transparent focus:bg-white dark:focus:bg-slate-800 placeholder-slate-500 resize-none overflow-y-auto scrollbar-hide"
                placeholder=" Ask something"
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  adjustTextareaHeight();
                }}
                disabled={inputDisabled}
                ref={InputRef}
                rows={1}
                style={{ minHeight: "2.5rem", maxHeight: "10rem" }}
              />
            </div>
            <div className="flex">
              <button
                onClick={() => {
                  handleSubmission(messageInput);
                  setMessageInput("");
                  console.log("messageInput", messageInput);
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
