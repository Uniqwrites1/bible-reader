import React, { useState } from 'react';
import { BookOpen, Settings, Home, Plus, List } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: '/', label: 'Home', icon: Home },
    { id: '/plans', label: 'My Plans', icon: List },
    { id: '/create-plan', label: 'Create Plan', icon: Plus },
    { id: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-content">
          {/* Logo */}
          <div className="header-logo">
            <BookOpen className="logo-icon" />
            <h1 className="logo-text">
              📖 Bible Study Plan
            </h1>
          </div>{/* Navigation */}
          <nav className="desktop-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.id;
              return (                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.id)}
                  className={`nav-button ${isActive ? 'active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-text">{item.label}</span>
                </button>
              );
            })}
          </nav>{/* Mobile Navigation Button */}
          <button 
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-items">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNavigation(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`mobile-nav-button ${isActive ? 'active' : ''}`}
                  >                    <Icon className="mobile-nav-icon" />
                    <span className="mobile-nav-text">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
