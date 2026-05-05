import { useNavigate } from 'react-router-dom';
import { PBQPractice } from '@/components/PBQPractice';

export default function PBQPage() {
  const navigate = useNavigate();
  return <PBQPractice onFinish={() => navigate('/')} />;
}
