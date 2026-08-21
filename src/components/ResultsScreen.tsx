import React, { useState } from 'react';

interface ResultsScreenProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  questions?: any[];
  onRetake: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  score,
  totalQuestions,
  correctAnswers,
  questions = [],
  onRetake,
}) => {
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct'>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const filteredQuestions = questions.filter((q) => {
    const isCorrect = q.isCorrect;
    if (filter === 'wrong') return !isCorrect;
    if (filter === 'correct') return isCorrect;
    return true;
  });

  const wrongCount = questions.filter((q) => !q.isCorrect).length;
  const correctCount = questions.filter((q) => q.isCorrect).length;

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpanded(newExpanded);
  };

  return (
    <div className="results-screen">
      <div className="results-header">
        <h1>📊 Exam Results</h1>
        <button onClick={onRetake} className="btn-retake">🔄 Retake Exam</button>
      </div>

      <div className="score-card">
        <div className="score-value">{score}</div>
        <div className="score-label">out of 900</div>
        <div className="score-status">{score >= 750 ? '✅ PASSED' : '❌ FAILED'}</div>
        <div className="passing-score">Passing score: 750</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card correct">
          <div className="stat-value">{correctCount}/{totalQuestions}</div>
          <div className="stat-label">Correct</div>
        </div>
        <div className="stat-card wrong">
          <div className="stat-value">{wrongCount}/{totalQuestions}</div>
          <div className="stat-label">Wrong</div>
        </div>
        <div className="stat-card percentage">
          <div className="stat-value">{Math.round((correctCount / totalQuestions) * 100)}%</div>
          <div className="stat-label">Accuracy</div>
        </div>
      </div>

      <div className="review-filters">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          All ({questions.length})
        </button>
        <button className={filter === 'wrong' ? 'active' : ''} onClick={() => setFilter('wrong')}>
          Wrong ({wrongCount})
        </button>
        <button className={filter === 'correct' ? 'active' : ''} onClick={() => setFilter('correct')}>
          Correct ({correctCount})
        </button>
      </div>

      <div className="expand-controls">
        <button onClick={() => setExpanded(new Set(filteredQuestions.map((_, i) => i)))}>
          Expand All
        </button>
        <button onClick={() => setExpanded(new Set())}>Collapse All</button>
      </div>

      <div className="questions-review">
        {filteredQuestions.map((q, index) => {
          const isExpanded = expanded.has(index);
          return (
            <div key={q.id || index} className={`question-review ${q.isCorrect ? 'correct' : 'wrong'}`}>
              <div className="question-header" onClick={() => toggleExpand(index)}>
                <span className="question-number">Question {index + 1}</span>
                {q.isPBQ && <span className="pbq-badge">🔥 PBQ</span>}
                <span className="domain-badge">{q.domain}</span>
                <span className="status-icon">{q.isCorrect ? '✅' : '❌'}</span>
                <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
              </div>

              {isExpanded && (
                <div className="question-body">
                  <div className="question-text">
                    <strong>Question:</strong>
                    <p>{q.questionText || q.question}</p>
                  </div>

                  <div className={`your-answer ${q.isCorrect ? 'correct-answer' : 'wrong-answer'}`}>
                    <strong>Your Answer:</strong>
                    <div className="answer-content">
                      {Array.isArray(q.userAnswer) ? q.userAnswer.join(', ') : q.userAnswer || 'No answer'}
                    </div>
                    {!q.isCorrect && <div className="wrong-indicator">❌ Incorrect</div>}
                  </div>

                  {!q.isCorrect && (
                    <div className="correct-answer-display">
                      <strong>Correct Answer:</strong>
                      <div className="answer-content">
                        {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}
                      </div>
                    </div>
                  )}

                  <div className="explanation-section">
                    <strong>📖 Explanation:</strong>
                    <p className="explanation-text">{q.explanation || 'No explanation available'}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
