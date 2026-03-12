import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            🗣️ Argue.ai
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/create-debate" className="hover:text-indigo-200">
                  Create Debate
                </Link>
                {(user.role === 'admin' || user.role === 'moderator') && (
                  <Link to="/admin" className="hover:text-indigo-200">
                    {user.role === 'admin' ? '👑 Admin' : '🛡️ Moderator'}
                  </Link>
                )}
                <Link to={`/user/${user.id}`} className="hover:text-indigo-200">
                  My Profile
                </Link>
                <span className="text-indigo-200">
                  {user.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-indigo-200">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-500 hover:bg-indigo-400 px-4 py-2 rounded"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;