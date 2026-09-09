import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "▣" },
    { name: "Students", path: "/students", icon: "●" },
    { name: "Attendance", path: "/attendance", icon: "✓" },
    { name: "Live Attendance", path: "/attendance/live", icon: "◉" },
    { name: "Reports", path: "/reports", icon: "▤" },
    { name: "Display Screen", path: "/display", icon: "▥" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    navigate("/login", { replace: true });
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 text-white">
      <div className="flex h-20 items-center border-b border-slate-800 px-6">
        <div>
          <h1 className="text-lg font-bold">Face Attendance</h1>
          <p className="text-xs text-slate-400">
            Information System
          </p>
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
          to="/profile"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-slate-900 hover:text-white"
        >
          <span className="w-5 text-center">●</span>
          Profile
        </NavLink>

        <NavLink
          to="/settings"
          className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-slate-900 hover:text-white"
        >
          <span className="w-5 text-center">⚙</span>
          Settings
        </NavLink>

        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-red-400 hover:bg-slate-900 hover:text-red-300"
        >
          <span className="w-5 text-center">↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;