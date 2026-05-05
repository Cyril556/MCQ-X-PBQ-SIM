import { useNavigate } from 'react-router-dom';
import { ReadinessDashboard } from '@/components/ReadinessDashboard';

export default function AnalyticsPage() {
  const navigate = useNavigate();
  return <ReadinessDashboard onBack={() => navigate('/')} />;
}
