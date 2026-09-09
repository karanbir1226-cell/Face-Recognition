import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("https://face-recognition-2-4pc8.onrender.com/students/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        const data = await response.json();

        const foundStudent = data.find(
          (item) => item.student_id === id
        );

        if (!foundStudent) {
          setError("Student Not Found");
          setStudent(null);
          return;
        }

        setStudent(foundStudent);
      } catch (err) {
        console.error("Error loading student:", err);
        setError("Unable to load student from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  // Loading
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm text-slate-500">
          Loading student details...
        </p>
      </div>
    );
  }

  // Error / Student not found
  if (error || !student) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          {error || "Student Not Found"}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          The requested student does not exist in the database.
        </p>

        <button
          onClick={() => navigate("/students")}
          className="mt-6 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Back to Students
        </button>
      </div>
    );
  }

  const faceRegistered = student.face_image;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link
            to="/students"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            ← Back to Students
          </Link>

          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Student Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View student information and face registration status.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to={`/students/${student.student_id}/edit`}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit Student
          </Link>

          <Link
            to={`/students/${student.student_id}/register-face`}
            className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            📸 Register Face
          </Link>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">

          {/* Avatar */}
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-4xl font-bold text-white">
            {student.name?.charAt(0).toUpperCase()}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {student.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Student ID: {student.student_id}
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-4 py-2 text-xs font-semibold ${
                  student.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {student.status}
              </span>

            </div>
          </div>

        </div>
      </div>

      {/* Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Personal Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900">
            Personal Information
          </h2>

          <div className="mt-6 space-y-5">

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Full Name
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {student.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Email
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {student.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Phone
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {student.phone || "Not available"}
              </p>
            </div>

          </div>
        </div>

        {/* Academic Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900">
            Academic Information
          </h2>

          <div className="mt-6 space-y-5">

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Course
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {student.course || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Department
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {student.department || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-slate-400">
                Semester
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {student.semester || "Not available"}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Face Registration */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Face Recognition
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Register the student's face for automatic attendance.
            </p>
          </div>

          {faceRegistered ? (
            <div className="rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              ✓ Face Registered
            </div>
          ) : (
            <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
              ⚠ Face Not Registered
            </div>
          )}

        </div>

        <div className="mt-5">

          <Link
            to={`/students/${student.student_id}/register-face`}
            className="inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {faceRegistered
              ? "📷 Update Face"
              : "📷 Start Face Registration"}
          </Link>

        </div>

      </div>

    </div>
  );
}

export default StudentDetails;