import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    console.log("Navbar Admin Token:", token);
    const fetchNavbarData = async () => {
      try {
        const [studentsResponse, attendanceResponse] =
          await Promise.all([
            fetch("http://127.0.0.1:8000/students/", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),

            fetch("http://127.0.0.1:8000/attendance/", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          setStudents(studentsData);
        }

        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json();

          const today = new Date()
            .toISOString()
            .split("T")[0];

          const todayRecords = attendanceData.filter(
            (record) =>
              record.date === today &&
              record.status === "Present"
          );

          setTodayAttendance(todayRecords);
        }
      } catch (error) {
        console.error("Navbar data error:", error);
      }
    };

    fetchNavbarData();
  }, []);

  const filteredStudents =
    search.trim() === ""
      ? []
      : students
          .filter((student) =>
            `${student.name} ${student.student_id} ${student.email}`
              .toLowerCase()
              .includes(search.toLowerCase())
          )
          .slice(0, 5);

  const handleStudentClick = (studentId) => {
    setSearch("");
    setShowResults(false);
    navigate(`/students/${studentId}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6">

      {/* Left */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Attendance Management
        </h2>

        <p className="text-sm text-slate-500">
          Manage students and attendance
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <div className="relative hidden md:block">

          <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 transition focus-within:bg-slate-50 focus-within:ring-2 focus-within:ring-slate-200">
            <span className="text-lg text-slate-400">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search students..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              className="w-48 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          {/* Search Results */}
          {showResults && search.trim() !== "" && (
            <div className="absolute right-0 top-14 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

              {filteredStudents.length > 0 ? (
                <div>
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Students
                    </p>
                  </div>

                  {filteredStudents.map((student) => (
                    <button
                      key={student.student_id}
                      type="button"
                      onClick={() =>
                        handleStudentClick(student.student_id)
                      }
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                        {student.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {student.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {student.student_id}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    No students found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try another name or student ID.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notification */}
        <div className="relative">

          <button
            type="button"
            onClick={() =>
              setShowNotifications(!showNotifications)
            }
            className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-slate-100"
          >
            <span className="text-lg">
              🔔
            </span>

            {todayAttendance.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {todayAttendance.length > 9
                  ? "9+"
                  : todayAttendance.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-14 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Today's attendance activity
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
                  {todayAttendance.length}
                </span>
              </div>

              {todayAttendance.length > 0 ? (
                <div className="max-h-72 overflow-y-auto">

                  {todayAttendance.slice(0, 5).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center gap-3 border-b border-slate-50 px-4 py-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                        ✓
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {record.name}
                        </p>

                        <p className="text-xs text-slate-400">
                          Present • {record.time}
                        </p>
                      </div>
                    </div>
                  ))}

                  {todayAttendance.length > 5 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/attendance");
                      }}
                      className="w-full px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      View all attendance →
                    </button>
                  )}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-lg">
                    🔔
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-600">
                    No attendance yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Today's attendance notifications will appear here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-semibold text-white">
            A
          </div>

          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-900">
              Administrator
            </p>

            <p className="text-xs text-slate-500">
              Admin
            </p>
          </div>

        </div>
      </div>
    </header>
  );
}

export default Navbar;