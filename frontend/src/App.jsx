import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/patient"
        element={<PatientDashboard />}
      />

      <Route
        path="/doctor"
        element={<DoctorDashboard />}
      />
    </Routes>
  );
}

export default App;