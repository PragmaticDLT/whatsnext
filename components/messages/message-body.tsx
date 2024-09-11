import { useChatsContext } from "../../contexts/chats-context";
import BotMessage from "./bot-message";
import renderTableButtons from "./table-buttons";
import UserMessage from "./user-message";

export const MessageBody = ({
  messages,
  messagesEndRef,
  handleSubmission,
}: {
  messages: any[];
  messagesEndRef: any;
  handleSubmission: any;
}) => {
  return (
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
              />
            </div>
          );
        }
      })}
      <div ref={messagesEndRef} aria-hidden="true" />
    </div>
  );
};
