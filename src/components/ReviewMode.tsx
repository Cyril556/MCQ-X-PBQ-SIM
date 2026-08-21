import React, { useState } from 'react';
import './ReviewMode.css';

interface Question {
  id: string;
  questionText: string;
  userAnswer: any;
  correctAnswer: any;
  explanation: string;
  domain: string;
  isPBQ: boolean;
}

interface ReviewModeProps {
  questions: Question[];
  score: number;
  totalQuestions: number;
  onRetake: () => void;
}

export const ReviewMode: React.FC<ReviewModeProps> = ({
  questions,
  score,
  totalQuestions,
  onRetake,
}) => {
  const [filter, setFilter] = useState<'all' | 'wrong' | 'correct' | 'pbq'>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const expandAll = () => {
    setExpandedQuestions(new Set(filteredQuestions.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedQuestions(new Set());
  };

  const filteredQuestions = questions.filter((q) => {
    if (filter === 'wrong') return JSON.stringify(q.userAnswer) !== JSON.stringify(q.correctAnswer);
    if (filter === 'correct') return JSON.stringify(q.userAnswer) === JSON.stringify(q.correctAnswer);
    if (filter === 'pbq') return q.isPBQ;
    return true;
  });

  const wrongCount = questions.filter((q) => JSON.stringify(q.userAnswer) !== JSON.stringify(q.correctAnswer)).length;
  const correctCount = questions.length - wrongCount;
  const pbqCount = questions.filter((q) => q.isPBQ).length;

  return (
    <div className="review-mode">
      <div className="review-header">
        <h1>📊 Exam Results</h1>
        <button onClick={onRetake} className="btn-retake">🔄 Retake Exam</button>
      </div>

      <div className="score-summary">
        <div className="score-card">
          <div className="score-value">{score}</div>
          <div className="score-label">Score</div>
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
          <div className="stat-card pbq">
            <div className="stat-value">{pbqCount}</div>
            <div className="stat-label">PBQs</div>
          </div>
        </div>
      </div>

      <div className="review-controls">
        <div className="review-filters">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All ({questions.length})</button>
          <button className={filter === 'wrong' ? 'active' : ''} onClick={() => setFilter('wrong')}>Wrong ({wrongCount})</button>
          <button className={filter === 'correct' ? 'active' : ''} onClick={() => setFilter('correct')}>Correct ({correctCount})</button>
          <button className={filter === 'pbq' ? 'active' : ''} onClick={() => setFilter('pbq')}>PBQs ({pbqCount})</button>
        </div>
        <div className="expand-controls">
          <button onClick={expandAll} className="btn-expand">Expand All</button>
          <button onClick={collapseAll} className="btn-expand">Collapse All</button>
        </div>
      </div>

      <div className="questions-review">
        {filteredQuestions.map((q, index) => {
          const isCorrect = JSON.stringify(q.userAnswer) === JSON.stringify(q.correctAnswer);
          const isExpanded = expandedQuestions.has(index);
          
          return (
            <div key={q.id} className={`question-review ${isCorrect ? 'correct' : 'wrong'}`}>
              <div className="question-header" onClick={() => toggleQuestion(index)}>
                <span className="question-number">Question {index + 1}</span>
                {q.isPBQ && <span className="pbq-badge">🔥 PBQ</span>}
                <span className="domain-badge">{q.domain}</span>
                <span className="status-icon">{isCorrect ? '✅' : '❌'}</span>
                <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
              </div>

              {isExpanded && (
                <div className="question-body">
                  <div className="question-text">
                    <strong>Question:</strong>
                    <p>{q.questionText}</p>
                  </div>

                  <div className={`your-answer ${isCorrect ? 'correct-answer' : 'wrong-answer'}`}>
                    <strong>Your Answer:</strong>
                    <div className="answer-content">
                      {Array.isArray(q.userAnswer) ? q.userAnswer.join(', ') : q.userAnswer || 'No answer'}
                    </div>
                    {!isCorrect && <div className="wrong-indicator">❌ Incorrect</div>}
                  </div>

                  {!isCorrect && (
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
