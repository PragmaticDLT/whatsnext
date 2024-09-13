export default function TestPanel({
  changeAssistant1,
  changeAssistant2,
  changeAssistant3,
}) {
  return (
    <div className="sticky w-full">
      <div className="flex-col">
        <div className="flex-row">
          <button
            className="btn bg-slate-500 text-slate-100 hover:bg-slate-600"
            onClick={() => changeAssistant1()}
          >
            Bot 1
          </button>
          <button
            className="btn bg-slate-500 text-slate-100 hover:bg-slate-600"
            onClick={() => changeAssistant2()}
          >
            Bot 2
          </button>
          <button
            className="btn bg-slate-500 text-slate-100 hover:bg-slate-600"
            onClick={() => changeAssistant3()}
          >
            Bot 3
          </button>
        </div>
      </div>
    </div>
  );
}
