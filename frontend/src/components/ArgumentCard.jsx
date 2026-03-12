import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { argumentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ArgumentCard = ({ argument, onVoteUpdate }) => {
  const { user } = useAuth();
  const [voting, setVoting] = useState(false);
  const [showScores, setShowScores] = useState(false);

  const handleVote = async () => {
    if (!user) return;
    setVoting(true);
    try {
      const response = await argumentAPI.voteOnArgument(argument.id);
      onVoteUpdate(argument.id, response.data.vote_count);
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setVoting(false);
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return { color: 'bg-green-100 text-green-800', label: 'Excellent' };
    if (score >= 60) return { color: 'bg-blue-100 text-blue-800', label: 'Good' };
    if (score >= 40) return { color: 'bg-yellow-100 text-yellow-800', label: 'Fair' };
    return { color: 'bg-red-100 text-red-800', label: 'Weak' };
  };

  const hasQualityScores = argument.quality_score_overall !== null && argument.quality_score_overall !== undefined;

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${
      argument.side === 'pro' ? 'border-green-500' : 'border-red-500'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Author & AI Badge */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              argument.side === 'pro'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}>
              {argument.side.toUpperCase()}
            </span>
            {argument.is_ai_generated && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold">
                🤖 AI Generated
              </span>
            )}
            {!argument.is_ai_generated && hasQualityScores && (
              <span className={`text-xs px-2 py-1 rounded font-semibold ${
                getScoreBadge(argument.quality_score_overall).color
              }`}>
                ⭐ {argument.quality_score_overall}/100
              </span>
            )}
            {!argument.is_ai_generated && (
              <Link
                to={`/user/${argument.author_id}`}
                className="text-xs text-indigo-600 hover:underline"
              >
                View Author Profile
              </Link>
            )}
            <span className="text-xs text-gray-400">
              {new Date(argument.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Content */}
          <p className="text-gray-700 text-sm leading-relaxed mb-2">
            {argument.content}
          </p>

          {/* Quality Scores - Toggle Details */}
          {hasQualityScores && !argument.is_ai_generated && (
            <div className="mt-3">
              <button
                onClick={() => setShowScores(!showScores)}
                className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
              >
                {showScores ? '▼' : '▶'} {showScores ? 'Hide' : 'Show'} Quality Breakdown
              </button>

              {showScores && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
                  <ScoreBar label="Logic" score={argument.quality_score_logic} />
                  <ScoreBar label="Evidence" score={argument.quality_score_evidence} />
                  <ScoreBar label="Relevance" score={argument.quality_score_relevance} />
                  <ScoreBar label="Persuasiveness" score={argument.quality_score_persuasiveness} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vote Button */}
        <div className="flex flex-col items-center ml-4">
          <button
            onClick={handleVote}
            disabled={!user || voting}
            className={`flex flex-col items-center p-2 rounded hover:bg-gray-100 transition-colors ${
              !user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <span className="text-xl">👍</span>
            <span className="text-sm font-bold text-gray-600">
              {argument.vote_count}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Score Bar Component
const ScoreBar = ({ label, score }) => {
  const getColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{score}/100</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default ArgumentCard;