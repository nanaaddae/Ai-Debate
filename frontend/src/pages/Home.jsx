import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { debateAPI } from '../services/api';
import DebateCard from '../components/DebateCard';
import SearchFilters from '../components/SearchFilters';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';

const Home = () => {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { onNewDebate, off } = useWebSocket();

  const [filters, setFilters] = useState({
    search: '',
    sort_by: 'newest',
    status: '',
    tag: ''
  });

  useEffect(() => {
    fetchDebates();
  }, [filters]);

  useEffect(() => {
    // Listen for new debates
    onNewDebate((newDebate) => {
      console.log('New debate received:', newDebate);

      // Only add if it matches current filters
      if (!filters.search && (!filters.status || filters.status === newDebate.status)) {
        setDebates(prev => [newDebate, ...prev]);

        // Show notification
        showNotification('New debate created!');
      }
    });

    return () => {
      off('new_debate');
    };
  }, [filters]);

  const showNotification = (message) => {
    // Simple notification - you can use a library like react-toastify for better UX
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const fetchDebates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.status) params.status = filters.status;
      if (filters.tag) params.tag = filters.tag;

      const response = await debateAPI.getDebates(params);
       console.log('Fetched debates:', response.data);
      setDebates(response.data);
    } catch (err) {
      setError('Failed to load debates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">

        {/* Hero Section */}
        <div className="bg-indigo-600 text-white rounded-xl p-8 mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3">AI-Powered Debate Platform</h1>
          <p className="text-indigo-200 text-lg mb-6">
            Explore both sides of any argument with AI-generated insights
          </p>
          {user ? (
            <Link
              to="/create-debate"
              className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors inline-block"
            >
              + Start a Debate
            </Link>
          ) : (
            <Link
              to="/register"
              className="bg-white text-indigo-600 font-bold px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors inline-block"
            >
              Join the Debate
            </Link>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-indigo-600">{debates.length}</p>
            <p className="text-gray-500 text-sm">Debates Found</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-green-600">
              {debates.reduce((sum, d) => sum + d.pro_votes + d.con_votes, 0)}
            </p>
            <p className="text-gray-500 text-sm">Total Votes</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <p className="text-3xl font-bold text-purple-600">🤖</p>
            <p className="text-gray-500 text-sm">AI Powered</p>
          </div>
        </div>

        {/* Search & Filters */}
        <SearchFilters filters={filters} onFilterChange={handleFilterChange} />

        {/* Debates List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {filters.search ? `Search Results for "${filters.search}"` : 'Latest Debates'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Updates
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">Loading debates...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && debates.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-lg mb-4">
                {filters.search ? 'No debates found matching your search.' : 'No debates yet!'}
              </p>
              {user && !filters.search && (
                <Link
                  to="/create-debate"
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 inline-block"
                >
                  Create the first debate
                </Link>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {debates.map((debate) => (
              <DebateCard key={debate.id} debate={debate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;