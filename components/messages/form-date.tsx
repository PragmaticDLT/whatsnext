import React, { useEffect, useMemo, useState } from "react";
import Datepicker from "../datepicker";
import { useChatsContext } from "../../contexts/chats-context";

const FormDate = ({ handleSubmission, setMessageInput }) => {
  const { inputDate, setInputDate, parsedJson } = useChatsContext();
  const [disabledSend, setDisabledSend] = useState(false);

  // To set users intention on the intention input field by default
  useEffect(() => {
    setInputDate((date: any) => ({
      ...date,
      intention: parsedJson["Finalized What’s Next Intention"],
    }));
  }, [parsedJson])

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
          value={parsedJson["Finalized What’s Next Intention"]}
        >

        </textarea>
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
      </div>
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
* Day of the week you'll work on your What's Next Intention: ${inputDate.days}.
* Place you'll do it: ${inputDate.place}. 
* The date you'd like to begin: ${inputDate.start_date}.
* You should plan to fulfill your intention: Within the next 6 weeks.`
            );
            setDisabledSend(true);
          }}
          disabled={
            inputDate.intention == "" ||
            inputDate.days === "" ||
            inputDate.place === "" ||
            inputDate.start_date === "" ||
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
