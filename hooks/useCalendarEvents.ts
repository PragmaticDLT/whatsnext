import {
  addMinutes,
  format,
  setHours,
  setMinutes,
  parseISO,
  isAfter,
  addDays,
} from "date-fns";

interface RepeatingEvent {
  activity: string;
  days: string[]; // e.g., ["Monday", "Wednesday"]
  times: string[]; // e.g., ["8:00 AM"]
  endDate: string; // ISO format date "yyyy-MM-dd"
  calendarType: "google" | "ical" | "outlook";
  timezone: string; // Timezone identifier, e.g., "America/Argentina/Buenos_Aires"
}

export const createCalendarEvent = ({
  activity,
  days,
  times,
  endDate,
  calendarType,
  timezone,
}: RepeatingEvent) => {
  const end = parseISO(endDate);
  const eventTitle = "Work on my What's Next Intention";
  const description = activity.trim();

  // Generate RRULE string for weekly recurrence on specific days
  const daysOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  const rruleDays = days.map((day) => daysOfWeek[getDayIndex(day)]).join(",");

  const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${rruleDays};UNTIL=${format(
    end,
    "yyyyMMdd'T'HHmmss'Z'"
  )}`;

  // Calculate first occurrence date and time
  const [firstDay, firstTime] = [days[0], times[0]];
  const firstDayOffset = (7 + getDayIndex(firstDay) - new Date().getDay()) % 7;
  const firstEventDate = addDays(new Date(), firstDayOffset);

  // Convert the time to a Date object in the specified timezone
  const [hour, period] = firstTime.split(" ");
  const hourConverted = parseInt(hour);
  const isHourNaN = isNaN(hourConverted);
  const eventHour =
    parseInt(isHourNaN ? "12" : hour) +
    (period?.toLowerCase() === "pm" && hour !== "12" ? 12 : 0);

  // Create a date-time with the specified hour in the local timezone
  let eventDateTime = setHours(setMinutes(firstEventDate, 0), eventHour);

  // Convert to the specified timezone using toLocaleString
  const eventDateTimeInTimezone = new Date(
    eventDateTime.toLocaleString("en-US", { timeZone: timezone })
  );

  // Format the start and end date for the calendar event
  const formattedStartDate = format(
    eventDateTimeInTimezone,
    "yyyyMMdd'T'HHmmss'Z'"
  );
  const formattedEndDate = format(
    addMinutes(eventDateTimeInTimezone, 30),
    "yyyyMMdd'T'HHmmss'Z'"
  );

  // Generate the event link based on the calendar type
  let eventUrl = "";
  switch (calendarType) {
    case "google":
      eventUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(
        eventTitle
      )}&details=${encodeURIComponent(
        description
      )}&dates=${formattedStartDate}/${formattedEndDate}&recur=${encodeURIComponent(
        rrule
      )}&ctz=${encodeURIComponent(timezone)}`;
      break;
    case "ical":
      eventUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${encodeURIComponent(eventTitle)}
DESCRIPTION:${encodeURIComponent(description)}
DTSTART;TZID=${timezone}:${formattedStartDate}
DTEND;TZID=${timezone}:${formattedEndDate}
${rrule}
END:VEVENT
END:VCALENDAR`;
      break;
    case "outlook":
      eventUrl = `https://outlook.live.com/owa/?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(
        eventTitle
      )}&body=${encodeURIComponent(
        description
      )}&startdt=${formattedStartDate}&enddt=${formattedEndDate}&recur=${encodeURIComponent(
        rrule
      )}&timezone=${encodeURIComponent(timezone)}`;
      break;
    default:
      throw new Error("Unsupported calendar type");
  }

  return eventUrl;
};

// Utility function to convert day names to day indexes
const getDayIndex = (dayName: string): number => {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return daysOfWeek.indexOf(dayName);
};
