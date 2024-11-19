import { useMemo, useState } from "react";
import ModalBlank from "../modals/modal-blank";
import ModalBasic from "../modals/modal-basic";
import { createCalendarEvent } from "../../hooks/useCalendarEvents";

import { saveAs } from "file-saver";

interface CalendarButtonProps {
  json?: any;
  text?: any;
}

export default function CalendarButton({ json, text }: CalendarButtonProps) {
  const calendarTable = useMemo(() => json["Schedule"], [json]);
  const [openCalendar, setOpenCalendar] = useState(false);

  // const activity = Object.entries(calendarTable);
  console.log("timee", json);

  return (
    <>
      <button
        className="btn bg-green-500 text-white hover:bg-green-600"
        onClick={() => {
          setOpenCalendar(true);
        }}
      >
        Calendar
      </button>
      <ModalBasic
        title="Calendar Options"
        isOpen={openCalendar}
        setIsOpen={setOpenCalendar}
      >
        <div className="flex flex-col m-4">
          <p>Select an option to configure your calendar</p>

          <div className="flex flex-row mt-4 flex-end gap-2">
            <button
              className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
              onClick={() => {
                const url = createCalendarEvent({
                  activity: json["Finalized What’s Next Intention"],
                  days: calendarTable["Days"],
                  // times: calendarTable["Time"],
                  startDate: calendarTable["Start Date"],
                  // endDate: calendarTable["End Date"],
                  calendarType: "google",
                  timezone: calendarTable["Timezone"],
                });
                window.open(url, "_blank");
                setOpenCalendar(false);
              }}
            >
              Google
            </button>
            <button
              className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
              onClick={() => {
                const url = createCalendarEvent({
                  activity: json["Finalized What’s Next Intention"],
                  days: calendarTable["Days"],
                  // times: calendarTable["Time"],
                  startDate: calendarTable["Start Date"],
                  // endDate: calendarTable["End Date"],
                  calendarType: "ical",
                  timezone: calendarTable["Timezone"],
                });

                // window.open(url, "_blank");
                const blob = new Blob([url], {
                  type: "text/calendar;charset=utf-8",
                });

                saveAs(blob, "event.ics");

                // const link = document.createElement("a")
                // link.href = URL.createObjectURL(blob)
                // link.download = "event.ics";
                // document.body.appendChild(link);
                // link.click();
                // document.body.removeChild(link);

                setOpenCalendar(false);
              }}
            >
              Ical
            </button>
            <button
              className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
              onClick={() => {
                const url = createCalendarEvent({
                  activity: json["Finalized What’s Next Intention"],
                  days: calendarTable["Days"],
                  // times: calendarTable["Time"],
                  startDate: calendarTable["Start Date"],
                  // endDate: calendarTable["End Date"],
                  calendarType: "outlook",
                  timezone: calendarTable["Timezone"],
                });
                window.open(url, "_blank");
                setOpenCalendar(false);
              }}
            >
              Outlook
            </button>
          </div>
        </div>
      </ModalBasic>
    </>
  );
}
