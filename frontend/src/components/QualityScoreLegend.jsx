import React from 'react';

const QualityScoreLegend = () => {
  return (
    <div className="bg-indigo-50 rounded-lg p-4 mb-6">
      <h3 className="font-bold text-indigo-900 mb-2">🎯 AI Quality Scores</h3>
      <p className="text-sm text-indigo-700 mb-3">
        Arguments are automatically scored by AI on four criteria:
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-semibold text-indigo-900">Logic:</span>
          <span className="text-indigo-700"> Reasoning soundness & coherence</span>
        </div>
        <div>
          <span className="font-semibold text-indigo-900">Evidence:</span>
          <span className="text-indigo-700"> Facts, data & examples</span>
        </div>
        <div>
          <span className="font-semibold text-indigo-900">Relevance:</span>
          <span className="text-indigo-700"> How on-topic it is</span>
        </div>
        <div>
          <span className="font-semibold text-indigo-900">Persuasiveness:</span>
          <span className="text-indigo-700"> Overall convincingness</span>
        </div>
      </div>
      <div className="mt-3 flex gap-4 text-xs">
        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">80-100: Excellent</span>
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">60-79: Good</span>
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">40-59: Fair</span>
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded">0-39: Weak</span>
      </div>
    </div>
  );
};

export default QualityScoreLegend;