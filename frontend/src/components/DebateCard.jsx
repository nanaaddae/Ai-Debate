import React from 'react';
import { Link } from 'react-router-dom';

const DebateCard = ({ debate }) =>
{

     if (!debate) {
    return null;
  }
  const totalVotes = debate.pro_votes + debate.con_votes;
  const proPercentage = totalVotes > 0 ? Math.round((debate.pro_votes / totalVotes) * 100) : 50;
  const conPercentage = totalVotes > 0 ? Math.round((debate.con_votes / totalVotes) * 100) : 50;

  return (
    <Link to={`/debate/${debate.id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200">

        {/* Status Badge */}
        <div className="flex justify-between items-start mb-3">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${
            debate.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {debate.status.toUpperCase()}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(debate.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Topic */}
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {debate.topic}
        </h3>

        {/* Vote Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-green-600 font-medium">PRO {proPercentage}%</span>
            <span className="text-red-600 font-medium">CON {conPercentage}%</span>
          </div>
          <div className="flex rounded-full overflow-hidden h-3">
            <div
              className="bg-green-500 transition-all duration-300"
              style={{ width: `${proPercentage}%` }}
            />
            <div
              className="bg-red-500 transition-all duration-300"
              style={{ width: `${conPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-center">
            {totalVotes} total votes
          </p>
        </div>
      </div>
    </Link>
  );
};

export default DebateCard;