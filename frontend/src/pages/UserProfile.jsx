import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchActivity();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile(userId);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await userAPI.getActivity(userId);
      setActivity(response.data);
    } catch (error) {
      console.error('Failed to fetch activity:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-500">User not found</div>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    const badges = {
      admin: '👑 Admin',
      moderator: '🛡️ Moderator',
      verified_user: '✓ Verified',
      guest: '👤 Guest'
    };
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      moderator: 'bg-blue-100 text-blue-800',
      verified_user: 'bg-green-100 text-green-800',
      guest: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[role]}`}>
        {badges[role]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile.username[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{profile.username}</h1>
                <div className="flex gap-2 mt-2">
                  {getRoleBadge(profile.role)}
                  <span className="text-gray-400 text-sm">
                    Member since {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-indigo-600">{profile.reputation_score}</p>
              <p className="text-sm text-gray-600">Reputation</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{profile.total_debates}</p>
              <p className="text-sm text-gray-600">Debates Created</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{profile.total_arguments}</p>
              <p className="text-sm text-gray-600">Arguments Posted</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{profile.total_votes_received}</p>
              <p className="text-sm text-gray-600">Votes Received</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'overview'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('debates')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'debates'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              💬 Debates
            </button>
            <button
              onClick={() => setActiveTab('arguments')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'arguments'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📝 Arguments
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && activity && (
          <div className="space-y-6">
            {/* Recent Debates */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Recent Debates</h2>
              {activity.recent_debates.length === 0 ? (
                <p className="text-gray-400">No debates yet</p>
              ) : (
                <div className="space-y-3">
                  {activity.recent_debates.map((debate) => (
                    <Link
                      key={debate.id}
                      to={`/debate/${debate.id}`}
                      className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{debate.topic}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(debate.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-sm">
                          <span className="text-green-600 font-medium">{debate.pro_votes}</span>
                          {' / '}
                          <span className="text-red-600 font-medium">{debate.con_votes}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Arguments */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Recent Arguments</h2>
              {activity.recent_arguments.length === 0 ? (
                <p className="text-gray-400">No arguments yet</p>
              ) : (
                <div className="space-y-3">
                  {activity.recent_arguments.map((arg) => (
                    <div key={arg.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          arg.side === 'pro'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {arg.side.toUpperCase()}
                        </span>
                        <div className="flex-1">
                          <p className="text-gray-700">{arg.content}</p>
                          <p className="text-sm text-gray-400 mt-2">
                            on <span className="text-indigo-600">{arg.debate_topic}</span>
                            {' • '}
                            👍 {arg.vote_count} votes
                            {' • '}
                            {new Date(arg.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Votes */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Recent Votes</h2>
              {activity.recent_votes.length === 0 ? (
                <p className="text-gray-400">No votes yet</p>
              ) : (
                <div className="space-y-2">
                  {activity.recent_votes.map((vote, idx) => (
                    <div key={idx} className="p-3 border rounded-lg text-sm">
                      Voted <span className={`font-semibold ${
                        vote.side === 'pro' ? 'text-green-600' : 'text-red-600'
                      }`}>{vote.side.toUpperCase()}</span> on{' '}
                      <Link to={`/debate/${vote.debate_id}`} className="text-indigo-600 hover:underline">
                        {vote.debate_topic}
                      </Link>
                      <span className="text-gray-400 ml-2">
                        {new Date(vote.voted_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'debates' && (
          <DebatesTab userId={userId} />
        )}

        {activeTab === 'arguments' && (
          <ArgumentsTab userId={userId} />
        )}
      </div>
    </div>
  );
};

// Debates Tab Component
const DebatesTab = ({ userId }) => {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebates();
  }, [userId]);

  const fetchDebates = async () => {
    try {
      const response = await userAPI.getDebates(userId);
      setDebates(response.data);
    } catch (error) {
      console.error('Failed to fetch debates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">All Debates Created</h2>
      {debates.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No debates created yet</p>
      ) : (
        <div className="space-y-4">
          {debates.map((debate) => (
            <Link
              key={debate.id}
              to={`/debate/${debate.id}`}
              className="block p-5 border rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800 flex-1">{debate.topic}</h3>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  debate.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {debate.status}
                </span>
              </div>
              {debate.description && (
                <p className="text-gray-600 text-sm mb-3">{debate.description}</p>
              )}
              <div className="flex gap-4 text-sm text-gray-500">
                <span>🗓️ {new Date(debate.created_at).toLocaleDateString()}</span>
                <span className="text-green-600">👍 {debate.pro_votes}</span>
                <span className="text-red-600">👎 {debate.con_votes}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

// Arguments Tab Component
const ArgumentsTab = ({ userId }) => {
  const [arguments_, setArguments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArguments();
  }, [userId]);

  const fetchArguments = async () => {
    try {
      const response = await userAPI.getArguments(userId);
      setArguments(response.data);
    } catch (error) {
      console.error('Failed to fetch arguments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">All Arguments Posted</h2>
      {arguments_.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No arguments posted yet</p>
      ) : (
        <div className="space-y-4">
          {arguments_.map((arg) => (
            <div key={arg.id} className="p-5 border rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  arg.side === 'pro'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {arg.side.toUpperCase()}
                </span>
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed">{arg.content}</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <Link
                  to={`/debate/${arg.debate.id}`}
                  className="text-indigo-600 hover:underline"
                >
                  on: {arg.debate.topic}
                </Link>
                <div className="flex gap-3 text-gray-500">
                  <span>👍 {arg.vote_count}</span>
                  <span>{new Date(arg.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;