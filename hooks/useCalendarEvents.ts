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
  startDate: string;
  endDate: string; // ISO format date "yyyy-MM-dd"
  calendarType: "google" | "ical" | "outlook";
  timezone: string; // Timezone identifier, e.g., "America/Argentina/Buenos_Aires"
}

export const createCalendarEvent = ({
  activity,
  days,
  times,
  startDate,
  endDate,
  calendarType,
  timezone,
}: RepeatingEvent) => {
  const start = parseISO(startDate);
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
  // const [firstDay, firstTime, endTime] = [days[0], times[0], times[1]];
  const [firstTime, endTime] = [times[0], times[1]];

  // To identify the nearest day regarding the selected starting date
  let firstDay = "";
  const startingDate = start.toLocaleDateString("en-US", { weekday: "long" });
  const startingIndex = getDayIndex(startingDate);

  const validDays = days
    .map(day => ({ day, index: getDayIndex(day) }))
    .filter(({ index }) => index >= startingIndex)
    .sort((a, b) => a.index - b.index);

  firstDay = validDays.length ? validDays[0].day : days[0];

  const firstDayOffset = (7 + getDayIndex(firstDay) - new Date(start).getDay()) % 7;
  const firstEventDate = addDays(new Date(start), firstDayOffset);

  // Convert the event starting time to a Date object in the specified timezone
  const [hour, period] = firstTime.split(" ");
  const hourConverted = parseInt(hour);
  const isHourNaN = isNaN(hourConverted);
  const eventHour =
    parseInt(isHourNaN ? "12" : hour) +
    (period?.toLowerCase() === "pm" && hour !== "12" ? 12 : 0);

  // Convert the event ending time to a Date object in the specified timezone
  const [endHour, endPeriod] = endTime.split(" ");
  const endHourConverted = parseInt(hour);
  const isHourEndNaN = isNaN(endHourConverted);
  const eventEndHour =
    parseInt(isHourEndNaN ? "12" : endHour) +
    (endPeriod?.toLowerCase() === "pm" && endHour !== "12" ? 12 : 0);

  // Added because the calander is giving error when the time zone is East african time
  function getIanaTimeZone(timezone) {
    if (timezone === "East Africa Time") {
      return "Africa/Nairobi"; // Valid IANA timezone for East Africa
    }
    return timezone;
  }

  // Create a date-time with the specified hour in the local timezone
  let eventDateTime = setHours(setMinutes(firstEventDate, 0), eventHour);
  let eventEndDateTime = setHours(setMinutes(firstEventDate, 0), eventEndHour);

  // Convert to the specified timezone using toLocaleString (For the event Starting time)
  const eventDateTimeInTimezone = new Date(
    eventDateTime.toLocaleString("en-US", { timeZone: getIanaTimeZone(timezone) })
  );

  // Convert to the specified timezone using toLocaleString (For the event ending time)
  const eventEndDateTimeInTimezone = new Date(
    eventEndDateTime.toLocaleString("en-US", { timeZone: getIanaTimeZone(timezone) })
  );

  // Format the start and end date for the calendar event
  const formattedStartDate = format(
    eventDateTimeInTimezone,
    "yyyyMMdd'T'HHmmss'Z'"
  );
  const formattedEndDate = format(
    // addMinutes(eventDateTimeInTimezone, 30),
    endTime ? eventEndDateTimeInTimezone : addMinutes(eventDateTimeInTimezone, 30),
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
      // const encodedTitle = encodeURIComponent(eventTitle);
      // const encodedDescription = encodeURIComponent(description);

      eventUrl = `BEGIN:VCALENDAR
      VERSION:2.0
      BEGIN:VEVENT
      SUMMARY:${encodeURIComponent(eventTitle).replace(/%20/g, ' ')}
      DESCRIPTION:${encodeURIComponent(description).replace(/%20/g, ' ')}
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
