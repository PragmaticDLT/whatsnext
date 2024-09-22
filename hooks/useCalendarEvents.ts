import {
  addMinutes,
  addWeeks,
  format,
  setHours,
  setMinutes,
  parse,
} from "date-fns";

export const createCalendarEvent = (
  activity: string,
  weekNumber: string,
  dayName: string,
  time: string,
  calendarType: "google" | "ical" | "outlook",
  parsedJson: any
) => {
  const weekOffset = parseInt(weekNumber) - 1;
  const startDate = addWeeks(new Date(), weekOffset);
  const [hour, period] = time.split(" ");
  const hourConverted = parseInt(hour);
  const isHourNaN = isNaN(hourConverted);
  const eventHour =
    parseInt(isHourNaN ? "12" : hour) + (period?.toLowerCase() === "pm" && hour !== "12" ? 12 : 0);
  const eventDate = setHours(setMinutes(startDate , 0), eventHour);
  const formattedDate = format(eventDate, "yyyyMMdd'T'HHmmss'Z'");
  const endDate = format(addMinutes(eventDate, 30), "yyyyMMdd'T'HHmmss'Z'");


  const eventTitle = `What's Next Check-in: #${weekNumber}`;

  const obstaclesSection = parsedJson["Obstacles & Strategies"] || [];
  const supportSection = parsedJson["Support/People Network"] || [];

  const description = `
${activity}

Obstacles:
${obstaclesSection
  .map(
    (item: any) => `- Obstacle: ${item.Obstacle}\n  Strategy: ${item.Strategy}`
  )
  .join("\n")}

Support Network:
${supportSection
  .map((item: any) => `- ${item.Name}: ${item.Description}`)
  .join("\n")}
  `.trim();

  const googleUrl = `https://calendar.google.com/calendar/u/0/r/eventedit?text=${encodeURIComponent(
    eventTitle
  )}&details=${encodeURIComponent(
    description
  )}&dates=${formattedDate}/${endDate}`;

  const icsUrl = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${encodeURIComponent(eventTitle)}
DESCRIPTION:${encodeURIComponent(description)}
DTSTART:${formattedDate}
DTEND:${endDate}
END:VEVENT
END:VCALENDAR`;

  const outlookUrl = `https://outlook.live.com/owa/?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(
    eventTitle
  )}&body=${encodeURIComponent(
    description
  )}&startdt=${formattedDate}&enddt=${endDate}`;

  switch (calendarType) {
    case "google":
      return googleUrl;
    case "ical":
      return icsUrl;
    case "outlook":
      return outlookUrl;
    default:
      return "";
  }
};
