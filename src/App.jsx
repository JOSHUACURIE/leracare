// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

// Auth Components
import Login from "./pages/auth/login";
import PrivateRoute from "./components/auth/PivateRoute"; // ✅ fixed spelling

// Patient Components
import PatientDashboard from "./pages/patient/patientDashboard";
import Appointments from "./pages/patient/Appointments";
import BookConsultation from "./pages/patient/BookConsultation";
import Reports from "./pages/patient/Reports";
import Payments from "./pages/patient/Payment";
import HealthAwareness from "./pages/patient/HealthAwareness";

// Doctor Components
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import AssignedPatients from "./pages/doctor/AssignedPatients";
import WriteReport from "./pages/doctor/WriteReport";
import DutySchedule from "./pages/doctor/DutySchedule";
import MessageAdmin from "./pages/doctor/MessageAdmin";

// Admin Components
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManagePatients from "./pages/admin/ManagePatients";
import ManageDoctors from "./pages/admin/ManageDoctors";
import ViewPayments from "./pages/admin/ViewPayments";
import AssignDuties from "./pages/admin/AssignDuties";
import ComplaintInbox from "./pages/admin/ComplaintInbox";
import RecommendDoctor from "./pages/admin/RecommendDoctors";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Patient Routes */}
        <Route
          path="/patient"
          element={
            <PrivateRoute allowedRole="patient">
              <PatientDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <PrivateRoute allowedRole="patient">
              <Appointments />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/book"
          element={
            <PrivateRoute allowedRole="patient">
              <BookConsultation />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/reports"
          element={
            <PrivateRoute allowedRole="patient">
              <Reports />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/payments"
          element={
            <PrivateRoute allowedRole="patient">
              <Payments />
            </PrivateRoute>
          }
        />
        <Route
          path="/patient/health"
          element={
            <PrivateRoute allowedRole="patient">
              <HealthAwareness />
            </PrivateRoute>
          }
        />

        {/* Doctor Routes */}
        <Route
          path="/doctor"
          element={
            <PrivateRoute allowedRole="doctor">
              <DoctorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <PrivateRoute allowedRole="doctor">
              <AssignedPatients />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/writereport"
          element={
              <PrivateRoute allowedRole="doctor">
              <WriteReport />
               </PrivateRoute>
          }
        />
        <Route
          path="/doctor/duties"
          element={
            <PrivateRoute allowedRole="doctor">
              <DutySchedule />
            </PrivateRoute>
          }
        />
        <Route
          path="/doctor/message"
          element={
            <PrivateRoute allowedRole="doctor">
              <MessageAdmin />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRole="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <PrivateRoute allowedRole="admin">
              <ManagePatients />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/doctors"
          element={
            <PrivateRoute allowedRole="admin">
              <ManageDoctors />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <PrivateRoute allowedRole="admin">
              <ViewPayments />
            </PrivateRoute>
          }
        />
        <Route
          path="/assign"
          element={
          
              <AssignDuties />
            
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <PrivateRoute allowedRole="admin">
              <ComplaintInbox />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/recommend"
          element={
            <PrivateRoute allowedRole="admin">
              <RecommendDoctor />
            </PrivateRoute>
          }
        />

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
