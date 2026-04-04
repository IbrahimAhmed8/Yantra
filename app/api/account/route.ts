import { NextResponse } from 'next/server';
import { createAdminClient, hasSupabaseServiceRoleEnv } from '@/src/lib/supabase/admin';
import { hasSupabaseEnv } from '@/src/lib/supabase/env';
import { getAuthenticatedUser } from '@/src/lib/supabase/profiles';
import { createClient } from '@/src/lib/supabase/server';

export const runtime = 'nodejs';

const DELETE_ACCOUNT_CONFIRMATION = 'DELETE ACCOUNT';

function normalizeDeleteAccountInput(value: unknown) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const confirmationText = typeof candidate.confirmationText === 'string' ? candidate.confirmationText.trim() : '';

  if (!confirmationText) {
    return null;
  }

  return {
    confirmationText,
  };
}

export const accountRouteDeps = {
  hasSupabaseEnv,
  hasSupabaseServiceRoleEnv,
  getAuthenticatedUser,
  createAdminClient,
  createClient,
};

const userScopedTables = [
  { name: 'student_weekly_activity', column: 'user_id' },
  { name: 'student_practice_rooms', column: 'user_id' },
  { name: 'student_curriculum_nodes', column: 'user_id' },
  { name: 'student_skill_progress', column: 'user_id' },
  { name: 'student_dashboard_paths', column: 'user_id' },
  { name: 'student_personalization_profiles', column: 'user_id' },
  { name: 'chat_histories', column: 'user_id' },
  { name: 'profiles', column: 'id' },
] as const;

function getErrorCode(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return '';
  }

  return String((error as { code?: unknown }).code ?? '');
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.toLowerCase();
  }

  if (!error || typeof error !== 'object' || !('message' in error)) {
    return '';
  }

  return String((error as { message?: unknown }).message ?? '').toLowerCase();
}

function isRecoverableDeleteTableError(error: unknown) {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    message.includes('could not find the table') ||
    message.includes('does not exist') ||
    message.includes('schema cache')
  );
}

export async function DELETE(request: Request) {
  if (!accountRouteDeps.hasSupabaseEnv()) {
    return NextResponse.json({ error: 'Supabase is not configured yet.' }, { status: 500 });
  }

  if (!accountRouteDeps.hasSupabaseServiceRoleEnv()) {
    return NextResponse.json(
      { error: 'Account deletion is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY on the server first.' },
      { status: 500 },
    );
  }

  const user = await accountRouteDeps.getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => null);
    const input = normalizeDeleteAccountInput(body);

    if (!input || input.confirmationText.toUpperCase() !== DELETE_ACCOUNT_CONFIRMATION) {
      return NextResponse.json(
        { error: `Type "${DELETE_ACCOUNT_CONFIRMATION}" to confirm account deletion.` },
        { status: 400 },
      );
    }

    const admin = accountRouteDeps.createAdminClient();
    const sessionClient = await accountRouteDeps.createClient();

    for (const table of userScopedTables) {
      const { error } = await admin.from(table.name).delete().eq(table.column, user.id);

      if (error) {
        if (isRecoverableDeleteTableError(error)) {
          continue;
        }

        throw error;
      }
    }

    const { error } = await admin.auth.admin.deleteUser(user.id, false);

    if (error) {
      throw error;
    }

    await sessionClient.auth.signOut().catch(() => undefined);

    return NextResponse.json({
      success: true,
      redirectTo: '/?message=Your%20Yantra%20account%20was%20deleted.&kind=info',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete the account right now.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
