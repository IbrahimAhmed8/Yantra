import type { EditorAuthedUser } from '@/editor/types';

export const PUBLIC_VISITOR_ID = 'yantra-public-user';
export const PUBLIC_VISITOR_EMAIL = 'local@yantra.test';

export const PUBLIC_EDITOR_USER: EditorAuthedUser = {
  id: PUBLIC_VISITOR_ID,
  email: PUBLIC_VISITOR_EMAIL,
};
