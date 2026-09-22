import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { House, BarChart3, Users, Bell, CircleHelp } from "lucide-react";
import "../app-theme.css";
import FamilyModeModal from "./FamilyModeModal";

const navigation = [
  { to: "/dashboard", label: "Overview", icon: House },
  { to: "/insights", label: "Insights", icon: BarChart3 },
];

export function Shell({ isSharedWallet = false }) {
  const [user, setUser] = useState(null);
  const [showFamily, setShowFamily] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("user")) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
      if (storedUser.isAvatarImageSet === false || !storedUser.avatarImage) {
        navigate("/setAvatar");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${navigation.find((item) => item.to === location.pathname)?.label ?? "Bachat"} · IIITL Bachat`;
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link className="app-brand" to="/" aria-label="IIITL Bachat home">
            <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', display: 'flex', flexDirection: 'row', gap: '6px', alignItems: 'center' }}>
              <span style={{ color: '#111827' }}>IIITL</span>
              <span style={{ color: '#6C47FF' }}>Bachat</span>
            </span>
          </Link>
          <nav className="app-navigation" aria-label="Main navigation">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => isActive ? "active" : ""}>
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
            {/* Custom Nav Item for Family Mode */}
            <NavLink to="#" onClick={(e) => { e.preventDefault(); setShowFamily(true); }}>
              <Users size={18} />
              <span>Family Mode</span>
              {isSharedWallet && <span className="nav-count">Live</span>}
            </NavLink>
          </nav>
          <div className="app-header-actions">
            <button
              onClick={() => setShowFamily(true)}
              className="notification-button"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#77717f' }}
              aria-label="Family Mode"
            >
              <Bell size={19} />
              {isSharedWallet && <span style={{ width: 8, height: 8, background: '#6C47FF', borderRadius: '50%', position: 'absolute', top: 2, right: 2 }} />}
            </button>
            <div className="persona">
              {user.avatarImage ? (
                <img src={user.avatarImage} alt="Avatar" className="avatar" style={{ borderRadius: '50%' }} />
              ) : (
                <span className="avatar owner">
                  {user.name ? user.name.slice(0, 1) : "U"}
                </span>
              )}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <span onClick={handleLogout} style={{ fontSize: 14, color: '#111827', fontWeight: 600 }}>
                  {user.name} · Logout
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="main-shell">
        <div className="app-context">
          <span>
            <span className="context-dot" />
            {isSharedWallet ? "Shared Family Wallet" : "Personal Dashboard"}
          </span>
          <button onClick={() => setShowFamily(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex', alignItems: 'center', gap: '9px', fontSize: '14px' }}>
            <CircleHelp size={15} />{" "}
            Manage Wallets
          </button>
        </div>
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="page-footer" style={{ marginTop: '40px', paddingBottom: '40px', display: 'flex', justifyContent: 'space-between', color: '#776982', fontSize: '13px' }}>
          <span>IIITL Bachat · AI Powered Finance Platform</span>
          <span>No bank account connected</span>
        </footer>
      </div>
      {showFamily && user && (
        <FamilyModeModal show={showFamily} onHide={() => setShowFamily(false)} user={user} />
      )}
    </div>
  );
}

export default Shell;
