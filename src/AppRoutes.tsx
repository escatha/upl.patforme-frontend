import React from "react";
import { Routes, Route } from "react-router-dom";

import { useUser } from "./contexts/UserContext";

import Index from "./pages/index";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ExamPage from "./pages/ExamPage";
import LoginProf from "./pages/Login";
  import PlanifierExamen from "./pages/PlanifierExamen";

const AppRoutes: React.FC = () => {
  const { user, logout } = useUser();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login/professeur" element={<LoginProf />} />

      <Route
        path="/dashboard/:faculty/student"
        element={<StudentDashboard user={user} onLogout={logout} />}
      />
      <Route
        path="/dashboard/:faculty/teacher"
        element={user ? <TeacherDashboard user={user} onLogout={logout} /> : <Index />}
      />
      <Route
        path="/dashboard/:faculty/admin"
        element={user ? <AdminDashboard user={user} onLogout={logout} /> : <Index />}
      />

      <Route
        path="/exam/:id"
        element={user ? <ExamPage user={user} onLogout={logout} /> : <Index />}
      />
       <Route 
        path="/planifier-examen" element= {<PlanifierExamen />} />
    </Routes>
  

  );
};

export default AppRoutes;
