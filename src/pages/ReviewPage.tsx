import { useNavigate } from 'react-router-dom';
import { ReviewMode } from '@/components/ReviewMode';
import { mcqSingle, mcqSelectTwo, shuffleOptions } from '@/data/questions';
import { loadQuestionStats } from '@/lib/examHistory';
import { useState } from 'react';
import { NewExamEngine } from '@/components/NewExamEngine';

export default function ReviewPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<ReturnType<typeof shuffleOptions>[] | null>(null);

  const startFailed = () => {
    const stats = loadQuestionStats();
    const failedIds = new Set(
      Object.values(stats).filter((s) => s.type === 'mcq' && s.timesFailed > 0).map((s) => s.questionId)
    );
    const all = [...mcqSingle, ...mcqSelectTwo];
    const failedQs = all.filter((q) => failedIds.has(q.id)).map(shuffleOptions);
    if (failedQs.length === 0) return;
    setQuestions(failedQs.sort(() => Math.random() - 0.5));
  };

  if (questions) {
    return (
      <NewExamEngine
        pbqs={[]}
        mcqs={questions}
        durationMinutes={0}
        isStudyMode
        onFinish={() => { setQuestions(null); }}
      />
    );
  }

  return <ReviewMode onBack={() => navigate('/')} onPracticeFailed={startFailed} />;
}
