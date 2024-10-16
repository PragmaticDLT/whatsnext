export default function TestPanel({
  changeAssistant1,
  changeAssistant2,
  changeAssistant3,
  question,
  setTestPanelOpen,
  assistantId,
}) {
  return (
    <div className="sticky w-full border-rose-500 border-solid border p-2">
      <div className="flex flex-row justify-between">
        <h5>Developer Options</h5>
        <button
          className="btn bg-rose-500 text-rose-100 hover:bg-rose-600"
          onClick={() => {
            localStorage.removeItem("testPanel");
            setTestPanelOpen(false);
          }}
        >
          Deactive Developer Mode
        </button>
      </div>
      <div className="flex-col">
        <div className="flex flex-row gap-2">
          <button
            className="btn bg-slate-500 text-slate-100 hover:bg-slate-600"
            onClick={() => changeAssistant1()}
          >
            Bot 1 - Questions - (1 - 2)
          </button>
          <button
            className="btn bg-slate-500 text-slate-100 hover:bg-slate-600"
            onClick={() => changeAssistant2()}
          >
            Bot 2 (3 - 11)
          </button>
          <button
            className="btn bg-slate-500 text-slate-100 hover:bg-slate-600"
            onClick={() => changeAssistant3()}
          >
            Bot 3 - Step 2 - (12 - 28)
          </button>
        </div>
        <div className="flex-row">
          Current Bot:{" "}
          {assistantId == process.env.NEXT_PUBLIC_1_ASSISTANT_ID
            ? "Bot 1"
            : assistantId == process.env.NEXT_PUBLIC_2_ASSISTANT_ID
            ? "Bot 2"
            : "Bot 3"}
        </div>
        <div className="flex-row">Current Question: {question}</div>
      </div>
    </div>
  );
}
