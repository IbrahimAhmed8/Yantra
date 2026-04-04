import { ChatProvider } from '@/src/features/chat/ChatWidget';
import StudentProfileShell from '@/src/features/dashboard/StudentProfileShell';

export default function StudentProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      <StudentProfileShell>{children}</StudentProfileShell>
    </ChatProvider>
  );
}
