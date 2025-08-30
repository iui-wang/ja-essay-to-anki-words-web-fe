import React from 'react';
import { JLPT_LEVELS } from '../constants/config';

interface TextInputSectionProps {
  text: string;
  setText: (text: string) => void;
  selectedLevels: string[];
  setSelectedLevels: (levels: string[]) => void;
  onSubmit: () => void;
  loading: boolean;
}

export const TextInputSection: React.FC<TextInputSectionProps> = ({
  text,
  setText,
  selectedLevels,
  setSelectedLevels,
  onSubmit,
  loading
}) => {
  const handleLevelToggle = (level: string) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(l => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  return (
    <div className="flex gap-6">
      {/* 单词书选择 */}
      <div className="w-48">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Word Books</h3>
        <div className="space-y-3">
          {JLPT_LEVELS.map((level) => (
            <label key={level} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLevels.includes(level)}
                onChange={() => handleLevelToggle(level)}
                className="checkbox-custom"
              />
              <span className="text-sm font-medium text-gray-700">
                {level}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 文本输入 */}
      <div className="flex-1">
        <div className="mb-4">
          <label className="block text-lg font-medium text-gray-900 mb-2">
            Enter Japanese Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter or paste Japanese text here..."
            className="input-field h-64 resize-none text-base"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Supports long text input, recommend entering complete articles or paragraphs for better vocabulary extraction.
          </p>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading || !text.trim() || selectedLevels.length === 0}
          className="btn-primary px-6 py-3 text-base disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            'Generate Flashcards'
          )}
        </button>
      </div>
    </div>
  );
};