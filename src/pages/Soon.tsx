import { useSearchParams } from 'react-router-dom';
import { Empty, Header } from '../components/ui';

const LABELS: Record<string, string> = { messages: 'Messages', notifications: 'Notifications' };
export default function Soon() {
  const page = useSearchParams()[0].get('page') ?? '';
  return (
    <>
      <Header title={LABELS[page] ?? 'Bientôt'} />
      <Empty title="Bientôt disponible" text="Cet écran du nouveau design sera ajouté dans une prochaine version du prototype." />
    </>
  );
}
