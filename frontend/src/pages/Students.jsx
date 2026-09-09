import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Students() {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");

    fetch("https://face-recognition-2-4pc8.onrender.com/students/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch students");
        }

        return response.json();
      })
      .then((data) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching students:", error);
        setError("Unable to load students from server.");
        setLoading(false);
      });
  }, []);

  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.student_id} ${student.email} ${student.course}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Management
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Students
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage registered students and their face recognition profiles.
          </p>
        </div>

        <Link
          to="/students/add"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
        >
          <span className="mr-2 text-base">+</span>
          Add Student
        </Link>
      </div>

      {/* Search + Count */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div className="relative w-full">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search by name, ID, email or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div className="shrink-0 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600">
            {filteredStudents.length}{" "}
            {filteredStudents.length === 1 ? "Student" : "Students"}
          </div>

        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Loading students...
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

      {/* Students Table */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Registered Students
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Student records available in the system.
              </p>
            </div>

            <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 sm:block">
              {students.length} Total
            </span>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-left">

              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Student
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Student ID
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Course
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Semester
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredStudents.map((student) => (
                  <tr
                    key={student.student_id}
                    className="transition hover:bg-slate-50"
                  >

                    {/* Student */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                          {student.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {student.name}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {student.email}
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* ID */}
                    <td className="px-6 py-5">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm font-semibold text-slate-700">
                        {student.student_id}
                      </span>
                    </td>

                    {/* Course */}
                    <td className="px-6 py-5 text-sm font-medium text-slate-600">
                      {student.course || "—"}
                    </td>

                    {/* Semester */}
                    <td className="px-6 py-5 text-sm text-slate-600">
                      {student.semester || "—"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                          student.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            student.status === "Active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />

                        {student.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-5">
                      <Link
                        to={`/students/${student.student_id}`}
                        className="inline-flex items-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-900 hover:text-white"
                      >
                        View
                        <span className="ml-1.5">→</span>
                      </Link>
                    </td>

                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-16 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        ⌕
                      </div>

                      <p className="mt-4 font-semibold text-slate-700">
                        No students found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Try searching with a different name or student ID.
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

export default Students;