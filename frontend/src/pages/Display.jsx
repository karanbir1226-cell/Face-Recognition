import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

function Display() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const recognitionTimerRef = useRef(null);
  const attendanceTimerRef = useRef(null);
  const clockTimerRef = useRef(null);

  const recognizingRef = useRef(false);

  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const [student, setStudent] = useState(null);
  const [message, setMessage] = useState(
    "Waiting for face..."
  );

  const [confidence, setConfidence] = useState(null);
  const [attendanceCount, setAttendanceCount] =
    useState(0);

  const [currentTime, setCurrentTime] =
    useState(new Date());

  // ==========================================
  // GET TODAY'S DATE
  // ==========================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ==========================================
  // LOAD TODAY'S ATTENDANCE
  // ==========================================

  const fetchTodayAttendance =
    useCallback(async () => {
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
          throw new Error(
            "Failed to fetch attendance"
          );
        }

        const data = await response.json();

        const todayDate = getTodayDate();

        const todayRecords = data.filter(
          (record) =>
            record.date === todayDate &&
            record.status === "Present"
        );

        setAttendanceCount(
          todayRecords.length
        );
      } catch (error) {
        console.error(
          "Attendance count error:",
          error
        );
      }
    }, []);

  // ==========================================
  // START CAMERA
  // ==========================================

  const startCamera = async () => {
    try {
      setCameraError("");

      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            video: {
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
              facingMode: "user",
            },
            audio: false,
          }
        );

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject =
          stream;
      }

      setCameraStarted(true);

      setStudent(null);

      setConfidence(null);

      setMessage(
        "Looking for your face..."
      );
    } catch (error) {
      console.error(
        "Camera error:",
        error
      );

      setCameraError(
        "Camera access nahi mil raha. Browser me camera permission allow karo."
      );
    }
  };

  // ==========================================
  // STOP CAMERA
  // ==========================================

  const stopCamera = () => {
    if (
      recognitionTimerRef.current
    ) {
      clearInterval(
        recognitionTimerRef.current
      );

      recognitionTimerRef.current =
        null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;
    }

    setCameraStarted(false);

    recognizingRef.current =
      false;

    setStudent(null);

    setConfidence(null);

    setMessage(
      "Camera stopped. Start camera to continue."
    );
  };

  // ==========================================
  // FACE RECOGNITION
  // ==========================================

  const recognizeFace =
    useCallback(async () => {
      if (
        !videoRef.current ||
        !canvasRef.current ||
        recognizingRef.current
      ) {
        return;
      }

      if (
        videoRef.current.videoWidth === 0 ||
        videoRef.current.videoHeight === 0
      ) {
        return;
      }

      recognizingRef.current = true;

      try {
        const video =
          videoRef.current;

        const canvas =
          canvasRef.current;

        canvas.width =
          video.videoWidth;

        canvas.height =
          video.videoHeight;

        const context =
          canvas.getContext("2d");

        context.drawImage(
          video,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const image =
          canvas.toDataURL(
            "image/jpeg",
            0.85
          );

        const response =
          await fetch(
            "http://127.0.0.1:8000/recognize/",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                image: image,
              }),
            }
          );

        if (!response.ok) {
          throw new Error(
            "Recognition request failed"
          );
        }

        const data =
          await response.json();

        if (data.recognized) {
          setStudent({
            name: data.name,
            student_id:
              data.student_id,
          });

          setConfidence(
            data.confidence
          );

          setMessage(
            data.message
          );

          if (
            data.message ===
            "Attendance marked successfully"
          ) {
            await fetchTodayAttendance();
          }
        } else {
          setStudent(null);

          setConfidence(null);

          setMessage(
            data.message ||
              "Unknown face"
          );
        }
      } catch (error) {
        console.error(
          "Recognition error:",
          error
        );

        setMessage(
          "Recognition service unavailable"
        );
      } finally {
        recognizingRef.current =
          false;
      }
    }, [fetchTodayAttendance]);

  // ==========================================
  // START RECOGNITION
  // ==========================================

  const startRecognition =
    useCallback(() => {
      if (
        recognitionTimerRef.current
      ) {
        clearInterval(
          recognitionTimerRef.current
        );
      }

      recognizeFace();

      recognitionTimerRef.current =
        setInterval(() => {
          recognizeFace();
        }, 2000);
    }, [recognizeFace]);

  // ==========================================
  // CLOCK
  // ==========================================

  useEffect(() => {
    clockTimerRef.current =
      setInterval(() => {
        setCurrentTime(
          new Date()
        );
      }, 1000);

    return () => {
      if (clockTimerRef.current) {
        clearInterval(
          clockTimerRef.current
        );

        clockTimerRef.current =
          null;
      }
    };
  }, []);

  // ==========================================
  // LOAD ATTENDANCE
  // ==========================================

  /* eslint-disable react-hooks/set-state-in-effect */

  useEffect(() => {
    fetchTodayAttendance();

    attendanceTimerRef.current =
      setInterval(() => {
        fetchTodayAttendance();
      }, 5000);

    return () => {
      if (
        attendanceTimerRef.current
      ) {
        clearInterval(
          attendanceTimerRef.current
        );

        attendanceTimerRef.current =
          null;
      }
    };
  }, [fetchTodayAttendance]);

  /* eslint-enable react-hooks/set-state-in-effect */

  // ==========================================
  // START RECOGNITION WHEN CAMERA STARTS
  // ==========================================

  useEffect(() => {
    if (cameraStarted) {
      startRecognition();
    }

    return () => {
      if (
        recognitionTimerRef.current
      ) {
        clearInterval(
          recognitionTimerRef.current
        );

        recognitionTimerRef.current =
          null;
      }
    };
  }, [cameraStarted, startRecognition]);

  // ==========================================
  // CLEANUP
  // ==========================================

  useEffect(() => {
    return () => {
      if (
        recognitionTimerRef.current
      ) {
        clearInterval(
          recognitionTimerRef.current
        );
      }

      if (
        attendanceTimerRef.current
      ) {
        clearInterval(
          attendanceTimerRef.current
        );
      }

      if (clockTimerRef.current) {
        clearInterval(
          clockTimerRef.current
        );
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, []);

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formattedTime =
    currentTime.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );

  const formattedDate =
    currentTime.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="border-b border-slate-800 bg-slate-950/95 px-8 py-5 backdrop-blur">

        <div className="mx-auto flex max-w-[1600px] items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Face Attendance
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Live Attendance Display
            </p>
          </div>

          <div className="flex items-center gap-4">

            {/* DATE & TIME */}

            <div className="hidden text-right md:block">

              <p className="text-sm font-medium text-slate-300">
                {formattedDate}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {formattedTime}
              </p>

            </div>

            {/* ATTENDANCE COUNT */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-3">

              <p className="text-xs uppercase tracking-wider text-slate-500">
                Today's Attendance
              </p>

              <p className="mt-1 text-center text-2xl font-bold text-white">
                {attendanceCount}
              </p>

            </div>

            {/* CAMERA STATUS */}

            <div
              className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold ${
                cameraStarted
                  ? "bg-green-500/10 text-green-400"
                  : "bg-slate-900 text-slate-500"
              }`}
            >

              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  cameraStarted
                    ? "animate-pulse bg-green-400"
                    : "bg-slate-600"
                }`}
              />

              {cameraStarted
                ? "Camera Active"
                : "Camera Offline"}

            </div>

          </div>
        </div>
      </header>

      {/* ======================================
          MAIN
      ====================================== */}

      <main className="mx-auto grid min-h-[calc(100vh-110px)] max-w-[1600px] grid-cols-1 gap-8 p-8 lg:grid-cols-3">

        {/* ====================================
            CAMERA SECTION
        ==================================== */}

        <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-black shadow-2xl lg:col-span-2">

          {!cameraStarted && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950">

              <div className="px-6 text-center">

                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border border-slate-800 bg-slate-900 text-5xl">
                  📷
                </div>

                <h2 className="mt-7 text-3xl font-bold">
                  Camera Ready
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
                  Start the camera to begin
                  automatic face recognition
                  and attendance marking.
                </p>

                <button
                  onClick={startCamera}
                  className="mt-7 rounded-xl bg-white px-8 py-3.5 font-semibold text-slate-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-200"
                >
                  Start Camera
                </button>

              </div>

            </div>
          )}

          {/* CAMERA */}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full min-h-[620px] w-full object-cover"
          />

          {/* SCAN FRAME */}

          {cameraStarted && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">

              <div className="relative h-[420px] w-[330px] rounded-[50%] border-2 border-white/40">

                {/* TOP LEFT */}

                <div className="absolute -left-1 -top-1 h-12 w-12 rounded-tl-3xl border-l-4 border-t-4 border-white" />

                {/* TOP RIGHT */}

                <div className="absolute -right-1 -top-1 h-12 w-12 rounded-tr-3xl border-r-4 border-t-4 border-white" />

                {/* BOTTOM LEFT */}

                <div className="absolute -bottom-1 -left-1 h-12 w-12 rounded-bl-3xl border-b-4 border-l-4 border-white" />

                {/* BOTTOM RIGHT */}

                <div className="absolute -bottom-1 -right-1 h-12 w-12 rounded-br-3xl border-b-4 border-r-4 border-white" />

                {/* SCANNING LINE */}

                <div className="absolute left-6 right-6 top-1/2 h-px animate-pulse bg-white/60" />

              </div>

            </div>
          )}

          {/* BOTTOM MESSAGE */}

          {cameraStarted && (
            <div className="absolute bottom-6 left-6 rounded-2xl border border-white/10 bg-black/65 px-6 py-4 backdrop-blur-md">

              <div className="flex items-center gap-3">

                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    student
                      ? "bg-green-400"
                      : "animate-pulse bg-blue-400"
                  }`}
                />

                <p className="text-sm font-medium text-white">
                  {student
                    ? "Face recognized"
                    : message}
                </p>

              </div>

            </div>
          )}

          <canvas
            ref={canvasRef}
            className="hidden"
          />

        </section>

        {/* ====================================
            RECOGNITION PANEL
        ==================================== */}

        <section className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Recognition Status
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {student
                ? "Student Recognized"
                : "Waiting for Student"}
            </h2>

          </div>

          {/* ==================================
              RECOGNIZED STUDENT
          ================================== */}

          <div className="flex flex-1 flex-col items-center justify-center py-8">

            {student ? (
              <div className="w-full text-center">

                {/* SUCCESS ICON */}

                <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-white text-6xl font-bold text-slate-950 shadow-xl">

                  <div className="absolute inset-0 animate-ping rounded-full border border-green-400/30" />

                  {student.name
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <div className="mt-8">

                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
                    Student Found
                  </p>

                  <h3 className="mt-3 text-4xl font-bold tracking-tight">
                    {student.name}
                  </h3>

                  <p className="mt-2 text-lg font-medium text-slate-400">
                    {student.student_id}
                  </p>

                </div>

                {/* PRESENT CARD */}

                <div className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/10 p-6">

                  <p className="text-xs font-semibold uppercase tracking-wider text-green-400">
                    Attendance Status
                  </p>

                  <p className="mt-2 text-3xl font-bold text-green-400">
                    ✓ Present
                  </p>

                </div>

                {/* CONFIDENCE */}

                {confidence !== null && (
                  <div className="mt-6">

                    <div className="flex items-center justify-between text-sm">

                      <span className="text-slate-500">
                        Recognition Confidence
                      </span>

                      <span className="font-bold text-white">
                        {confidence}
                      </span>

                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">

                      <div
                        className="h-full rounded-full bg-green-400 transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              100 -
                                Number(
                                  confidence
                                ),
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>
                )}

                {/* MESSAGE */}

                <p
                  className={`mt-5 text-sm font-medium ${
                    message ===
                    "Attendance marked successfully"
                      ? "text-green-400"
                      : "text-slate-500"
                  }`}
                >
                  {message}
                </p>

                {/* CURRENT TIME */}

                <p className="mt-2 text-xs text-slate-600">
                  {formattedTime}
                </p>

              </div>
            ) : (
              /* =================================
                 WAITING STATE
              ================================= */

              <div className="text-center">

                <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-6xl">

                  <div className="absolute inset-0 animate-pulse rounded-full border border-slate-600" />

                  👤

                </div>

                <h3 className="mt-8 text-2xl font-bold text-slate-300">
                  Ready to Scan
                </h3>

                <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
                  Please look directly at
                  the camera to identify
                  the student.
                </p>

                <div className="mt-6 rounded-xl bg-slate-800/70 px-5 py-3">

                  <p className="text-sm text-slate-400">
                    {message}
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* ==================================
              CONTROL SECTION
          ================================== */}

          <div className="border-t border-slate-800 pt-6">

            <button
              onClick={
                cameraStarted
                  ? stopCamera
                  : startCamera
              }
              className={`w-full rounded-xl px-5 py-4 font-semibold transition ${
                cameraStarted
                  ? "bg-slate-800 text-white hover:bg-slate-700"
                  : "bg-white text-slate-950 hover:bg-slate-200"
              }`}
            >
              {cameraStarted
                ? "Stop Camera"
                : "Start Camera"}
            </button>

            {cameraError && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">

                <p className="text-center text-sm leading-5 text-red-400">
                  {cameraError}
                </p>

              </div>
            )}

            <p className="mt-4 text-center text-xs text-slate-600">
              Automatic recognition runs
              every 2 seconds
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Display;