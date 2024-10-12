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
}: {
  messages: any[];
  messagesEndRef: any;
  handleSubmission: any;
  setMessageInput: any;
}) => {
  const { parsedJson, inputDate } = useChatsContext();
  return (
    <div className="h-full grow px-4 py-6 sm:px-6 md:px-5">
      {/* Chat msg */}
      {messages.map((message, index: number) => {
        if (message?.role === "user") {
          return <UserMessage key={index} text={message?.text} />;
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
                  "Setting specific times to work on your intention"
                ) && (
                  <FormDate
                    setMessageInput={setMessageInput}
                    handleSubmission={handleSubmission}
                  />
                )}
            </div>
          );
        }
      })}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
};
