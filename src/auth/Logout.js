import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Logout = ({ onLogout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();

    if (onLogout) {
      onLogout();
    }

    const timeout = setTimeout(() => {
      navigate('/');
      window.location.reload();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigate, onLogout]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="relative w-full max-w-lg mx-4">
        {/* Background decorative elements */}
        <div className="absolute -top-12 -left-4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
        <div className="absolute -top-12 -right-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob animation-delay-4000"></div>

        {/* Main content card */}
        <div className="relative bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex flex-col items-center space-y-8">
            {/* Icon container */}
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-100 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="relative rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 p-4 transform transition-transform group-hover:rotate-12">
                <LogOut className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Text content */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-light text-gray-800">
                GOOD BYE...
              </h1>
              <p className="text-gray-500 font-light">
                Disconnect in progress
              </p>
            </div>

            {/* Elegant loading animation */}
            <div className="flex items-center justify-center space-x-1.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse"
                  style={{ animationDelay: `${i * 150}ms` }}
                ></div>
              ))}
            </div>

            {/* Progress line */}
            <div className="w-full h-px bg-gray-100 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 animate-progress w-full"></div>
            </div>

            {/* Footer message */}
            <p className="text-sm text-black-400 italic font-light">
              See u next time...
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-progress {
          animation: progress 3s linear forwards;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Logout;