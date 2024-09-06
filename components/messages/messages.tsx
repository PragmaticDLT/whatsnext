"use client";

import { useEffect, useRef, useState, useMemo, Fragment } from "react";
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
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import html2pdf from "html2pdf.js";
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

  const createCalendarEvent = (
    activity: string,
    weekOffset: number,
    dayOfWeek: number,
    dayName: string,
    time: string,
    calendarType: "google" | "ical" | "outlook"
  ) => {
    const startDate = addWeeks(new Date(), weekOffset);
    const [hour, period] = time.match(/(\d{1,2})(am|pm)/)?.slice(1) || [];
    const eventHour =
      parseInt(hour) +
      (period.toLowerCase() === "pm" && hour !== "12" ? 12 : 0);
    const eventDate = setHours(setMinutes(startDate, 0), eventHour);
    const formattedDate = format(eventDate, "yyyyMMdd'T'HHmmss'Z'");
    const endDate = format(addMinutes(eventDate, 30), "yyyyMMdd'T'HHmmss'Z'");

    const googleUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(
      activity
    )}&dates=${formattedDate}/${endDate}`;

    const icsUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${encodeURIComponent(activity)}
DTSTART:${formattedDate}
DTEND:${endDate}
END:VEVENT
END:VCALENDAR`;

    const outlookUrl = `https://outlook.live.com/owa/?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(
      activity
    )}&startdt=${formattedDate}&enddt=${endDate}`;

    switch (calendarType) {
      case "google":
        window.open(googleUrl, "_blank");
        break;
      case "ical":
        window.open(icsUrl);
        break;
      case "outlook":
        window.open(outlookUrl, "_blank");
        break;
    }
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
              <Menu
                as="div"
                key={`${weekIndex}-${dayIndex}`}
                className="relative inline-block text-left"
              >
                <div>
                  <Menu.Button className="btn bg-indigo-500 text-white hover:bg-indigo-600 text-sm p-2 inline-flex w-full justify-center gap-x-1.5 rounded-md">
                    Schedule: Week {weekIndex + 1}, {dayName} ({time})
                    <ChevronDownIcon
                      className="-mr-1 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>

                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() =>
                              createCalendarEvent(
                                cell.trim(),
                                weekIndex + 1,
                                dayIndex + 1,
                                dayName,
                                time,
                                "google"
                              )
                            }
                            className={`${
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700"
                            } block px-4 py-2 text-sm w-full text-left`}
                          >
                            Google Calendar
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() =>
                              createCalendarEvent(
                                cell.trim(),
                                weekIndex + 1,
                                dayIndex + 1,
                                dayName,
                                time,
                                "ical"
                              )
                            }
                            className={`${
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700"
                            } block px-4 py-2 text-sm w-full text-left`}
                          >
                            iCal
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() =>
                              createCalendarEvent(
                                cell.trim(),
                                weekIndex + 1,
                                dayIndex + 1,
                                dayName,
                                time,
                                "outlook"
                              )
                            }
                            className={`${
                              active
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-700"
                            } block px-4 py-2 text-sm w-full text-left`}
                          >
                            Outlook
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            );
          });
        })}
      </div>
    );
  };

  const downloadPDF = (text?: string) => {
    // Remove the specified phrase and extract the relevant content
    const cleanedText = text
      ?.replace(
        "Please review this. If it resonates with you, confirm by saying 'Looks good'. If it requires adjustments, specify what needs changing, or ask for a regeneration by saying 'Regenerate'.",
        ""
      )
      .trim();

    // Convert Markdown to HTML
    const contentHtml = marked.parse(cleanedText || "");

    // Create HTML content
    const htmlContent = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Monorama', sans-serif;
              margin: 0;
              padding: 0;
            }
            .header {
              background-color: #4F46E5;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 24px;
            }
            .content {
              padding: 20px;
              font-size: 16px;
              line-height: 3;
            }
            .footer {
              position: fixed;
              bottom: 0;
              width: 100%;
              padding: 10px;
              text-align: center;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">What's Next Intention</div>
          <div class="content">${contentHtml}</div>
        </body>
      </html>
    `;

    // Configure PDF options
    const opt = {
      margin: 10,
      filename: "whats_next_intention.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    // Generate PDF
    html2pdf().from(htmlContent).set(opt).save();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (messageInput !== "" && !inputDisabled) {
        handleSubmission(messageInput);
        setMessageInput("");
      }
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
                onKeyDown={handleKeyDown}
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
