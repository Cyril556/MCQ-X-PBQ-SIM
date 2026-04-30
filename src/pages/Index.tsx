import { useState } from 'react';
import { StartScreen } from '@/components/StartScreen';
import { NewExamEngine } from '@/components/NewExamEngine';
import { ReviewMode } from '@/components/ReviewMode';
import { ReadinessDashboard } from '@/components/ReadinessDashboard';
import { buildExam, buildStudyQuestions, mcqSingle, mcqSelectTwo, shuffleOptions, type Domain, type ExamNumber, type MCQuestion } from '@/data/questions';
import { loadQuestionStats } from '@/lib/examHistory';

type AppView = 'start' | 'exam' | 'study' | 'review' | 'readiness';

const Index = () => {
  const [view, setView] = useState<AppView>('start');
  const [examData, setExamData] = useState<ReturnType<typeof buildExam> | null>(null);
  const [studyQuestions, setStudyQuestions] = useState<MCQuestion[]>([]);

  const handleStartExam = (examNumber: ExamNumber = 1) => {
    const exam = buildExam(examNumber);
    setExamData(exam);
    setView('exam');
  };

  const handleStartStudy = (domain?: Domain) => {
    setStudyQuestions(buildStudyQuestions(domain));
    setView('study');
  };

  const handlePracticeFailed = () => {
    const stats = loadQuestionStats();
    const failedIds = new Set(
      Object.values(stats)
        .filter(s => s.type === 'mcq' && s.timesFailed > 0)
        .map(s => s.questionId)
    );
    const all = [...mcqSingle, ...mcqSelectTwo];
    const failedQs = all.filter(q => failedIds.has(q.id)).map(shuffleOptions);
    if (failedQs.length === 0) return;
    setStudyQuestions(failedQs.sort(() => Math.random() - 0.5));
    setView('study');
  };

  if (view === 'exam' && examData) {
    return (
      <NewExamEngine
        pbqs={examData.pbqs}
        mcqs={examData.mcqs}
        examNumber={examData.examNumber}
        durationMinutes={90}
        onFinish={() => { setExamData(null); setView('start'); }}
      />
    );
  }

  if (view === 'study') {
    return (
      <NewExamEngine
        pbqs={[]}
        mcqs={studyQuestions}
        durationMinutes={0}
        isStudyMode
        onFinish={() => setView('start')}
      />
    );
  }

  if (view === 'review') {
    return <ReviewMode onBack={() => setView('start')} onPracticeFailed={handlePracticeFailed} />;
  }

  if (view === 'readiness') {
    return <ReadinessDashboard onBack={() => setView('start')} />;
  }

  return (
    <StartScreen
      onStartExam={handleStartExam}
      onStartStudy={handleStartStudy}
      onOpenReview={() => setView('review')}
      onOpenReadiness={() => setView('readiness')}
      onPracticeFailed={handlePracticeFailed}
    />
  );
};

export default Index;
