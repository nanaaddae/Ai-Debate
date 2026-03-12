import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { debateAPI, argumentAPI } from '../services/api';
import ArgumentCard from '../components/ArgumentCard';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import QualityScoreLegend from '../components/QualityScoreLegend';
import DebateSummary from '../components/DebateSummary';

const DebatePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [debate, setDebate] = useState(null);
  const [arguments_, setArguments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newArgument, setNewArgument] = useState('');
  const [selectedSide, setSelectedSide] = useState('pro');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);
  const [userVote, setUserVote] = useState(null);

  // WebSocket hook
  const { joinDebate, leaveDebate, onVoteUpdate, onNewArgument, onArgumentVoteUpdate, off } = useWebSocket();

  useEffect(() => {
    fetchDebate();
    fetchArguments();

    // Join debate room for real-time updates
    joinDebate(parseInt(id));

    return () => {
      // Leave debate room on unmount
      leaveDebate(parseInt(id));
    };
  }, [id]);

  useEffect(() => {
    // Listen for real-time vote updates
    onVoteUpdate((data) => {
      if (data.debate_id === parseInt(id)) {
        console.log('Vote update received:', data);
        setDebate(prev => ({
          ...prev,
          pro_votes: data.pro_votes,
          con_votes: data.con_votes
        }));
      }
    });

    // Listen for new arguments
    onNewArgument((newArg) => {
      if (newArg.debate_id === parseInt(id)) {
        console.log('New argument received:', newArg);
        setArguments(prev => [newArg, ...prev]);
        showNotification('New argument added!');
      }
    });

    // Listen for argument vote updates
    onArgumentVoteUpdate((data) => {
      console.log('Argument vote update:', data);
      handleVoteUpdate(data.argument_id, data.vote_count);
    });

    return () => {
      off('vote_update');
      off('new_argument');
      off('argument_vote_update');
    };
  }, [id]);

  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const fetchDebate = async () => {
    try {
      const response = await debateAPI.getDebate(id);
      setDebate(response.data);
    } catch (err) {
      setError('Failed to load debate');
    } finally {
      setLoading(false);
    }
  };

  const fetchArguments = async () => {
    try {
      const response = await argumentAPI.getDebateArguments(id);
      setArguments(response.data);
    } catch (err) {
      console.error('Failed to fetch arguments:', err);
    }
  };

  const handleVoteOnDebate = async (side) => {
    if (!user || voting) return;
    setVoting(true);
    try {
      const response = await debateAPI.voteOnDebate(id, side);

      // Update local state immediately for responsiveness
      setDebate(prev => ({
        ...prev,
        pro_votes: response.data.pro_votes,
        con_votes: response.data.con_votes
      }));

      // Update user's vote state
      if (response.data.message === "Vote removed") {
        setUserVote(null);
      } else {
        setUserVote(side);
      }

      // WebSocket will update other users automatically

    } catch (err) {
      console.error('Failed to vote:', err);
      alert(err.response?.data?.detail || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const handleSubmitArgument = async (e) => {
    e.preventDefault();
    if (!newArgument.trim()) return;
    setSubmitting(true);

    try {
      const response = await argumentAPI.createArgument(id, {
        content: newArgument,
        side: selectedSide
      });

      // Add to local state immediately
      setArguments(prev => [response.data, ...prev]);
      setNewArgument('');
      setError('');

      // WebSocket will update other users automatically

    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit argument');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteUpdate = (argumentId, newVoteCount) => {
    setArguments(prev =>
      prev.map(arg =>
        arg.id === argumentId ? { ...arg, vote_count: newVoteCount } : arg
      )
    );
  };

const handleGenerateSummary = async () => {
  try {
    const response = await debateAPI.generateSummary(id);
    console.log('Summary generated:', response.data);
    // Refresh debate to get summary
    fetchDebate();
    alert('Summary generated successfully!');
  } catch (error) {
    console.error('Failed to generate summary:', error);
    alert(error.response?.data?.detail || 'Failed to generate summary');
  }
};

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-500">Loading debate...</div>
      </div>
    );
  }

  if (!debate) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-500">Debate not found</div>
      </div>
    );
  }

  const totalVotes = debate.pro_votes + debate.con_votes;
  const proPercentage = totalVotes > 0 ? Math.round((debate.pro_votes / totalVotes) * 100) : 50;
  const conPercentage = totalVotes > 0 ? Math.round((debate.con_votes / totalVotes) * 100) : 50;

  const proArguments = arguments_.filter(a => a.side === 'pro');
  const conArguments = arguments_.filter(a => a.side === 'con');

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Debate Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                debate.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {debate.status.toUpperCase()}
              </span>
              {/* Live indicator */}
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 flex items-center gap-1">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                Live
              </span>
            </div>
            <span className="text-sm text-gray-400">
              {new Date(debate.created_at).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-2">{debate.topic}</h1>
          {debate.description && (
            <p className="text-gray-500 mb-4">{debate.description}</p>
          )}

          {/* User's Vote Indicator */}
          {userVote && (
            <div className={`mb-4 p-3 rounded-lg text-center font-semibold ${
              userVote === 'pro'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              ✓ You voted {userVote.toUpperCase()}
            </div>
          )}

          {/* Vote Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-green-600 font-bold">PRO {proPercentage}% ({debate.pro_votes} votes)</span>
              <span className="text-red-600 font-bold">CON {conPercentage}% ({debate.con_votes} votes)</span>
            </div>
            <div className="flex rounded-full overflow-hidden h-4 mb-4">
              <div
                className="bg-green-500 transition-all duration-500"
                style={{ width: `${proPercentage}%` }}
              />
              <div
                className="bg-red-500 transition-all duration-500"
                style={{ width: `${conPercentage}%` }}
              />
            </div>

            {/* Vote Buttons */}
            {user && debate.status === 'active' && (
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => handleVoteOnDebate('pro')}
                  disabled={voting}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    userVote === 'pro'
                      ? 'bg-green-600 text-white ring-4 ring-green-300'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  } disabled:opacity-50`}
                >
                  {userVote === 'pro' ? '✓ Voted PRO' : '👍 Vote PRO'}
                </button>
                <button
                  onClick={() => handleVoteOnDebate('con')}
                  disabled={voting}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    userVote === 'con'
                      ? 'bg-red-600 text-white ring-4 ring-red-300'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  } disabled:opacity-50`}
                >
                  {userVote === 'con' ? '✓ Voted CON' : '👎 Vote CON'}
                </button>
              </div>
            )}

            {/* Login prompt for guests */}
            {!user && debate.status === 'active' && (
              <div className="text-center mt-4 p-3 bg-indigo-50 rounded-lg">
                <p className="text-indigo-700">
                  <a href="/login" className="font-semibold underline">Login</a> or{' '}
                  <a href="/register" className="font-semibold underline">register</a> to vote and participate
                </p>
              </div>
            )}
          </div>
        </div>

        {(debate.status === 'closed' || debate.ai_summary) && (
  <DebateSummary
    debate={debate}
    onGenerateSummary={handleGenerateSummary}
    currentUser={user}
  />)}

        {/* AI Arguments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* AI Pro */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
            <h2 className="text-xl font-bold text-green-700 mb-4">
              🤖 AI PRO Argument
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {debate.ai_pro_argument}
            </p>
          </div>

          {/* AI Con */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-red-500">
            <h2 className="text-xl font-bold text-red-700 mb-4">
              🤖 AI CON Argument
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {debate.ai_con_argument}
            </p>
          </div>
        </div>

        <QualityScoreLegend />
        {/* Add Argument Form */}
        {user && debate.status === 'active' && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Add Your Argument</h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitArgument} className="space-y-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedSide('pro')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    selectedSide === 'pro'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  👍 PRO
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSide('con')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    selectedSide === 'con'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  👎 CON
                </button>
              </div>

              <textarea
                value={newArgument}
                onChange={(e) => setNewArgument(e.target.value)}
                placeholder={`Write your ${selectedSide} argument here...`}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />

              <button
                type="submit"
                disabled={submitting || !newArgument.trim()}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-semibold transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Argument'}
              </button>
            </form>
          </div>
        )}

        {/* User Arguments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pro Arguments */}
          <div>
            <h2 className="text-xl font-bold text-green-700 mb-4">
              PRO Arguments ({proArguments.length})
            </h2>
            <div className="space-y-4">
              {proArguments.length === 0 ? (
                <p className="text-gray-400 text-center py-8 bg-white rounded-lg">
                  No pro arguments yet. Be the first!
                </p>
              ) : (
                proArguments.map(arg => (
                  <ArgumentCard
                    key={arg.id}
                    argument={arg}
                    onVoteUpdate={handleVoteUpdate}
                  />
                ))
              )}
            </div>
          </div>

          {/* Con Arguments */}
          <div>
            <h2 className="text-xl font-bold text-red-700 mb-4">
              CON Arguments ({conArguments.length})
            </h2>
            <div className="space-y-4">
              {conArguments.length === 0 ? (
                <p className="text-gray-400 text-center py-8 bg-white rounded-lg">
                  No con arguments yet. Be the first!
                </p>
              ) : (
                conArguments.map(arg => (
                  <ArgumentCard
                    key={arg.id}
                    argument={arg}
                    onVoteUpdate={handleVoteUpdate}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebatePage;