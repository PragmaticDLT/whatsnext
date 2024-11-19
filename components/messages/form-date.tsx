import React, { useEffect, useMemo, useState } from "react";
import Datepicker from "../datepicker";
import { useChatsContext } from "../../contexts/chats-context";

const FormDate = ({ handleSubmission, setMessageInput }) => {
  const { inputDate, setInputDate, parsedJson } = useChatsContext();
  const [disabledSend, setDisabledSend] = useState(false);
  const [selectedDays, setSelectedDays] = useState<any>([]);
  const [isDropDownOpen, setIsDropdownOpen] = useState(false);
  const [startHour, setStartHour] = useState<string>('');
  const [startMinute, setStartMinute] = useState<string>('');
  const [startPeriod, setStartPeriod] = useState<string>('am');
  const [endHour, setEndHour] = useState<string>('');
  const [endMinute, setEndMinute] = useState<string>('');
  const [endPeriod, setEndPeriod] = useState<string>('am');

  // To set users intention on the intention input field by default

  useEffect(() => {
    setInputDate((date: any) => ({
      ...date,
      intention: parsedJson["Finalized What’s Next Intention"],
    }));
  }, [parsedJson])
  // To enable users to select multiple days of the weeks
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleSelectDays = (e) => {
    const selectedDay = e.target.value
    if (!selectedDays.includes(selectedDay)) {
      // const selectedDay = Array.from(e.target.selectedOptions, (option: any) => option.value);
      setSelectedDays((prevItems: any) => [...prevItems, selectedDay]);
      setInputDate((date: any) => ({
        ...date,
        days: date.days ? `${date.days},${selectedDay}` : selectedDay,
      }));
    }

  }

  const handleRemoveDay = (selectedDay) => {
    setSelectedDays(selectedDays.filter((o) => o !== selectedDay));
    setInputDate((date: any) => ({
      ...date,
      days: date.days
        ? date.days
          .split(',')
          .filter((day: string) => day !== selectedDay) // Remove the canceled day
          .join(',')
        : selectedDay,
    }));
    // setInputDate((items: any[]) => items.filter((o)=> o.days !== selectedDay));
  };

  // To set the starting and end working time 
  useEffect(() => {
    setInputDate((date: any) => ({
      ...date,
      time: `${startHour}:${startMinute} ${startPeriod} - ${endHour}:${endMinute} ${endPeriod}`
    }));
  }, [startHour, startMinute, startPeriod, endHour, endMinute, endPeriod])

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (type === 'startHour') {
      setStartHour(e.target.value);
    } else if (type === "startMinute") {
      setStartMinute(e.target.value)
    } else if (type === "startPeriod") {
      setStartPeriod(e.target.value);
    } else if (type === "endHour") {
      setEndHour(e.target.value);
    } else if (type === "endMinute") {
      setEndMinute(e.target.value);
    } else {
      setEndPeriod(e.target.value);
    }
  }

  console.log("input", inputDate)
  return (
    <div className="grid grid-cols-1 gap-2 mt-4 mb-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="placeholder">
          Your What's Next Intention:
        </label>
        <textarea
          id="placeholder"
          className="form-input w-full"
          // type="text"
          // placeholder="I'll do..."
          value={parsedJson["Finalized What’s Next Intention"]}
        // onChange={(e) => {
        //   e.preventDefault();
        //   setInputDate((date: any) => ({
        //     ...date,
        //     intention: intention,
        //   }));
        // }}
        >

        </textarea>
        {/* <input
          id="placeholder"
          className="form-input w-full"
          type="text"
          // placeholder="I'll do..."
          value={intention}
          onChange={(e) => {
            e.preventDefault();
            setInputDate((date: any) => ({
              ...date,
              intention: intention,
            }));
          }}
        /> */}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="placeholder">
          Day of the week you'll work on your What's Next Intention
        </label>
        <select className="" value={inputDate.days}
          onChange={(e) => {
            e.preventDefault();
            setInputDate((date: any) => ({
              ...date,
              days: e.target.value,
            }));
          }}>
          <option>Select Day of the Week...</option>
          <option value="Sunday">Sunday</option>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
        </select>
        {/* <div onClick={toggleDropdown} style={{
          border: "1px solid #ccc",
          padding: "8px",
          cursor: "pointer",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          background: "#fff",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
          position: "relative",
          transition: "border-color 0.2s",
        }}>
          {selectedDays.map((selected, index) => (
            <div key={index}>
              <span style={{ background: "#e0e0e0", borderRadius: "4px", padding: "2px 5px", margin: "2px" }}>
                {selected}
              </span>
              <span
                onClick={() => handleRemoveDay(selected)}
                style={{
                  cursor: "pointer",
                  marginLeft: "5px",
                  color: "red",
                  fontWeight: "bold",
                }}
              >
                &times;
              </span>
            </div>
          ))}
          <select multiple value={selectedDays} onChange={handleSelectDays} style={{ display: "none" }}>
            {days.map((day, index) => (
              <option key={index} value={day} >
                {day}
              </option>
            ))}
          </select>
          {selectedDays.length === 0 && <span>Select Days of the Weeks...</span>}
          <span style={{ marginLeft: "auto" }}>&#9662;</span>
        </div>
        {isDropDownOpen && (
          <select multiple value={selectedDays} onChange={handleSelectDays}>
            {days.map((day, index) => (
              <option key={index} value={day}>
                {day}
              </option>
            ))}
          </select>
        )} */}
      </div>
      {/* <div>
        <label className="block text-sm font-medium mb-1" htmlFor="placeholder">
          Time of day you'll start actions on your What's Next intention
        </label>
        <div className="flex flex-wrap border bg-white md:w-[35%] justify-between">
          <input className="border-none w-[25%] text-[14px]" placeholder="Hour" onChange={(e) => handleStartTimeChange(e, 'startHour')} />
          <span className="font-bold text-[30px]">:</span>
          <input className="border-none w-[27%] pl-[0px] text-[14px]" type="number" placeholder="minute" onChange={(e) => handleStartTimeChange(e, 'startMinute')} />
          <select className="border-none w-[25%] text-[14px]" onChange={(e) => handleStartTimeChange(e, 'startPeriod')}>
            <option value='am'>AM</option>
            <option value='pm'>PM</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="placeholder">
          Time of day you'll end actions on your What's Next intention
        </label>
        <div className="flex flex-wrap border bg-white md:w-[35%] justify-between">
          <input className="border-none w-[25%] text-[14px]" placeholder="Hour" onChange={(e) => handleStartTimeChange(e, 'endHour')} />
          <span className="font-bold text-[30px]">:</span>
          <input className="border-none w-[27%] pl-[0px] text-[14px]" type="number" placeholder="minute" onChange={(e) => handleStartTimeChange(e, 'endMinute')} />
          <select className="border-none w-[25%] text-[14px]" onChange={(e) => handleStartTimeChange(e, 'endPeriod')}>
            <option value='am'>AM</option>
            <option value='pm'>PM</option>
          </select>
        </div>
      </div> */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Place you'll do it
        </label>
        <select className=""
          value={inputDate.place}
          onChange={(e) => {
            e.preventDefault();
            setInputDate((date: any) => ({
              ...date,
              place: e.target.value,
            }));
          }}>
          <option>Select place you will do it</option>
          <option value="Home office">Home office</option>
          <option value="Reading nook">Reading nook</option>
          <option value="Living Room">Living Room</option>
          <option value="Kitchen">Kitchen</option>
          <option value="Bedroom">Bedroom</option>
          <option value="Couch">Couch</option>
          <option value="Outside somewhere nice">Outside somewhere nice</option>
          <option value="Work">Work</option>
          <option value="Coffee shop near me">Coffee shop near me</option>
          <option value="Other">Other</option>
        </select>
        {/* <input
          id="placeholder"
          className="form-input w-full"
          type="text"
          placeholder="My House, The Office, ..."
          value={inputDate.place}
          onChange={(e) => {
            e.preventDefault();
            setInputDate((date: any) => ({
              ...date,
              place: e.target.value,
            }));
          }}
        /> */}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          The date you'd like to begin your intention.
        </label>
        <Datepicker setInputDate={setInputDate} />
      </div>
      <div className="flex">
        <button
          onClick={(e) => {
            e.preventDefault();
            handleSubmission(
              `* Your What's Next Intention: ${inputDate.intention}.
* Days of the week you'll work on your What's Next Intention: ${inputDate.days}.
* Place you'll do it: ${inputDate.place}. 
* The date you'd like to begin: ${inputDate.start_date}.
* You should plan to fulfill your intention: Within the next 6 weeks.`
            );
            setDisabledSend(true);
          }}
          disabled={
            inputDate.intention == "" ||
            inputDate.days === "" ||
            // inputDate.time === "" ||
            inputDate.place === "" ||
            inputDate.start_date === "" ||
            // inputDate.end_date === "" ||
            disabledSend
          }
          className="btn bg-indigo-500 hover:bg-indigo-600 text-white whitespace-nowrap h-10"
        >
          Generate Calendar Invite -&gt;
        </button>
      </div>
    </div>
  );
};

export default FormDate;
