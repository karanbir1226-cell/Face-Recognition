import { useCallback, useEffect, useRef, useState } from "react";

function LiveAttendance() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionIntervalRef = useRef(null);
  const attendanceIntervalRef = useRef(null);
  const processingRef = useRef(false);

  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [recognizedStudent, setRecognizedStudent] = useState(null);
  const [recognitionStatus, setRecognitionStatus] =
    useState("Waiting for Student");

  const [todayAttendance, setTodayAttendance] = useState(0);

  // =========================
  // GET TODAY'S DATE
  // =========================

  const getTodayDate = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // =========================
  // FETCH TODAY'S ATTENDANCE
  // =========================

  const fetchTodayAttendance = useCallback(async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/attendance/",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance");
      }

      const data = await response.json();
      const today = getTodayDate();

      const todayRecords = data.filter(
        (record) =>
          record.date === today &&
          record.status === "Present"
      );

      setTodayAttendance(todayRecords.length);
    } catch (error) {
      console.error("Attendance fetch error:", error);
    }
  }, []);

  // =========================
  // START CAMERA
  // =========================

  const startCamera = async () => {
    try {
      setCameraError("");

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: false,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraStarted(true);
      setRecognitionStatus("Ready to Scan");

      fetchTodayAttendance();

      attendanceIntervalRef.current =
        setInterval(() => {
          fetchTodayAttendance();
        }, 5000);

      recognitionIntervalRef.current =
        setInterval(() => {
          recognizeFace();
        }, 2000);
    } catch (error) {
      console.error("Camera error:", error);

      setCameraError(
        "Camera access nahi mil raha. Browser me camera permission allow karo."
      );

      setCameraStarted(false);
    }
  };

  // =========================
  // STOP CAMERA
  // =========================

  const stopCamera = () => {
    if (recognitionIntervalRef.current) {
      clearInterval(recognitionIntervalRef.current);
      recognitionIntervalRef.current = null;
    }

    if (attendanceIntervalRef.current) {
      clearInterval(attendanceIntervalRef.current);
      attendanceIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    processingRef.current = false;

    setCameraStarted(false);
    setRecognizedStudent(null);
    setRecognitionStatus("Waiting for Student");
  };

  // =========================
  // RECOGNIZE FACE
  // =========================

  const recognizeFace = async () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !streamRef.current
    ) {
      return;
    }

    if (processingRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return;
    }

    processingRef.current = true;

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");

      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const image = canvas.toDataURL(
        "image/jpeg",
        0.8
      );

      const response = await fetch(
        "http://127.0.0.1:8000/recognize/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Recognition request failed"
        );
      }

      const data = await response.json();

      // =========================
      // FACE RECOGNIZED
      // =========================

      if (data.recognized) {
        setRecognitionStatus(
          "Student Recognized"
        );

        setRecognizedStudent({
          student_id: data.student_id,
          name: data.name,
          confidence: data.confidence,
          date: data.date,
          time: data.time,
          status: data.status || "Present",
          message: data.message,
        });

        fetchTodayAttendance();
      }

      // =========================
      // UNKNOWN FACE
      // =========================

      else if (
        data.message === "Unknown face"
      ) {
        setRecognitionStatus(
          "Waiting for Student"
        );

        setRecognizedStudent(null);
      }

      // =========================
      // NO FACE
      // =========================

      else if (
        data.message === "No face detected"
      ) {
        setRecognitionStatus(
          "Waiting for Student"
        );

        setRecognizedStudent(null);
      }

      // =========================
      // OTHER RESPONSE
      // =========================

      else {
        setRecognitionStatus(
          "Waiting for Student"
        );

        setRecognizedStudent(null);
      }
    } catch (error) {
      console.error(
        "Recognition error:",
        error
      );
    } finally {
      processingRef.current = false;
    }
  };

  // =========================
  // CLEANUP
  // =========================

  useEffect(() => {
    return () => {
      if (recognitionIntervalRef.current) {
        clearInterval(
          recognitionIntervalRef.current
        );
      }

      if (attendanceIntervalRef.current) {
        clearInterval(
          attendanceIntervalRef.current
        );
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Attendance System
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Live Attendance
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Real-time face recognition and automatic attendance marking.
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-2 self-start rounded-full px-4 py-2 text-xs font-semibold md:self-auto ${
            cameraStarted
              ? "bg-green-100 text-green-700"
              : "bg-slate-200 text-slate-500"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              cameraStarted
                ? "bg-green-500"
                : "bg-slate-400"
            }`}
          />

          {cameraStarted
            ? "Camera Active"
            : "Camera Offline"}
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* CAMERA CARD */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">

          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Live Recognition
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Live Camera
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Look directly at the camera to identify the student.
            </p>
          </div>

          {/* CAMERA */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-950 shadow-inner">

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="aspect-video w-full object-cover"
            />

            {/* CAMERA OFFLINE */}
            {!cameraStarted && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950">

                <div className="text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-4xl">
                    📷
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-white">
                    Camera is Offline
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Start the camera to begin recognition.
                  </p>
                </div>

              </div>
            )}

            {/* FACE GUIDE */}
            {cameraStarted && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

                <div className="relative h-72 w-56 rounded-[50%] border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.08)]">

                  <div className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 bg-white/40" />

                </div>

              </div>
            )}

            {/* TOP STATUS */}
            <div className="absolute left-4 top-4 rounded-full bg-black/50 px-4 py-2 backdrop-blur">

              <div className="flex items-center gap-2">

                <span
                  className={`h-2 w-2 rounded-full ${
                    cameraStarted
                      ? "bg-green-400"
                      : "bg-slate-400"
                  }`}
                />

                <span className="text-xs font-semibold text-white">
                  {cameraStarted
                    ? "Scanning"
                    : "Offline"}
                </span>

              </div>

            </div>

            {/* BOTTOM STATUS */}
            <div className="absolute bottom-4 left-4 rounded-xl bg-black/60 px-4 py-3 backdrop-blur">

              <p className="text-xs font-medium text-slate-300">
                Recognition
              </p>

              <p className="mt-0.5 text-sm font-semibold text-white">
                {cameraStarted
                  ? "Automatic scanning active"
                  : "Waiting to start"}
              </p>

            </div>

          </div>

          <canvas
            ref={canvasRef}
            className="hidden"
          />

          {/* ERROR */}
          {cameraError && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                !
              </span>

              <p className="text-sm text-red-700">
                {cameraError}
              </p>

            </div>
          )}

          {/* BUTTON */}
          <div className="mt-5">

            {!cameraStarted ? (
              <button
                onClick={startCamera}
                className="w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md"
              >
                📷 Start Camera
              </button>
            ) : (
              <button
                onClick={stopCamera}
                className="w-full rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                ⏹ Stop Camera
              </button>
            )}

          </div>

        </div>

        {/* RECOGNITION CARD */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Recognition
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {recognitionStatus}
              </h2>
            </div>

            <div
              className={`h-3 w-3 rounded-full ${
                recognizedStudent
                  ? "bg-green-500"
                  : "bg-slate-300"
              }`}
            />
          </div>

          {!recognizedStudent ? (
            <div className="mt-10 text-center">

              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-slate-200 bg-slate-50 shadow-inner">
                <span className="text-5xl">
                  👤
                </span>
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-800">
                Ready to Scan
              </h3>

              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                Please look directly at the camera to identify the student.
              </p>

              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Status
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-600">
                  Unknown face
                </p>
              </div>

            </div>
          ) : (
            <div className="mt-8">

              {/* AVATAR */}
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-slate-900 text-4xl font-bold text-white shadow-lg">
                {recognizedStudent.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div className="mt-6 text-center">

                <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-green-700">
                  ✓ Student Found
                </span>

                <h3 className="mt-3 text-2xl font-bold leading-tight text-slate-900">
                  {recognizedStudent.name}
                </h3>

                <p className="mt-2 inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600">
                  {recognizedStudent.student_id}
                </p>

              </div>

              {/* ATTENDANCE */}
              <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">

                <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                  Attendance Status
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-2xl font-bold text-green-600">
                    ✓ {recognizedStudent.status}
                  </p>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Present
                  </span>
                </div>

              </div>

              {/* DETAILS */}
              <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Confidence
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {recognizedStudent.confidence}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-400">
                    Time
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-800">
                    {recognizedStudent.time}
                  </p>
                </div>

              </div>

              {recognizedStudent.message && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs leading-5 text-slate-500">
                  {recognizedStudent.message}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        {/* TODAY */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Today's Attendance
              </p>

              <p className="mt-3 text-4xl font-bold text-slate-900">
                {todayAttendance}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Students recognized today
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-lg">
              ✓
            </div>

          </div>

        </div>

        {/* RECOGNITION */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Recognition
              </p>

              <p className="mt-3 text-2xl font-bold text-green-600">
                Active
              </p>

              <p className="mt-1 text-sm text-slate-500">
                System checks every 2 seconds
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
              <span className="h-3 w-3 rounded-full bg-green-500" />
            </div>

          </div>

        </div>

        {/* MODE */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Attendance Mode
              </p>

              <p className="mt-3 text-2xl font-bold text-slate-900">
                Automatic
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Duplicate attendance prevented
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-lg">
              ⚡
            </div>

          </div>

        </div>

      </div>

      {/* HOW IT WORKS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Process
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            How Live Attendance Works
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            The system automatically handles recognition and attendance.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-slate-700 shadow-sm">
              01
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              Start Camera
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Start the webcam to begin live face recognition.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-slate-700 shadow-sm">
              02
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              Recognize Face
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              The system automatically checks the face every 2 seconds.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-bold text-slate-700 shadow-sm">
              03
            </div>

            <h3 className="mt-4 font-bold text-slate-900">
              Mark Attendance
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              A recognized student is automatically marked present.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default LiveAttendance;