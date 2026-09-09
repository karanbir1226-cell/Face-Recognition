import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import StudentProfile from "./pages/StudentProfile";
import StudentAttendance from "./pages/StudentAttendance";
import StudentClasses from "./pages/StudentClasses";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import StudentDetails from "./pages/StudentDetails";
import EditStudent from "./pages/EditStudent";
import FaceRegistration from "./pages/FaceRegistration";
import Attendance from "./pages/Attendance";
import LiveAttendance from "./pages/LiveAttendance";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Display from "./pages/Display";

import DashboardLayout from "./layouts/DashboardLayout";
import StudentLayout from "./layouts/StudentLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* ================= ADMIN ROUTES ================= */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/students" element={<Students />} />

          <Route path="/students/add" element={<AddStudent />} />

          <Route
            path="/students/:id"
            element={<StudentDetails />}
          />

          <Route
            path="/students/:id/edit"
            element={<EditStudent />}
          />

          <Route
            path="/students/:id/register-face"
            element={<FaceRegistration />}
          />

          <Route
            path="/attendance"
            element={<Attendance />}
          />

          <Route
            path="/attendance/live"
            element={<LiveAttendance />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />
        </Route>

        {/* ================= STUDENT ROUTES ================= */}
      <Route element={<StudentLayout />}>
        <Route
          path="/student-dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/student-classes"
          element={<StudentClasses />}
        />
        <Route 
          path="/student-attendance" 
          element={<StudentAttendance />} 
        />
        <Route
          path="/student-profile"
          element={<StudentProfile />}
        />  
      </Route>  

        {/* ================= DISPLAY SCREEN ================= */}
        <Route
          path="/display"
          element={<Display />}
        />

        {/* ================= DEFAULT ROUTES ================= */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;