import { useEffect } from "react";
import { buttonOptions } from "../../constants/buttonOptions";
import { useChatsContext } from "../../contexts/chats-context";

export const MessageInput = ({
  messageInput,
  setMessageInput,
  handleSubmission,
  inputDisabled,
  InputRef,
  messages,
  quotedTexts,
  currentQuestionNumber,
}: {
  messageInput: string;
  setMessageInput: (messageInput: string) => void;
  handleSubmission: (messageInput: string) => void;
  inputDisabled: boolean;
  InputRef: React.RefObject<HTMLTextAreaElement>;
  messages: any[];
  quotedTexts: any[];
  currentQuestionNumber: number;
}) => {
  const { activeButtons } = useChatsContext();

  const adjustTextareaHeight = () => {
    if (InputRef?.current) {
      InputRef.current.style.height = "auto";
      InputRef.current.style.height = `${InputRef.current.scrollHeight}px`;
    }
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

  useEffect(() => {
    if (messageInput.length <= 0) {
      adjustTextareaHeight();
    }
  }, [messageInput]);

  return (
    <div className="sticky bottom-0 w-full">
      {messages.length > 2 && (
        <div className="flex flex-wrap gap-2 py-2 px-4 bg-transparent">
          {activeButtons.map((key) => (
            <button
              key={key}
              className="btn bg-slate-500 text-slate-100 hover:bg-slate-600"
              onClick={() =>
                handleSubmission(
                  buttonOptions[key as keyof typeof buttonOptions]
                )
              }
              disabled={inputDisabled}
            >
              {buttonOptions[key as keyof typeof buttonOptions]}
            </button>
          ))}
          {((quotedTexts.includes("thought starter") && messages.length > 4) ||
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
              placeholder="Ask something"
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
  );
};
