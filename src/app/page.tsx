import { UserProvider } from '@/components/user-context';
import VotingPlatform from '@/components/voting-platform';

export default function Home() {
  return (
    <UserProvider>
      <VotingPlatform />
    </UserProvider>
  );
}