import { useEffect, useState } from "react";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

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
        console.error("Attendance error:", error);
        setError("Unable to load attendance records.");
        setLoading(false);
      });
  }, []);

  const filteredAttendance = attendance.filter((record) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      record.name.toLowerCase().includes(searchText) ||
      record.student_id.toLowerCase().includes(searchText);

    const matchesDate =
      selectedDate === "" || record.date === selectedDate;

    const matchesStatus =
      selectedStatus === "" || record.status === selectedStatus;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const activeFilters =
    [search, selectedDate, selectedStatus].filter(Boolean).length;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Records
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Attendance
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View and manage student attendance records.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-medium text-slate-400">
            TOTAL RECORDS
          </p>

          <p className="mt-1 text-lg font-bold text-slate-900">
            {attendance.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Filter Attendance
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Search and filter attendance records.
            </p>
          </div>

          {activeFilters > 0 && (
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {activeFilters} filter{activeFilters > 1 ? "s" : ""} active
            </span>
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_auto]">

          {/* Search */}
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Date */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
          />

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
          >
            <option value="">All Status</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>

          {/* Clear */}
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedDate("");
              setSelectedStatus("");
            }}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-900 hover:text-white"
          >
            Clear
          </button>

        </div>

        {/* Result count */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-600">
              {filteredAttendance.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-600">
              {attendance.length}
            </span>{" "}
            records
          </p>
        </div>

      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading attendance records...
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

      {/* Attendance Table */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Attendance Records
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Attendance history from the database.
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
                          {record.name.charAt(0).toUpperCase()}
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
                        ⌕
                      </div>

                      <p className="mt-4 font-semibold text-slate-700">
                        No attendance records found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>
        </div>
      )}

    </div>
  );
}

export default Attendance;