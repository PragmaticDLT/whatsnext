import { addMinutes, addWeeks, format, setHours, setMinutes } from "date-fns";

export const createCalendarEvent = (
  activity: string,
  weekOffset: number,
  dayOfWeek: number,
  dayName: string,
  time: string,
  calendarType: "google" | "ical" | "outlook",
  eventNumber: number,
  parsedJson: any
) => {
  const startDate = addWeeks(new Date(), weekOffset);
  const [hour, period] = time.match(/(\d{1,2})(am|pm)/)?.slice(1) || [];
  const eventHour =
    parseInt(hour) + (period.toLowerCase() === "pm" && hour !== "12" ? 12 : 0);
  const eventDate = setHours(setMinutes(startDate, 0), eventHour);
  const formattedDate = format(eventDate, "yyyyMMdd'T'HHmmss'Z'");
  const endDate = format(addMinutes(eventDate, 30), "yyyyMMdd'T'HHmmss'Z'");

  const eventTitle = `What's Next Check-in #${eventNumber}`;
  console.log(parsedJson);
  const obstaclesSection =
    parsedJson["Identified Obstacles and Strategies"] || [];
  const supportSection = parsedJson["Support/People Network"] || [];

  const description = `
${activity}

Obstacles:
${obstaclesSection
  .map(
    (item: { item: any }) =>
      `- obstacle: ${item.Obstacle} \n - strategy: ${item.Strategy} \n - `
  )
  .join("\n")}

Support Network:
${supportSection
  .map((item: { text: any }) => `- ${item.Name}: ${item.Role}`)
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
      window.open(googleUrl, "_blank");
      break;
    case "ical":
      window.open(icsUrl);
      break;
    case "outlook":
      window.open(outlookUrl, "_blank");
      break;
  }
};
