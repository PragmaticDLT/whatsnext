import React, { useState } from "react";
import { createCalendarEvent } from "../../hooks/useCalendarEvents";

const TableButtons = ({ parsedJson }: { parsedJson: any }) => {
  if (!parsedJson || !Array.isArray(parsedJson["Calendar Table"])) return null;

  const calendarTable = parsedJson["Calendar Table"];
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-2 mt-4 mb-4 sm:grid-cols-2">
      {calendarTable.map((weekData, index) => {
        return Object.entries(weekData).map(
          ([day, activity]: [string, string]) => {
            if (day === "Week") return null;

            const [dayName, timeOfDay] = day.split(" (");
            const time = timeOfDay.replace(")", "");
            const weekNumber = weekData.Week.split(" ")[1];
            const dropdownKey = `${index}-${day}`;

            return (
              <CalendarButtons
                key={dropdownKey}
                weekData={weekData}
                dayName={dayName}
                time={time}
                activity={activity}
                weekNumber={weekNumber}
                parsedJson={parsedJson}
              />
            );
          }
        );
      })}
    </div>
  );
};

const CalendarButtons = ({
  weekData,
  dayName,
  time,
  activity,
  weekNumber,
  parsedJson,
}) => {
  const buttonTitle = `Schedule: ${weekData.Week}, ${dayName} (${time})`;

  return (
    <div className="relative inline-block text-left">
      <div className=" text-black text-sm p-2 rounded-md mb-2">
        {buttonTitle}
      </div>
      <div className="flex space-x-2">
        {["google", "ical", "outlook"].map((calendarType) => (
          <button
            key={calendarType}
            onClick={() => {
              const url = createCalendarEvent(
                activity,
                weekNumber,
                dayName,
                time,
                calendarType,
                parsedJson
              );
              window.open(url, "_blank");
            }}
            className="btn bg-indigo-500 text-white hover:bg-indigo-600 text-sm p-2 rounded-md"
          >
            {calendarType.charAt(0).toUpperCase() + calendarType.slice(1)}{" "}
            Calendar
          </button>
        ))}
      </div>
    </div>
  );
};

export default TableButtons;
