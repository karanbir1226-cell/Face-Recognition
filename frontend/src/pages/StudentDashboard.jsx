import { useEffect, useState } from "react";

function StudentDashboard() {
  const [summary, setSummary] = useState({
    total_classes: 0,
    present: 0,
    absent: 0,
    attendance_percentage: 0,
  });

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("studentToken");

        if (!token) {
          setError("Student login token not found.");
          setLoading(false);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [summaryResponse, classesResponse] =
          await Promise.all([
            fetch(
              "https://face-recognition-2-4pc8.onrender.com/attendance/my-summary",
              { headers }
            ),
            fetch(
              "https://face-recognition-2-4pc8.onrender.com/classes/my-classes",
              { headers }
            ),
          ]);

        if (!summaryResponse.ok || !classesResponse.ok) {
          throw new Error("Failed to load student data");
        }

        const summaryData = await summaryResponse.json();
        const classesData = await classesResponse.json();

        setSummary(summaryData);
        setClasses(classesData.classes || []);
      } catch (err) {
        console.error("Student dashboard error:", err);
        setError("Unable to load student data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          Student Portal
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          Student Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Keep track of your classes and attendance.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

        {/* Total Attendance */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Attendance
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                {summary.total_classes}
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Attendance records
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
              ▤
            </div>
          </div>
        </div>

        {/* Present */}
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">
                Present
              </p>

              <h2 className="mt-3 text-3xl font-bold text-green-800">
                {summary.present}
              </h2>

              <p className="mt-2 text-xs text-green-600">
                Classes attended
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-xl text-green-700">
              ✓
            </div>
          </div>
        </div>

        {/* Absent */}
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">
                Absent
              </p>

              <h2 className="mt-3 text-3xl font-bold text-red-800">
                {summary.absent}
              </h2>

              <p className="mt-2 text-xs text-red-600">
                Classes missed
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-xl text-red-700">
              !
            </div>
          </div>
        </div>

        {/* Attendance Percentage */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">
                Attendance
              </p>

              <h2 className="mt-3 text-3xl font-bold text-blue-800">
                {summary.attendance_percentage}%
              </h2>

              <p className="mt-2 text-xs text-blue-600">
                Overall attendance
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700">
              ↗
            </div>
          </div>
        </div>

      </div>

      {/* Attendance Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Attendance Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your current attendance performance
            </p>
          </div>

          <span className="text-3xl font-bold text-blue-600">
            {summary.attendance_percentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-500"
            style={{
              width: `${Math.min(
                Math.max(summary.attendance_percentage, 0),
                100
              )}%`,
            }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="font-medium text-green-600">
            {summary.present} Present
          </span>

          <span className="font-medium text-red-500">
            {summary.absent} Absent
          </span>
        </div>

      </div>

      {/* My Classes */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              My Classes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Classes you are currently enrolled in
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {classes.length}{" "}
            {classes.length === 1 ? "Class" : "Classes"}
          </span>

        </div>

        {classes.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm text-slate-500">
              You have not joined any class yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {classes.map((classItem) => (
              <div
                key={classItem.id}
                className="flex items-center justify-between p-6 transition hover:bg-slate-50"
              >

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg text-white">
                    ▣
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      {classItem.class_name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Class Code:{" "}
                      <span className="font-medium text-slate-700">
                        {classItem.class_code}
                      </span>
                    </p>
                  </div>

                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Joined
                </span>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default StudentDashboard;