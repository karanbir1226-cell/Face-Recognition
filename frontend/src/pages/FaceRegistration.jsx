import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

function FaceRegistration() {
  const { id } = useParams();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const captureTimerRef = useRef(null);

  const [cameraStarted, setCameraStarted] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [cameraError, setCameraError] = useState("");
  const [saved, setSaved] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const TOTAL_SAMPLES = 15;

  // =========================
  // START CAMERA
  // =========================

  const startCamera = async () => {
    try {
      setCameraError("");
      setCapturedImages([]);
      setSaved(false);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      setCameraStarted(true);
    } catch (error) {
      console.error("Camera error:", error);

      setCameraError(
        "Camera access nahi mil raha. Browser me camera permission allow karo."
      );
    }
  };

  // =========================
  // CONNECT STREAM TO VIDEO
  // =========================

  useEffect(() => {
    if (!cameraStarted) return;

    const video = videoRef.current;
    const stream = streamRef.current;

    if (!video || !stream) return;

    video.srcObject = stream;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error("Video play error:", error);
      }
    };

    playVideo();
  }, [cameraStarted]);

  // =========================
  // CAPTURE ONE SAMPLE
  // =========================

  const captureSingleSample = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      return null;
    }

    if (
      video.readyState < 2 ||
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL("image/jpeg", 0.85);
  };

  // =========================
  // CAPTURE 15 SAMPLES
  // =========================

  const startCapture = () => {
    if (!cameraStarted || capturing) {
      return;
    }

    setCapturedImages([]);
    setSaved(false);
    setCameraError("");
    setCapturing(true);

    let count = 0;

    captureTimerRef.current = setInterval(() => {
      const image = captureSingleSample();

      if (!image) {
        return;
      }

      count += 1;

      setCapturedImages((previous) => [
        ...previous,
        image,
      ]);

      if (count >= TOTAL_SAMPLES) {
        clearInterval(captureTimerRef.current);
        captureTimerRef.current = null;

        setCapturing(false);

        // Stop camera
        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) => {
              track.stop();
            });

          streamRef.current = null;
        }

        setCameraStarted(false);
      }
    }, 500);
  };

  // =========================
  // RETAKE
  // =========================

  const retake = async () => {
    if (captureTimerRef.current) {
      clearInterval(captureTimerRef.current);
      captureTimerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    setCapturedImages([]);
    setSaved(false);
    setCapturing(false);
    setCameraStarted(false);

    await startCamera();
  };

  // =========================
  // SAVE FACE SAMPLES
  // =========================

  const saveFace = async () => {
    if (capturedImages.length === 0) {
      return;
    }

    try {
      setCameraError("");

      const response = await fetch(
        `http://https://face-recognition-2-4pc8.onrender.com/students/${id}/face`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
          body: JSON.stringify({
            face_image: JSON.stringify(
              capturedImages
            ),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();

        throw new Error(
          errorData || "Failed to register face"
        );
      }

      const data = await response.json();

      console.log("Face registered:", data);

      setSaved(true);
    } catch (error) {
      console.error(
        "Face registration error:",
        error
      );

      setCameraError(
        "Face save nahi ho paya. Backend server check karo."
      );
    }
  };

  // =========================
  // CLEANUP
  // =========================

  useEffect(() => {
    return () => {
      if (captureTimerRef.current) {
        clearInterval(captureTimerRef.current);
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current = null;
      }
    };
  }, []);

  // =========================
  // UI
  // =========================

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div>
        <Link
          to={`/students/${id}`}
          className="text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          ← Back to Student Details
        </Link>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Face Registration
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Capture multiple face samples for better recognition accuracy.
        </p>
      </div>


      {/* MAIN GRID */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* CAMERA SECTION */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

          {/* CAMERA HEADER */}

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Camera
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Keep your face centered and move slightly during capture.
              </p>
            </div>

            {cameraStarted && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Camera Active
              </span>
            )}

          </div>


          {/* CAMERA CONTAINER */}

          <div className="relative overflow-hidden rounded-2xl bg-slate-950">

            {/* VIDEO IS ALWAYS RENDERED */}

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-[520px] w-full object-cover ${
                cameraStarted
                  ? "block"
                  : "hidden"
              }`}
            />


            {/* CAPTURED IMAGE */}

            {!cameraStarted &&
              capturedImages.length > 0 && (
                <img
                  src={
                    capturedImages[
                      capturedImages.length - 1
                    ]
                  }
                  alt="Captured face"
                  className="h-[520px] w-full object-cover"
                />
              )}


            {/* CAMERA OFF SCREEN */}

            {!cameraStarted &&
              capturedImages.length === 0 && (
                <div className="flex h-[520px] items-center justify-center bg-slate-950">

                  <div className="text-center">

                    <div className="text-6xl">
                      📷
                    </div>

                    <p className="mt-4 text-sm text-slate-400">
                      Camera is not started
                    </p>

                  </div>

                </div>
              )}


            {/* CAPTURE PROGRESS */}

            {capturing && (
              <div className="absolute bottom-5 left-1/2 w-[80%] -translate-x-1/2">

                <div className="rounded-xl bg-black/70 p-4 backdrop-blur">

                  <div className="flex items-center justify-between text-sm text-white">

                    <span>
                      Capturing face samples...
                    </span>

                    <span className="font-bold">
                      {capturedImages.length}/{TOTAL_SAMPLES}
                    </span>

                  </div>


                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-700">

                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{
                        width: `${
                          (capturedImages.length /
                            TOTAL_SAMPLES) *
                          100
                        }%`,
                      }}
                    />

                  </div>

                </div>

              </div>
            )}

          </div>


          {/* HIDDEN CANVAS */}

          <canvas
            ref={canvasRef}
            className="hidden"
          />


          {/* BUTTONS */}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">

            {/* START CAMERA */}

            {!cameraStarted &&
              capturedImages.length === 0 && (
                <button
                  onClick={startCamera}
                  className="flex-1 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Start Camera
                </button>
              )}


            {/* CAPTURE */}

            {cameraStarted &&
              !capturing && (
                <button
                  onClick={startCapture}
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Capture 15 Samples
                </button>
              )}


            {/* CAPTURING */}

            {capturing && (
              <button
                disabled
                className="flex-1 cursor-not-allowed rounded-xl bg-slate-300 px-5 py-3 text-sm font-semibold text-slate-500"
              >
                Capturing...
              </button>
            )}


            {/* RETAKE + SAVE */}

            {!capturing &&
              capturedImages.length > 0 &&
              !saved && (
                <>
                  <button
                    onClick={retake}
                    className="flex-1 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Retake
                  </button>

                  <button
                    onClick={saveFace}
                    className="flex-1 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Save Face
                  </button>
                </>
              )}

          </div>


          {/* SAMPLE COUNT */}

          {capturedImages.length > 0 && (
            <div className="mt-5 rounded-xl bg-slate-50 p-4">

              <div className="flex items-center justify-between">

                <p className="text-sm font-semibold text-slate-700">
                  Face Samples
                </p>

                <p className="text-sm font-bold text-slate-900">
                  {capturedImages.length} / {TOTAL_SAMPLES}
                </p>

              </div>

            </div>
          )}


          {/* SUCCESS */}

          {saved && (
            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4">

              <p className="font-semibold text-green-700">
                ✓ Face registered successfully
              </p>

              <p className="mt-1 text-sm text-green-600">
                {capturedImages.length} face samples were saved and the model was retrained.
              </p>

            </div>
          )}


          {/* ERROR */}

          {cameraError && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">

              <p className="text-sm text-red-600">
                {cameraError}
              </p>

            </div>
          )}

        </div>


        {/* GUIDELINES */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900">
            Registration Tips
          </h2>


          <div className="mt-6 space-y-5">

            {/* 1 */}

            <div className="flex gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                1
              </div>

              <div>

                <p className="font-semibold text-slate-800">
                  Good Lighting
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Make sure your face is clearly visible.
                </p>

              </div>

            </div>


            {/* 2 */}

            <div className="flex gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                2
              </div>

              <div>

                <p className="font-semibold text-slate-800">
                  Look at Camera
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Keep your face centered.
                </p>

              </div>

            </div>


            {/* 3 */}

            <div className="flex gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                3
              </div>

              <div>

                <p className="font-semibold text-slate-800">
                  Slight Movement
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Move your head slightly left and right during capture.
                </p>

              </div>

            </div>


            {/* 4 */}

            <div className="flex gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                4
              </div>

              <div>

                <p className="font-semibold text-slate-800">
                  Stay Natural
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Avoid masks, sunglasses and face obstruction.
                </p>

              </div>

            </div>

          </div>


          {/* STUDENT ID */}

          <div className="mt-8 rounded-xl bg-slate-50 p-4">

            <p className="text-xs font-semibold text-slate-700">
              Student ID
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {id}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default FaceRegistration;