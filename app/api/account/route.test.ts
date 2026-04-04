import assert from 'node:assert/strict';
import test from 'node:test';
import { DELETE, accountRouteDeps } from './route';

test('DELETE /api/account requires the confirmation phrase', async (t) => {
  const originalDeps = { ...accountRouteDeps };
  t.after(() => Object.assign(accountRouteDeps, originalDeps));

  accountRouteDeps.hasSupabaseEnv = () => true;
  accountRouteDeps.hasSupabaseServiceRoleEnv = () => true;
  accountRouteDeps.getAuthenticatedUser = async () => ({ id: 'user-123', email: 'asha@example.com' } as never);

  const response = await DELETE(
    new Request('http://localhost/api/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmationText: 'DELETE' }),
    }),
  );
  const data = (await response.json()) as { error?: string };

  assert.equal(response.status, 400);
  assert.match(data.error || '', /delete account/i);
});

test('DELETE /api/account deletes the auth user and signs the session out', async (t) => {
  const originalDeps = { ...accountRouteDeps };
  t.after(() => Object.assign(accountRouteDeps, originalDeps));

  let deletedUserId = '';
  let signedOut = false;
  const deletedTables: string[] = [];

  accountRouteDeps.hasSupabaseEnv = () => true;
  accountRouteDeps.hasSupabaseServiceRoleEnv = () => true;
  accountRouteDeps.getAuthenticatedUser = async () => ({ id: 'user-123', email: 'asha@example.com' } as never);
  accountRouteDeps.createAdminClient = () =>
    ({
      from: (table: string) => ({
        delete: () => ({
          eq: async (_column: string, userId: string) => {
            deletedTables.push(`${table}:${userId}`);
            return { error: null };
          },
        }),
      }),
      auth: {
        admin: {
          deleteUser: async (userId: string) => {
            deletedUserId = userId;
            return { error: null };
          },
        },
      },
    }) as never;
  accountRouteDeps.createClient = async () =>
    ({
      auth: {
        signOut: async () => {
          signedOut = true;
          return { error: null };
        },
      },
    }) as never;

  const response = await DELETE(
    new Request('http://localhost/api/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmationText: 'DELETE ACCOUNT' }),
    }),
  );
  const data = (await response.json()) as { success?: boolean; redirectTo?: string };

  assert.equal(response.status, 200);
  assert.equal(data.success, true);
  assert.equal(deletedUserId, 'user-123');
  assert.equal(signedOut, true);
  assert.deepEqual(deletedTables, [
    'student_weekly_activity:user-123',
    'student_practice_rooms:user-123',
    'student_curriculum_nodes:user-123',
    'student_skill_progress:user-123',
    'student_dashboard_paths:user-123',
    'student_personalization_profiles:user-123',
    'chat_histories:user-123',
    'profiles:user-123',
  ]);
  assert.match(data.redirectTo || '', /kind=info/i);
});

test('DELETE /api/account ignores missing optional tables and still deletes the user', async (t) => {
  const originalDeps = { ...accountRouteDeps };
  t.after(() => Object.assign(accountRouteDeps, originalDeps));

  let deletedUserId = '';

  accountRouteDeps.hasSupabaseEnv = () => true;
  accountRouteDeps.hasSupabaseServiceRoleEnv = () => true;
  accountRouteDeps.getAuthenticatedUser = async () => ({ id: 'user-123', email: 'asha@example.com' } as never);
  accountRouteDeps.createAdminClient = () =>
    ({
      from: (table: string) => ({
        delete: () => ({
          eq: async () => {
            if (table === 'student_personalization_profiles') {
              return {
                error: {
                  code: 'PGRST205',
                  message: "Could not find the table 'public.student_personalization_profiles' in the schema cache",
                },
              };
            }

            return { error: null };
          },
        }),
      }),
      auth: {
        admin: {
          deleteUser: async (userId: string) => {
            deletedUserId = userId;
            return { error: null };
          },
        },
      },
    }) as never;
  accountRouteDeps.createClient = async () =>
    ({
      auth: {
        signOut: async () => ({ error: null }),
      },
    }) as never;

  const response = await DELETE(
    new Request('http://localhost/api/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmationText: 'DELETE ACCOUNT' }),
    }),
  );
  const data = (await response.json()) as { success?: boolean };

  assert.equal(response.status, 200);
  assert.equal(data.success, true);
  assert.equal(deletedUserId, 'user-123');
});
