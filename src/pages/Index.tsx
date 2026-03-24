import { useState } from 'react';
import { StartScreen } from '@/components/StartScreen';
import { NewExamEngine } from '@/components/NewExamEngine';
import { ReviewMode } from '@/components/ReviewMode';
import { ReadinessDashboard } from '@/components/ReadinessDashboard';
import { buildExam, buildStudyQuestions, type Domain } from '@/data/questions';

type AppView = 'start' | 'exam' | 'study' | 'review' | 'readiness';

const Index = () => {
  const [view, setView] = useState<AppView>('start');
  const [examData, setExamData] = useState<ReturnType<typeof buildExam> | null>(null);
  const [studyQuestions, setStudyQuestions] = useState<ReturnType<typeof buildStudyQuestions>>([]);

  const handleStartExam = () => {
    const exam = buildExam();
    setExamData(exam);
    setView('exam');
  };

  const handleStartStudy = (domain?: Domain) => {
    setStudyQuestions(buildStudyQuestions(domain));
    setView('study');
  };

  if (view === 'exam' && examData) {
    return (
      <NewExamEngine
        pbqs={examData.pbqs}
        mcqs={examData.mcqs}
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
    return <ReviewMode onBack={() => setView('start')} />;
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
    />
  );
};

export default Index;
