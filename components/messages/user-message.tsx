import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

import "./styles.css";
import { useChatsContext } from "../../contexts/chats-context";
import ModalBasic from "../modals/modal-basic";
import { useState } from "react";
interface UserMessageProps {
  text?: string;
  last?: Boolean;
  handleRefreshQuestion?: any;
}

function UserMessage({ text, last, handleRefreshQuestion }: UserMessageProps) {
  const { currentQuestionNumber } = useChatsContext();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="mb-4 flex items-start justify-end last:mb-0">
      <div>
        <div className="mb-1 rounded rounded-tr-none border border-transparent bg-indigo-500 p-3 text-sm text-white shadow-md">
          <Markdown
            urlTransform={(url) => url}
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              table: ({ children, ...props }) => (
                <table className="my-4" {...props}>
                  {children}
                </table>
              ),
              a: ({ children, href, ...props }) => {
                if (href?.startsWith("http"))
                  return (
                    <a href={href} {...props}>
                      {children}
                    </a>
                  );
              },
              code: ({ children, ...props }) => (
                <code className="my-4" {...props}>
                  {children}
                </code>
              ),
            }}
          >
            {text?.replace(/\n/gi, "\n &nbsp;")}
          </Markdown>
        </div>
        <div className="flex items-center justify-between"></div>
      </div>
      {currentQuestionNumber > 0 && currentQuestionNumber < 15 && last && (
        <button
          onClick={() => {
            setIsOpen(true);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-refresh"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="#2c3e50"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
            <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
          </svg>
        </button>
      )}
      <ModalBasic
        title="Are you sure you want to change your answer?"
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      >
        <div className="flex flex-col m-4">
          <p>This action will delete your last answer</p>

          <div className="flex flex-row mt-4 flex-end gap-2">
            <button
              className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
              onClick={() => {
                handleRefreshQuestion(text);
                setIsOpen(false);
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

export default UserMessage;
