import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { debateAPI, tagAPI } from '../services/api';

const CreateDebate = () => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await tagAPI.getTags();
      setAvailableTags(response.data);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await debateAPI.createDebate({
        topic,
        description,
        tag_ids: selectedTags
      });
      navigate(`/debate/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create debate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-3xl font-bold mb-2">Create a Debate</h2>
          <p className="text-gray-500 mb-6">
            AI will automatically generate balanced pro and con arguments for your topic
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Debate Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Should AI be regulated by governments?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                maxLength={500}
              />
              <p className="text-xs text-gray-400 mt-1">{topic.length}/500</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more context about this debate topic..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Tags Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tags <span className="text-gray-400">(optional - select up to 3)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    disabled={!selectedTags.includes(tag.id) && selectedTags.length >= 3}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTags.includes(tag.id)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-indigo-700 text-sm">
                🤖 <strong>AI will generate:</strong> A balanced pro argument and con argument
                for your topic automatically when you create the debate.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !topic.trim()}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-semibold transition-colors"
            >
              {loading ? (
                <span>⏳ AI is generating arguments...</span>
              ) : (
                <span>🚀 Create Debate</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateDebate;