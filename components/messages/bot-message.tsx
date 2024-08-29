import Image from "next/image";
import User01 from "../../public/images/WNChat.png";
import { ReactNode } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import "./styles.css";

interface BotMessageProps {
  text?: ReactNode;
  activeQuestions?: boolean;
  handleSendMessage: (message: string) => void;
}
const questions = [{ question: "Let's Get Started!" }];

function BotMessage({
  text,
  activeQuestions,
  handleSendMessage,
}: BotMessageProps) {
  return (
    <>
      <div className="mb-4 flex items-start last:mb-0 first:mb-1">
        <Image
          className="mr-4 rounded-full"
          src={User01}
          width={40}
          height={40}
          alt="User 01"
        />

        <div>
          <div className="mb-1 rounded rounded-tl-none border border-slate-200 bg-white p-3 text-sm text-slate-800 shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            {!text || text == "" ? (
              <svg
                className="fill-current text-slate-400 dark:text-slate-500"
                viewBox="0 0 15 3"
                width="15"
                height="3"
              >
                <circle cx="1.5" cy="1.5" r="1.5">
                  <animate
                    attributeName="opacity"
                    dur="1s"
                    values="0;1;0"
                    repeatCount="indefinite"
                    begin="0.1"
                  />
                </circle>
                <circle cx="7.5" cy="1.5" r="1.5">
                  <animate
                    attributeName="opacity"
                    dur="1s"
                    values="0;1;0"
                    repeatCount="indefinite"
                    begin="0.2"
                  />
                </circle>
                <circle cx="13.5" cy="1.5" r="1.5">
                  <animate
                    attributeName="opacity"
                    dur="1s"
                    values="0;1;0"
                    repeatCount="indefinite"
                    begin="0.3"
                  />
                </circle>
              </svg>
            ) : (
              <Markdown
                urlTransform={(url) => url}
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  table: ({ children, ...props }) => (
                    <table
                      className="my-4"
                      style={{ width: "100%", border: "1px solid #555" }}
                      {...props}
                    >
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
                {typeof text === "string" && /\|[-|]+\|/.test(text)
                  ? text
                  : text?.replace(/\n/gi, "\n &nbsp;")}
              </Markdown>
            )}
          </div>
          <div className="flex items-center justify-between"></div>
        </div>
      </div>
      <div className="flex space-x-4 ml-14">
        <Carousel
          showStatus={false}
          infiniteLoop
          className="max-w-xs mb-2"
          showIndicators={false}
          showThumbs={false}
        >
          {activeQuestions &&
            questions?.length > 0 &&
            questions?.map((question, index) => (
              <div
                className="rounded h-full bg-slate-500 text-slate-100 hover:bg-slate-600 pl-2 pr-2"
                key={index}
              >
                <button
                  className="btn-sm w-full h-full min-h-14"
                  onClick={() => {
                    handleSendMessage(question.question);
                  }}
                >
                  {question.question}
                </button>
              </div>
            ))}
        </Carousel>
      </div>
    </>
  );
}

export default BotMessage;
