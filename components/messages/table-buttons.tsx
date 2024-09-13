import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { createCalendarEvent } from "../../hooks/useCalendarEvents";

const renderTableButtons = (parsedJson: any) => {
  if (!parsedJson || !Array.isArray(parsedJson["Calendar Table"])) return null;

  const calendarTable = parsedJson["Calendar Table"];

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {calendarTable.map((weekData, index) => {
        return Object.entries(weekData).map(
          ([day, activity]: [string, string]) => {
            if (day === "Week") return null;

            const [dayName, timeOfDay] = day.split(" (");
            const time = timeOfDay.replace(")", "");
            const weekNumber = weekData.Week.split(" ")[1];

            return (
              <Menu
                as="div"
                key={`${index}-${day}`}
                className="relative inline-block text-left"
              >
                <div>
                  <Menu.Button className="btn bg-indigo-500 text-white hover:bg-indigo-600 text-sm p-2 inline-flex w-full justify-center gap-x-1.5 rounded-md">
                    Schedule: {weekData.Week}, {dayName} ({time})
                    <ChevronDownIcon
                      className="-mr-1 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>

                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {["google", "ical", "outlook"].map((calendarType) => (
                        <Menu.Item key={calendarType}>
                          {({ active }) => (
                            <button
                              onClick={() =>
                                createCalendarEvent(
                                  activity,
                                  weekNumber,
                                  dayName,
                                  time,
                                  calendarType,
                                  parsedJson
                                )
                              }
                              className={`${
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700"
                              } block px-4 py-2 text-sm w-full text-left`}
                            >
                              {calendarType.charAt(0).toUpperCase() +
                                calendarType.slice(1)}{" "}
                              Calendar
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            );
          }
        );
      })}
    </div>
  );
};

export default renderTableButtons;
