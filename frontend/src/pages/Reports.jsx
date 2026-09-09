import { useEffect, useState } from "react";

function Reports() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/attendance/", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch attendance");
        }

        return response.json();
      })
      .then((data) => {
        setAttendance(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Reports error:", error);
        setError("Unable to load attendance reports.");
        setLoading(false);
      });
  }, []);

  // Date filter
  const filteredAttendance = attendance.filter((record) => {
    return selectedDate === "" || record.date === selectedDate;
  });

  // Export CSV
  const exportCSV = (records) => {
    if (records.length === 0) {
      alert("No attendance records to export.");
      return;
    }

    const headers = [
      "Student",
      "Student ID",
      "Date",
      "Time",
      "Status",
    ];

    const rows = records.map((record) => [
      record.name,
      record.student_id,
      record.date,
      record.time,
      record.status,
    ]);

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    link.download = selectedDate
      ? `attendance-report-${selectedDate}.csv`
      : "attendance-report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const totalAttendance = filteredAttendance.length;

  const presentCount = filteredAttendance.filter(
    (record) => record.status === "Present"
  ).length;

  const absentCount = filteredAttendance.filter(
    (record) => record.status === "Absent"
  ).length;

  const uniqueStudents = new Set(
    filteredAttendance.map((record) => record.student_id)
  ).size;

  const attendancePercentage =
    totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : 0;

  const stats = [
    {
      title: "Total Attendance",
      value: totalAttendance,
      description: "Attendance records",
      icon: "▤",
      iconBox: "bg-slate-100 text-slate-700",
      valueColor: "text-slate-900",
    },
    {
      title: "Present",
      value: presentCount,
      description: "Present records",
      icon: "✓",
      iconBox: "bg-green-100 text-green-700",
      valueColor: "text-green-600",
    },
    {
      title: "Students",
      value: uniqueStudents,
      description: "Students with attendance",
      icon: "●",
      iconBox: "bg-blue-100 text-blue-700",
      valueColor: "text-blue-600",
    },
    {
      title: "Attendance Rate",
      value: `${attendancePercentage}%`,
      description: "Current attendance rate",
      icon: "↗",
      iconBox: "bg-purple-100 text-purple-700",
      valueColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Analytics
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Reports
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View attendance statistics and detailed reports.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-400">
            TOTAL RECORDS
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {totalAttendance}
          </p>
        </div>
      </div>

      {/* Report Filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Report Filter
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a date to view attendance records.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />

            <button
              type="button"
              onClick={() => setSelectedDate("")}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => exportCSV(filteredAttendance)}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Export CSV
            </button>

          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading reports...
            </p>

          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
            !
          </div>

          <p className="mt-4 font-semibold text-red-700">
            {error}
          </p>

          <p className="mt-1 text-sm text-red-500">
            Please refresh the page and try again.
          </p>

        </div>
      )}

      {!loading && !error && (
        <>

          {/* Statistics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

            {stats.map((stat) => (
              <div
                key={stat.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
              >

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>

                    <h2
                      className={`mt-3 text-4xl font-bold tracking-tight ${stat.valueColor}`}
                    >
                      {stat.value}
                    </h2>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold ${stat.iconBox}`}
                  >
                    {stat.icon}
                  </div>

                </div>

                <p className="mt-3 text-xs text-slate-400">
                  {stat.description}
                </p>

              </div>
            ))}

          </div>

          {/* Attendance Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Attendance Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedDate
                    ? `Attendance performance for ${selectedDate}`
                    : "Overall attendance performance"}
                </p>
              </div>

              <div className="text-3xl font-bold text-purple-600">
                {attendancePercentage}%
              </div>

            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-purple-600 transition-all duration-700"
                style={{
                  width: `${attendancePercentage}%`,
                }}
              />

            </div>

            <div className="mt-4 flex flex-wrap justify-between gap-3 text-xs">

              <span className="font-medium text-green-600">
                {presentCount} Present
              </span>

              <span className="font-medium text-red-500">
                {absentCount} Absent
              </span>

              <span className="text-slate-400">
                {uniqueStudents} Students
              </span>

            </div>

          </div>

          {/* Attendance Report */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Attendance Report
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Detailed attendance records from the database.
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {filteredAttendance.length} Records
              </span>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px] text-left">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Student
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Student ID
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Time
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredAttendance.map((record) => (

                    <tr
                      key={record.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* Student */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
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

                      {/* Student ID */}
                      <td className="px-6 py-5">

                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm font-semibold text-slate-700">
                          {record.student_id}
                        </span>

                      </td>

                      {/* Date */}
                      <td className="px-6 py-5 text-sm font-medium text-slate-600">
                        {record.date}
                      </td>

                      {/* Time */}
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {record.time}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            record.status === "Present"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >

                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              record.status === "Present"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          />

                          {record.status}

                        </span>

                      </td>

                    </tr>

                  ))}

                  {/* No Records */}
                  {filteredAttendance.length === 0 && (

                    <tr>

                      <td
                        colSpan="5"
                        className="px-6 py-16 text-center"
                      >

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                          —
                        </div>

                        <p className="mt-4 font-semibold text-slate-700">
                          No attendance records found
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Try selecting another date.
                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        </>
      )}

    </div>
  );
}

export default Reports;