import { ReactNode } from "react";

interface UserMessageProps {
  text?: ReactNode;
}

function UserMessage({ text }: UserMessageProps) {
  return (
    <div className="mb-4 flex items-start justify-end last:mb-0">
      <div>
        <div className="mb-1 rounded rounded-tr-none border border-transparent bg-indigo-500 p-3 text-sm text-white shadow-md">
          {text}
        </div>
        <div className="flex items-center justify-between"></div>
      </div>
    </div>
  );
}

export default UserMessage;
