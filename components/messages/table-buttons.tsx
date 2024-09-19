import React, { useState } from "react";
import { createCalendarEvent } from "../../hooks/useCalendarEvents";

const TableButtons = ({ parsedJson }: { parsedJson: any }) => {
  if (!parsedJson || !Array.isArray(parsedJson["Calendar Table"])) return null;

  const calendarTable = parsedJson["Calendar Table"];
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 gap-2 mt-4 mb-4">
      {calendarTable.map((weekData, index) => {
        return Object.entries(weekData).map(
          ([day, activity]: [string, string]) => {
            if (day === "Week") return null;

            const [dayName, timeOfDay] = day.split(" (");
            const time = timeOfDay.replace(")", "");
            const weekNumber = weekData.Week.split(" ")[1];
            const dropdownKey = `${index}-${day}`;

            return (
              <DropdownMenu
                key={dropdownKey}
                weekData={weekData}
                dayName={dayName}
                time={time}
                activity={activity}
                weekNumber={weekNumber}
                parsedJson={parsedJson}
                isOpen={openDropdown === dropdownKey}
                setOpenDropdown={() =>
                  setOpenDropdown(
                    openDropdown === dropdownKey ? null : dropdownKey
                  )
                }
              />
            );
          }
        );
      })}
    </div>
  );
};

const DropdownMenu = ({
  weekData,
  dayName,
  time,
  activity,
  weekNumber,
  parsedJson,
  isOpen,
  setOpenDropdown,
}) => {
  return (
    <div className="relative inline-block text-left">
      <button
        onClick={setOpenDropdown}
        className="btn bg-indigo-500 text-white hover:bg-indigo-600 text-sm p-2 inline-flex w-full justify-center gap-x-1.5 rounded-md"
      >
        Schedule: {weekData.Week}, {dayName} ({time})
        <span className="-mr-1 h-5 w-5 text-gray-400">▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
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
                  setOpenDropdown();
                }}
                className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 text-gray-700"
              >
                {calendarType.charAt(0).toUpperCase() + calendarType.slice(1)}{" "}
                Calendar
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableButtons;
