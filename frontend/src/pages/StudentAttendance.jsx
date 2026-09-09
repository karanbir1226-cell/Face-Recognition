import { useEffect, useState } from "react";

function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const token =
          localStorage.getItem("studentToken") ||
          localStorage.getItem("student_token") ||
          localStorage.getItem("access_token") ||
          localStorage.getItem("token");

        if (!token) {
          setError("Student login token not found.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "http://https://face-recognition-2-4pc8.onrender.com/attendance/my-attendance",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load attendance");
        }

        const data = await response.json();

        setAttendance(data.attendance || []);
      } catch (err) {
        console.error("Attendance error:", err);
        setError("Unable to load attendance.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // ==========================
  // ATTENDANCE STATISTICS
  // ==========================

  const totalRecords = attendance.length;

  const presentCount = attendance.filter(
    (item) => item.status === "Present"
  ).length;

  const absentCount = attendance.filter(
    (item) => item.status === "Absent"
  ).length;

  const attendancePercentage =
    totalRecords > 0
      ? Math.round((presentCount / totalRecords) * 100)
      : 0;

  // ==========================
  // LOADING
  // ==========================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"></div>
          </div>

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading attendance...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ==========================
          PAGE HEADER
      ========================== */}

      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          Attendance
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          My Attendance
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View and track your attendance records.
        </p>
      </div>

      {/* ==========================
          ERROR
      ========================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
            !
          </div>

          <div>
            <p className="font-semibold text-red-800">
              Unable to load attendance
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {!error && (
        <>
          {/* ==========================
              SUMMARY CARDS
          ========================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* Total */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Records
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-slate-900">
                    {totalRecords}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Attendance records
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-lg">
                  ▤
                </div>
              </div>
            </div>

            {/* Present */}
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Present
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-green-800">
                    {presentCount}
                  </h2>

                  <p className="mt-1 text-xs text-green-600">
                    Classes attended
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-lg font-bold text-green-700">
                  ✓
                </div>
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    Attendance Rate
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-blue-800">
                    {attendancePercentage}%
                  </h2>

                  <p className="mt-1 text-xs text-blue-600">
                    Overall attendance
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-700">
                  ↗
                </div>
              </div>
            </div>

          </div>

          {/* ==========================
              ATTENDANCE OVERVIEW
          ========================== */}

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

              <span className="text-2xl font-bold text-blue-600">
                {attendancePercentage}%
              </span>
            </div>

            <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${attendancePercentage}%`,
                }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="font-medium text-green-600">
                {presentCount} Present
              </span>

              <span className="font-medium text-red-500">
                {absentCount} Absent
              </span>
            </div>

          </div>

          {/* ==========================
              ATTENDANCE RECORDS
          ========================== */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* Table Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Attendance Records
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your recent attendance history.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {totalRecords}{" "}
                {totalRecords === 1 ? "Record" : "Records"}
              </span>

            </div>

            {/* Empty State */}
            {attendance.length === 0 ? (
              <div className="px-6 py-14 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
                  ✓
                </div>

                <h3 className="mt-4 text-base font-semibold text-slate-800">
                  No attendance records
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your attendance records will appear here.
                </p>

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="w-full min-w-[650px] text-left">

                  <thead className="bg-slate-50">
                    <tr>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Time
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {attendance.map((item) => (
                      <tr
                        key={item.id}
                        className="transition hover:bg-slate-50"
                      >

                        {/* Date */}
                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                              ▣
                            </div>

                            <div>
                              <p className="font-medium text-slate-800">
                                {item.date}
                              </p>

                              <p className="text-xs text-slate-400">
                                Attendance date
                              </p>
                            </div>

                          </div>

                        </td>

                        {/* Time */}
                        <td className="px-6 py-5">

                          <p className="text-sm font-medium text-slate-700">
                            {item.time}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Recorded time
                          </p>

                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">

                          {item.status === "Present" ? (
                            <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700">

                              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>

                              Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">

                              <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>

                              Absent
                            </span>
                          )}

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}

export default StudentAttendance;