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

import DonateList from "./components/Home/Donations/DonateList";
import AllPharamacy from "./components/Home/AllPharamacy/AllPharamacy";
import MyDonation from "./components/Home/Donations/MyDonation";
import AlternativeSearch from "./components/Home/AlternativeSearch/AlternativeSearch";

import MainDashboard from "./dashboard/Dashboard";

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
            path="/Pharmacy"
            element={
              <ProtectedRoute>
                <AllPharamacy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-dontation"
            element={
              <ProtectedRoute>
                <AddDonation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donate"
            element={
              <ProtectedRoute>
                <DonateList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Mydonate"
            element={
              <ProtectedRoute>
                <MyDonation />
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

          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <MainDashboard />
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
