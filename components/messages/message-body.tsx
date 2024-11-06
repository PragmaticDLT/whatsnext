import { useChatsContext } from "../../contexts/chats-context";
import BotMessage from "./bot-message";
import FormDate from "./form-date";
import TableButtons from "./table-buttons";
import renderTableButtons from "./table-buttons";
import UserMessage from "./user-message";

export const MessageBody = ({
  messages,
  messagesEndRef,
  handleSubmission,
  setMessageInput,
  handleRefreshQuestion,
}: {
  messages: any[];
  messagesEndRef: any;
  handleSubmission: any;
  setMessageInput: any;
  handleRefreshQuestion: any;
}) => {
  const { parsedJson, inputDate, specialButtons } = useChatsContext();
  
  return (
    <div className="h-full grow px-4 py-6 sm:px-6 md:px-5">
      {/* Chat msg */}
      {messages.map((message, index: number) => {
        if (message?.role === "user") {
          return (
            <UserMessage
              key={index}
              text={message?.text}
              last={messages.length - 2 == index}
              handleRefreshQuestion={handleRefreshQuestion}
            />
          );
        } else {
          return (
            <div key={index}>
              <BotMessage
                text={message.text}
                activeQuestions={index === 0}
                handleSendMessage={handleSubmission}
              />
              {parsedJson && message.text?.startsWith("```json") && (
                <TableButtons parsedJson={parsedJson} />
              )}
              {inputDate.active &&
                message.text?.includes(
                  "now going to create a recurring calendar invite in your Apple, Google or Outlook calendar."
                ) && (
                  <FormDate
                    setMessageInput={setMessageInput}
                    handleSubmission={handleSubmission}
                  />
                )}
              {specialButtons.length > 0 &&
                message.text?.includes(
                  "Congrats on making it this far! We've analyzed your answers"
                ) &&
                specialButtons.map((key) => (
                  <button
                    key={key}
                    className="btn bg-slate-500 text-slate-100 hover:bg-slate-600 mr-2"
                    onClick={() => handleSubmission(key)}
                  >
                    {key}
                  </button>
                ))}
            </div>
          );
        }
      })}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
};
