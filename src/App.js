import ProtectedRoute from "./components/Home/ProtectedRoute";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Home/Header/Navbar";
import AuthPage from "./components/Home/Auth/AuthPage";
import Home from "./components/Home/Home/Home";
import Patient from "./components/Home/Patient/Patint";
import SecurityNotice from "./components/Home/SecurityNotice";
import Profile from "./components/Home/Profile/Profile";
import Search from "./components/Home/PharmacySearch/Search";
import AddDonation from "./components/Home/Donations/AddDontation";
import AlternativeSearch from "./components/Home/AlternativeSearch/AlternativeSearch";

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
          <Route path="/add-dontation" element={<AddDonation />} />

          {/* صفحات محمية */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pharasearch"
            element={
              <ProtectedRoute>
                <Search />
              </ProtectedRoute>
            }
          />

          <Route
            path="/alternative-search"
            element={
              <ProtectedRoute>
                <AlternativeSearch />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient"
            element={
              <ProtectedRoute>
                <Patient />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!hideNavbar && <SecurityNotice />}
    </div>
  );
}

export default App;
