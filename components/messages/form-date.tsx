import React, { useEffect, useMemo, useState } from "react";
import Datepicker from "../datepicker";
import { useChatsContext } from "../../contexts/chats-context";

const FormDate = ({ handleSubmission, setMessageInput }) => {
  const { inputDate, setInputDate } = useChatsContext();
  const [disabledSend, setDisabledSend] = useState(false);

  return (
    <div className="grid grid-cols-1 gap-2 mt-4 mb-4">
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="placeholder">
          Days of the week you'll work on your What's Next Intention
        </label>
        <input
          id="placeholder"
          className="form-input w-full"
          type="text"
          placeholder="Tuesday, Friday, ..."
          value={inputDate.days}
          onChange={(e) => {
            e.preventDefault();
            setInputDate((date: any) => ({
              ...date,
              days: e.target.value,
            }));
          }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="placeholder">
          Time of day you'll start and end work on your What's Next Intention
        </label>
        <input
          id="placeholder"
          className="form-input w-full"
          type="text"
          placeholder="8am, 10pm, ..."
          value={inputDate.time}
          onChange={(e) => {
            e.preventDefault();
            setInputDate((date: any) => ({
              ...date,
              time: e.target.value,
            }));
          }}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Place you'll do it
        </label>
        <input
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
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          The date you'd like to begin and the date you plan to have fulfilled
          your intention.
        </label>
        <Datepicker setInputDate={setInputDate} />
      </div>
      <div className="flex">
        <button
          onClick={(e) => {
            e.preventDefault();
            handleSubmission(
              `* Days of the week you'll work on your What's Next Intention: ${inputDate.days}.
* Time of day you'll start and end work on your What's Next Intention: ${inputDate.time}.
* Place you'll do it: ${inputDate.place}. 
* The date you'd like to begin: ${inputDate.start_date}.
* The date you plan to have fulfilled your intention: ${inputDate.end_date}.`
            );
            setDisabledSend(true);
          }}
          disabled={
            inputDate.days === "" ||
            inputDate.time === "" ||
            inputDate.place === "" ||
            inputDate.start_date === "" ||
            inputDate.end_date === "" ||
            disabledSend
          }
          className="btn bg-indigo-500 hover:bg-indigo-600 text-white whitespace-nowrap h-10"
        >
          Send -&gt;
        </button>
      </div>
    </div>
  );
};

export default FormDate;
