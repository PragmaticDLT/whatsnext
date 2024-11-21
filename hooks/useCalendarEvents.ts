import {
  addMinutes,
  format,
  setHours,
  setMinutes,
  parseISO,
  isAfter,
  addDays,
  addWeeks,
} from "date-fns";

interface RepeatingEvent {
  activity: string;
  days: string; // e.g., ["Monday", "Wednesday"]
  startDate: string;
  calendarType: "google" | "ical" | "outlook";
  timezone: string; // Timezone identifier, e.g., "America/Argentina/Buenos_Aires"
}

export const createCalendarEvent = ({
  activity,
  days,
  startDate,
  calendarType,
  timezone,
}: RepeatingEvent) => {
  const start = parseISO(startDate);
  const eventTitle = "Work on my What's Next Intention";
  const description = activity.trim();

  // Generate RRULE string for weekly recurrence on specific days
  const daysOfWeek = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];



  const firstDayOffset =
    (7 + getDayIndex(days[0]) - new Date(start).getDay()) % 7;

  const firstEventDate = addDays(new Date(start), firstDayOffset);
  const eventEndDate = addWeeks(firstEventDate, 6); // setting default event end date to 6 week

  // Get users selected starting day of the week 
  const rruleDay = daysOfWeek[getDayIndex(days[0])];
  const rrule = `RRULE:FREQ=WEEKLY;BYDAY=${rruleDay};UNTIL=${format(
    eventEndDate,
    "yyyyMMdd"
  )}`;
  const formattedStartDate = format(
    firstEventDate,
    "yyyyMMdd"
  );
  const formattedEndDate = format(
    eventEndDate,
    "yyyyMMdd"
  );

  // Event start and end date format for outlook
  const outLookFormatStartDate = format(
    firstEventDate,
    "yyyy-MM-dd"
  )

  const outLookFormatEndDate = format(
    eventEndDate,
    "yyyy-MM-dd"
  )

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
      )}`;
      break;
    case "ical":
      eventUrl = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${eventTitle}
DESCRIPTION:${description}
DTSTART;TZID=${timezone}:${formattedStartDate.endsWith("Z")
          ? formattedStartDate.slice(0, -1)
          : formattedStartDate
        }
DTEND;TZID=${timezone}:${formattedEndDate.endsWith("Z")
          ? formattedEndDate.slice(0, -1)
          : formattedEndDate
        }
${rrule}
END:VEVENT
END:VCALENDAR`;
      break;
    case "outlook":
      eventUrl = encodeURI(`https://outlook.live.com/owa/?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(
        eventTitle
      )}&body=${encodeURIComponent(
        description
      )}&startdt=${encodeURIComponent(outLookFormatStartDate)}&enddt=${encodeURIComponent(outLookFormatEndDate)}&recur=${encodeURIComponent(
        rrule
      )}`);

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
