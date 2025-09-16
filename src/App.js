import ProtectedRoute from "./components/Home/ProtectedRoute";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from './components/Home/Header/Navbar';
import AuthPage from "./components/Home/Auth/AuthPage";
import Home from './components/Home/Home/Home';
import Patient from './components/Home/Patient/Patint';
import SecurityNotice from './components/Home/SecurityNotice';

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/auth";

  return (
    <div className="App relative min-h-screen">
      {!hideNavbar && <Navbar />}

      <main className={`${!hideNavbar ? "pt-14 pb-14" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />

          {/* صفحات محمية */}
          <Route
            path="/patient"
            element={
              <ProtectedRoute>
                <Patient />
              </ProtectedRoute>
            }
          />

          {/* ممكن تضيف صفحات ثانية بنفس الطريقة */}
        </Routes>
      </main>

      {/* Security Notice يظهر في كل الصفحات إلا صفحة /auth */}
      {!hideNavbar && <SecurityNotice />}
    </div>
  );
}

export default App;
