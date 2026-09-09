import { useEffect, useState } from "react";

function Dashboard() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const [studentsResponse, attendanceResponse] =
          await Promise.all([
            fetch("http://https://face-recognition-2-4pc8.onrender.com/students/", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            fetch("http://https://face-recognition-2-4pc8.onrender.com/attendance/", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        if (!studentsResponse.ok || !attendanceResponse.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const studentsData = await studentsResponse.json();
        const attendanceData = await attendanceResponse.json();

        setStudents(studentsData);
        setAttendance(attendanceData);
      } catch (error) {
        console.error("Dashboard error:", error);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const todayAttendance = attendance.filter(
    (record) => record.date === today
  );

  const presentToday = todayAttendance.filter(
    (record) => record.status === "Present"
  ).length;

  const absentToday = Math.max(
    students.length - presentToday,
    0
  );

  const attendanceRate =
    students.length > 0
      ? Math.round((presentToday / students.length) * 100)
      : 0;

  const recentAttendance = attendance.slice(0, 5);

  const stats = [
    {
      title: "Total Students",
      value: students.length,
      description: "Registered students",
      icon: "●",
      iconBox: "bg-slate-100 text-slate-700",
      valueColor: "text-slate-900",
    },
    {
      title: "Present Today",
      value: presentToday,
      description: "Today's attendance",
      icon: "✓",
      iconBox: "bg-green-100 text-green-700",
      valueColor: "text-green-600",
    },
    {
      title: "Absent Today",
      value: absentToday,
      description: "Not marked present",
      icon: "!",
      iconBox: "bg-red-100 text-red-600",
      valueColor: "text-red-600",
    },
    {
      title: "Attendance Rate",
      value: `${attendanceRate}%`,
      description: "Today's attendance rate",
      icon: "↗",
      iconBox: "bg-blue-100 text-blue-700",
      valueColor: "text-blue-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            Loading Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please wait while we load the latest attendance data.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl font-bold text-red-600">
            !
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            Unable to Load Dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <p className="mt-4 text-xs text-slate-400">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              System Overview
            </p>
          </div>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor students and face recognition attendance.
          </p>
        </div>

        {/* Today */}
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Today
          </p>

          <p className="mt-1 text-sm font-bold text-slate-800">
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  {stat.title}
                </p>

                <p
                  className={`mt-3 text-4xl font-bold tracking-tight ${stat.valueColor}`}
                >
                  {stat.value}
                </p>
              </div>

              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${stat.iconBox}`}
              >
                {stat.icon}
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-400">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Overview */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                ✓
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Today's Attendance
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Current attendance performance
                </p>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-3xl font-bold text-blue-600">
              {attendanceRate}%
            </p>

            <p className="text-xs text-slate-400">
              Attendance rate
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-7">
          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-700"
              style={{
                width: `${attendanceRate}%`,
              }}
            />
          </div>
        </div>

        {/* Progress Info */}
        <div className="mt-4 flex flex-col justify-between gap-2 text-xs sm:flex-row">
          <span className="font-medium text-green-600">
            {presentToday} students present
          </span>

          <span className="font-medium text-red-500">
            {absentToday} students absent
          </span>

          <span className="font-medium text-slate-400">
            {students.length} total students
          </span>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

        {/* Section Header */}
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Recent Attendance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Latest attendance records from the system.
            </p>
          </div>

          <span className="w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            Latest 5 Records
          </span>
        </div>

        {/* Empty State */}
        {recentAttendance.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl text-slate-400">
              —
            </div>

            <h3 className="mt-4 font-semibold text-slate-700">
              No Attendance Records
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Attendance records will appear here after recognition.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">

              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Student
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Student ID
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Time
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentAttendance.map((record) => (
                  <tr
                    key={record.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    {/* Student */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                          {record.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {record.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Attendance Record
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-6 py-5">
                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                        {record.student_id}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {record.date}
                    </td>

                    {/* Time */}
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {record.time}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default Dashboard;