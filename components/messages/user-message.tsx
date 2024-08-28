import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

import "./styles.css";
interface UserMessageProps {
  text?: string;
}

function UserMessage({ text }: UserMessageProps) {
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
    </div>
  );
}

export default UserMessage;
