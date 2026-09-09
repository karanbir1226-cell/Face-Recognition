import {  useState } from "react";

function Settings() {
  const [settings, setSettings] = useState({
    duplicatePrevention: true,
    faceRecognition: true,
    displayScreen: true,
    showConfidence: true,
    recognitionInterval: "2",
    confidenceThreshold: "45",
  });

  

  const updateSetting = (key, value) => {
    const updatedSettings = {
      ...settings,
      [key]: value,
    };

    setSettings(updatedSettings);

    localStorage.setItem(
      "attendanceSettings",
      JSON.stringify(updatedSettings)
    );
  };

  const resetSettings = () => {
    const defaultSettings = {
      duplicatePrevention: true,
      faceRecognition: true,
      displayScreen: true,
      showConfidence: true,
      recognitionInterval: "2",
      confidenceThreshold: "45",
    };

    setSettings(defaultSettings);

    localStorage.setItem(
      "attendanceSettings",
      JSON.stringify(defaultSettings)
    );
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Configuration
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Settings
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Configure attendance, face recognition and display preferences.
        </p>
      </div>

      {/* Attendance Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            Attendance Settings
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Configure how attendance is recorded.
          </p>
        </div>

        <div className="divide-y divide-slate-100">

          {/* Duplicate Prevention */}
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="font-semibold text-slate-900">
                Duplicate Attendance Prevention
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Prevent the same student from being marked multiple times.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                updateSetting(
                  "duplicatePrevention",
                  !settings.duplicatePrevention
                )
              }
              className={`relative h-6 w-11 rounded-full transition ${
                settings.duplicatePrevention
                  ? "bg-green-500"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  settings.duplicatePrevention
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Recognition Interval */}
          <div className="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-900">
                Recognition Interval
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Time between automatic face recognition scans.
              </p>
            </div>

            <select
              value={settings.recognitionInterval}
              onChange={(e) =>
                updateSetting(
                  "recognitionInterval",
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-900"
            >
              <option value="1">1 second</option>
              <option value="2">2 seconds</option>
              <option value="3">3 seconds</option>
              <option value="5">5 seconds</option>
            </select>
          </div>

        </div>
      </div>

      {/* Face Recognition */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            Face Recognition
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Configure face recognition behaviour.
          </p>
        </div>

        <div className="divide-y divide-slate-100">

          {/* Face Recognition */}
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="font-semibold text-slate-900">
                Face Recognition
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Enable automatic face recognition.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                updateSetting(
                  "faceRecognition",
                  !settings.faceRecognition
                )
              }
              className={`relative h-6 w-11 rounded-full transition ${
                settings.faceRecognition
                  ? "bg-green-500"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  settings.faceRecognition
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Confidence Threshold */}
          <div className="flex flex-col gap-3 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-900">
                Recognition Confidence Threshold
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Current recognition threshold used by the system.
              </p>
            </div>

            <select
              value={settings.confidenceThreshold}
              onChange={(e) =>
                updateSetting(
                  "confidenceThreshold",
                  e.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-900"
            >
              <option value="35">35</option>
              <option value="40">40</option>
              <option value="45">45</option>
              <option value="50">50</option>
              <option value="55">55</option>
            </select>
          </div>

        </div>
      </div>

      {/* Display Settings */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            Display Screen
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Configure information shown on the display screen.
          </p>
        </div>

        <div className="divide-y divide-slate-100">

          {/* Display Screen */}
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="font-semibold text-slate-900">
                Display Screen
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Enable the attendance display screen.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                updateSetting(
                  "displayScreen",
                  !settings.displayScreen
                )
              }
              className={`relative h-6 w-11 rounded-full transition ${
                settings.displayScreen
                  ? "bg-green-500"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  settings.displayScreen
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Show Confidence */}
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="font-semibold text-slate-900">
                Show Recognition Confidence
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Show face recognition confidence on the display.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                updateSetting(
                  "showConfidence",
                  !settings.showConfidence
                )
              }
              className={`relative h-6 w-11 rounded-full transition ${
                settings.showConfidence
                  ? "bg-green-500"
                  : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                  settings.showConfidence
                    ? "left-6"
                    : "left-1"
                }`}
              />
            </button>
          </div>

        </div>
      </div>

      {/* System Information */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            System Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Basic information about the attendance system.
          </p>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-3">

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">
              System
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              Face Attendance
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Version
            </p>

            <p className="mt-2 font-semibold text-slate-900">
              1.0.0
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Status
            </p>

            <p className="mt-2 font-semibold text-green-600">
              ● Active
            </p>
          </div>

        </div>
      </div>

      {/* Reset */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={resetSettings}
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Reset Settings
        </button>
      </div>

    </div>
  );
}

export default Settings;