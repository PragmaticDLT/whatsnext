import Image from "next/image";
import User01 from "../../public/images/WNChat.png";
import { ReactNode, useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import "./styles.css";
import DownloadPDFButton from "./download-pdf-button";
import { useChatsContext } from "../../contexts/chats-context";
import renderTableButtons from "./table-buttons";
import TableButtons from "./table-buttons";

import { extractTextBetweenAsterisks } from "../../utils/utils";
import CalendarButton from "./calendar-button";

interface BotMessageProps {
  text?: ReactNode;
  activeQuestions?: boolean;
  handleSendMessage: (message: string) => void;
}

function BotMessage({
  text,
  activeQuestions,
  handleSendMessage,
}: BotMessageProps) {
  const { setParsedJson, parsedJson, setInputDate, setSpecialButtons } = useChatsContext();
  const [parsedJsonLocal, setParsedJsonLocal] = useState<any>(null);
  const videoRef = useRef(null);
  const [firstAutoPlay, setFirstAutoplay] = useState(() => {
    return localStorage.getItem('firstPlay') === 'false'
  });
  const [breakAutoplay, setBreakAutoplay] = useState(() => {
    return localStorage.getItem('breakPlay') === 'false'
  })
  const [endAutoplay, setendAutoplay] = useState(() => {
    return localStorage.getItem('endPlay') === 'false'
  })
  // To automatically start the question when the video ends
  // const handleEndVideo = () => {
  //   // setAutoplay(true);
  //   // handleSendMessage("Start the questions")
  // }

  // To manage video auto play when users scroll to the video section after load
  const handleVideoLoad = (video: string) => {
    if (video === "First") {
      localStorage.setItem('firstPlay', 'false');
    } else if (video === "break") {
      localStorage.setItem('breakPlay', 'false');
    } else {
      localStorage.setItem('endPlay', 'false');
    }
  }

  useEffect(() => {
    if (
      typeof text === "string" &&
      text.startsWith("```json") &&
      text.endsWith("```")
    ) {
      try {
        const jsonContent = text.replace(/^```json\n|\n```$/g, "");
        const parsed = JSON.parse(jsonContent);
        setParsedJsonLocal(parsed);
        setParsedJson(parsed);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }
    if (
      typeof text === "string" &&
      text.includes(
        "now going to create a recurring calendar invite in your Apple, Google or Outlook calendar."
      )
    ) {
      console.log("is input");
      try {
        setInputDate({
          active: true,
          days: "",
          place: "",
          start_date: "",
          intention: "",
        });
      } catch (error) {
        console.error("Error activating the input:", error);
      }
    }
    if (
      typeof text === "string" &&
      text.includes(
        "Congrats on making it this far! We've analyzed your answers"
      )
    ) {
      try {
        setSpecialButtons(extractTextBetweenAsterisks(text));
      } catch (error) {
        console.error("Error creating speacil buttons", error);
      }
    }
  }, [text, setParsedJson]);

  const renderJsonContent = (content: any) => {
    if (!content) return null;
    if (content["Finalized What’s Next Intention"] && !content["Schedule"]) {
      return (
        <div className="json-content">
          <p>
            When you click on the pdf, it will open in a new tab that you can
            print. After you've printed out your What's Next Plan, click on the
            OK next button below
          </p>
        </div>
      );
    }
    if (content["Schedule"]) {
      return (
        <div className="json-content">
          <p>
            Click on the Calendar button below. In the next screen you can click
            on the the electronic calendar that you use: Apple, Google or
            Outlook. Your What's Next Intention plan will then be in your
            calendar. Check the calendar appointment to make sure the days
            and times you want to work on your What's Next Intention is what you want.
            After you've done this, click on "OK next".
          </p>
        </div>
      );
    }
  };
  const renderJsonContent2 = (content: any) => {
    if (!content) return null;

    return (
      <div className="json-content">
        <h2 className="text-xl font-bold mb-4">
          {content["30-Day Plan Title"]}
        </h2>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          Finalized What's Next Intention:
        </h3>
        {content["Finalized What’s Next Intention"] ? (
          <p>{content["Finalized What’s Next Intention"]}</p>
        ) : (
          <p>{content["Finalized What's Next Intention"]}</p>
        )}

        <h3 className="text-lg font-semibold mt-4 mb-2">Schedule Details:</h3>
        <ul className="list-disc list-inside">
          <li>
            <strong>Days of the week:</strong> {content["Schedule"].Days}
          </li>
          <li>
            <strong>Time of day:</strong> {content["Schedule"].Time}
          </li>
          <li>
            <strong>Place:</strong> {content["Schedule"].Place}
          </li>
          <li>
            <strong>Start Date:</strong> {content["Schedule"]["Start Date"]}
          </li>
          <li>
            <strong>Fulfillment Date:</strong> {content["Schedule"]["End Date"]}
          </li>
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          Action/Habit Stacking Statements:
        </h3>
        <ul className="list-disc list-inside">
          {content["Action/Habit Stacking Statements"]?.map(
            (item: any, index: number) => (
              <li key={index}>
                <strong>{item.Action}</strong>
                <ul className="list-circle list-inside ml-4">
                  <li>Current habit: {item["Identified Current Habit"]}</li>
                  <li>
                    Pairing:{" "}
                    {item["Pairing Action to Existing Habit Statement"]}
                  </li>
                </ul>
              </li>
            )
          )}
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">
          Potential Obstacles & Strategies:
        </h3>
        <ul className="list-disc list-inside">
          {content["Obstacles & Strategies"]?.map(
            (item: any, index: number) => (
              <li key={index}>
                <strong>Obstacle:</strong> {item.Obstacle}
                <ul className="list-circle list-inside ml-4">
                  <li>Strategy: {item.Strategy}</li>
                </ul>
              </li>
            )
          )}
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">Support System:</h3>
        <ul className="list-disc list-inside">
          {content["Support/People Network"]?.map(
            (item: any, index: number) => (
              <li key={index}>
                <strong>{item.Name}:</strong> {item["Description"]}
              </li>
            )
          )}
        </ul>

        <h3 className="text-lg font-semibold mt-4 mb-2">Calendar:</h3>
        {renderCalendarTable(content["Calendar Table"])}
      </div>
    );
  };

  const renderCalendarTable = (calendarData: any[]) => {
    if (!calendarData || calendarData.length === 0) return null;

    const headers = Object.keys(calendarData[0]);
    const markdownTable = [
      `| ${headers.join(" | ")} |`,
      `| ${headers.map(() => "---").join(" | ")} |`,
      ...calendarData.map(
        (week) =>
          `| ${headers.map((header) => week[header] || "").join(" | ")} |`
      ),
    ].join("\n");

    return (
      <>
        <Markdown
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
          }}
        >
          {markdownTable}
        </Markdown>
        {/* <TableButtons parsedJson={parsedJsonLocal} /> */}
      </>
    );
  };

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
            {!text ||
              text == "" ||
              (text.startsWith("```json") && !text.endsWith("```")) ? (
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
            ) : parsedJsonLocal ? (
              renderJsonContent(parsedJsonLocal)
            ) : text.startsWith("Hey! Hello! Welcome") ? (
              <video ref={videoRef} onLoadStart={() => handleVideoLoad("First")} autoPlay={!firstAutoPlay} controls width="640" className="xs:h-[400px] w-full">
                <source src="/videos/start.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>) : text.startsWith("We recommend taking a 15 to 20 minute break") ?
              (<video ref={videoRef} onLoadStart={() => handleVideoLoad("break")} autoPlay={!breakAutoplay} controls width="640" className="xs:h-[400px] w-full">
                <source src="/videos/break.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>) : text.includes("Congrats, you’ve completed the What's Next Next Life Coaching part of this Course!") ?
                (<video ref={videoRef} onLoadStart={() => handleVideoLoad("end")} autoPlay={!endAutoplay} controls width="640" className="xs:h-[400px] w-full">
                  <source src="/videos/end.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>) : (
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
        {activeQuestions && (
          <div className="max-w-xs mb-2">
            <div className="rounded h-full bg-slate-500 text-slate-100 hover:bg-slate-600 pl-2 pr-2">
              <button
                className="btn-sm w-full h-full min-h-14"
                onClick={() => {
                  handleSendMessage("Let's Get Started!");
                }}
              >
                Let's Get Started!
              </button>
            </div>
          </div>
        )}
        {parsedJsonLocal &&
          parsedJsonLocal["Finalized What’s Next Intention"] &&
          !parsedJsonLocal["Schedule"] && (
            <DownloadPDFButton
              json={parsedJsonLocal}
              text={JSON.stringify(parsedJsonLocal)}
            />
          )}
        {parsedJsonLocal && parsedJsonLocal["Schedule"] && (
          <CalendarButton
            json={parsedJsonLocal}
            text={JSON.stringify(parsedJsonLocal)}
          />
        )}
      </div>
    </>
  );
}

export default BotMessage;
