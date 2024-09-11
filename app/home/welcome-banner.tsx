export default function WelcomeBanner() {
  return (
    <div className="relative bg-indigo-200 dark:bg-indigo-500 p-4 sm:p-6 rounded-sm overflow-hidden mb-8 mx-4">
      <div className="relative">
        <h1
          className="text-2xl md:text-3xl text-slate-800 dark:text-slate-100 font-bold mb-1"
          style={{ fontFamily: "Monorama" }}
        >
          What's Next Life Coach{" "}
        </h1>
        <p className="dark:text-indigo-200">
          Get started by clicking "Let's Get Started!" or type it in the chatbox
          below.
        </p>
      </div>
    </div>
  );
}
