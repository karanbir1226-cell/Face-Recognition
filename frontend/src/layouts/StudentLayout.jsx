import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function StudentLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      localStorage.getItem("studentToken") ||
      localStorage.getItem("student_token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/student-dashboard",
      icon: "▣",
    },
    {
      name: "My Classes",
      path: "/student-classes",
      icon: "▤",
    },
    {
      name: "My Attendance",
      path: "/student-attendance",
      icon: "✓",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("studentToken");
    localStorage.removeItem("student_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("studentUser");

    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 text-white">
        <div className="flex h-20 items-center border-b border-slate-800 px-6">
          <div>
            <h1 className="text-lg font-bold">Face Attendance</h1>
            <p className="text-xs text-slate-400">Student Portal</p>
          </div>
        </div>

        <nav className="space-y-1 p-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-slate-950"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`
              }
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <NavLink
            to="/student-profile"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-slate-900 hover:text-white"
          >
            <span className="w-5 text-center">●</span>
            Profile
          </NavLink>

          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-red-400 hover:bg-slate-900 hover:text-red-300"
          >
            <span className="w-5 text-center">↪</span>
            Logout
          </button>
        </div>
      </aside>

      <div className="ml-64 min-h-screen">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Student Portal
            </h2>

            <p className="text-sm text-slate-500">
              View your classes and attendance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-semibold text-white">
              S
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Student
              </p>

              <p className="text-xs text-slate-500">
                Student Account
              </p>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;