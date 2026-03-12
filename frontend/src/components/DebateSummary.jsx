import React, { useState } from 'react';

const DebateSummary = ({ debate, onGenerateSummary, currentUser }) => {
  const [generating, setGenerating] = useState(false);

  // Parse summary JSON
  let summaryData = null;
  if (debate.ai_summary) {
    try {
      summaryData = JSON.parse(debate.ai_summary);
    } catch (e) {
      console.error('Failed to parse summary:', e);
    }
  }

  const handleGenerateSummary = async () => {
    setGenerating(true);
    await onGenerateSummary();
    setGenerating(false);
  };

  // Check if user can generate summary (moderator/admin or creator)
  const canGenerateSummary = currentUser && (
    currentUser.role === 'admin' ||
    currentUser.role === 'moderator' ||
    currentUser.id === debate.creator_id
  );

  if (!summaryData && !canGenerateSummary) {
    return null; // Don't show anything if no summary and user can't generate
  }

  const getWinnerBadge = (winner) => {
    if (winner === 'pro') {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-bold">✓ PRO WINS</span>;
    } else if (winner === 'con') {
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold">✓ CON WINS</span>;
    } else {
      return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full font-bold">⚖️ TIE</span>;
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg p-6 mb-6 border-2 border-indigo-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
          🤖 AI Debate Analysis
        </h2>
        {summaryData && summaryData.summary_generated_at && (
          <span className="text-xs text-gray-500">
            Generated {new Date(debate.summary_generated_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {!summaryData && canGenerateSummary && (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Generate an AI-powered summary and analysis of this debate
          </p>
          <button
            onClick={handleGenerateSummary}
            disabled={generating}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-semibold"
          >
            {generating ? '⏳ Generating Summary...' : '🤖 Generate AI Summary'}
          </button>
        </div>
      )}

      {summaryData && (
        <div className="space-y-6">
          {/* Winner Declaration */}
          <div className="text-center py-4 bg-white rounded-lg">
            {getWinnerBadge(summaryData.winner)}
            <p className="text-sm text-gray-600 mt-2 italic">
              {summaryData.winner_reasoning}
            </p>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg p-5">
            <h3 className="font-bold text-lg mb-3 text-gray-800">📋 Debate Summary</h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {summaryData.summary}
            </div>
          </div>

          {/* Key Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pro Key Points */}
            <div className="bg-white rounded-lg p-5 border-l-4 border-green-500">
              <h3 className="font-bold text-green-700 mb-3">✓ Key PRO Points</h3>
              <ul className="space-y-2">
                {summaryData.key_points_pro?.map((point, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-green-600">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Con Key Points */}
            <div className="bg-white rounded-lg p-5 border-l-4 border-red-500">
              <h3 className="font-bold text-red-700 mb-3">✗ Key CON Points</h3>
              <ul className="space-y-2">
                {summaryData.key_points_con?.map((point, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-red-600">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Common Ground */}
          {summaryData.common_ground && (
            <div className="bg-white rounded-lg p-5">
              <h3 className="font-bold text-purple-700 mb-2">🤝 Common Ground</h3>
              <p className="text-gray-700 text-sm italic">
                {summaryData.common_ground}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DebateSummary;