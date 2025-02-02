import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Menu, X, Folder, Users, TvMinimalPlay, PartyPopper } from 'lucide-react';
import { DashboardIcon } from '@radix-ui/react-icons';

const Navbar = ({ isAuthenticated, role, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLogout = () => {
    onLogout(); // Call the onLogout function passed from the parent component
    localStorage.removeItem('userToken');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  const commonLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: DashboardIcon },
    { label: 'Events', path: '/events', icon: TvMinimalPlay },
    { label: 'Categories', path: '/categories', icon: Folder },
    { label: 'Users', path: '/users', icon: Users },
  ];

  const authLinks = isAuthenticated
    ? [
        { label: 'Logout', path: '/logout', icon: LogIn, onClick: handleLogout },
      ]
    : [
        { label: 'Login', path: '/', icon: LogIn },
      ];

  const allLinks = [...commonLinks, ...authLinks];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white text-blue-800 shadow-lg h-16' : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white h-20'
      }`}
    >
      <div className="container mx-auto h-full px-4 flex justify-between items-center relative">
        <Link
          to="/"
          className="text-2xl font-bold flex items-center space-x-3 hover:opacity-80 transition-transform"
          aria-label="Eventy Logo"
        >
          <PartyPopper size={32} />
          <span> E v e n t Y </span>
          <PartyPopper size={32} />
        </Link>
        <ul className="hidden md:flex items-center space-x-6">
          {allLinks.map((link, index) => (
            <li key={index}>
              <Link
                to={link.path}
                onClick={link.onClick}
                className={`flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors ${
                  location.pathname === link.path
                    ? 'font-bold text-blue-600 bg-blue-50' // Active link styling
                    : isScrolled
                    ? 'text-blue-800 hover:text-blue-600' // Scrolled state styling
                    : 'text-white hover:text-blue-200' // Default state styling
                }`}
              >
                <link.icon size={20} />
                <span>{link.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-lg hover:bg-white/10 focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg rounded-b-lg overflow-hidden text-gray-800">
            <ul className="flex flex-col">
              {allLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    onClick={() => {
                      link.onClick?.();
                      toggleMenu();
                    }}
                    className={`flex items-center space-x-2 p-4 hover:bg-blue-50 transition-colors ${
                      location.pathname === link.path
                        ? 'font-bold text-blue-600 bg-blue-50' // Active link styling
                        : 'text-gray-800 hover:text-blue-600' // Default styling
                    }`}
                  >
                    <link.icon size={20} />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;