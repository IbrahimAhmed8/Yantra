import {
  normalizeApprovedPersonalizationFacts,
  normalizeStudentPersonalizationProfile,
  type ApprovedPersonalizationFacts,
  type PersonalizationSourceProvider,
  type StudentPersonalizationProfile,
} from '@/src/features/dashboard/student-personalization-model';
import { getAuthenticatedUser } from './profiles';
import { createClient } from './server';

type PersonalizationProfileRow = {
  user_id: string;
  source_provider: PersonalizationSourceProvider | null;
  source_prompt_version: string | null;
  approved_facts: ApprovedPersonalizationFacts | null;
  learner_summary: string | null;
  confidence_summary: string | null;
  assumptions: string[] | null;
  dismissed_at: string | null;
  last_generated_at: string | null;
  last_model_provider: string | null;
  last_model_name: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type PersonalizationProfileUpsert = {
  sourceProvider?: PersonalizationSourceProvider | null;
  sourcePromptVersion?: string | null;
  approvedFacts?: ApprovedPersonalizationFacts | null;
  learnerSummary?: string;
  confidenceSummary?: string;
  assumptions?: string[];
  dismissedAt?: string | null;
  lastGeneratedAt?: string | null;
  lastModelProvider?: string | null;
  lastModelName?: string | null;
};

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

function isRecoverablePersonalizationStorageError(error: unknown) {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  return (
    code === '42P01' ||
    code === 'PGRST205' ||
    code === '42501' ||
    message.includes('relation') ||
    message.includes('could not find the table') ||
    message.includes('does not exist') ||
    message.includes('permission denied') ||
    message.includes('row-level security')
  );
}

function mapRowToProfile(row: PersonalizationProfileRow | null): StudentPersonalizationProfile | null {
  if (!row) {
    return null;
  }

  return normalizeStudentPersonalizationProfile({
    sourceProvider: row.source_provider,
    sourcePromptVersion: row.source_prompt_version,
    approvedFacts: normalizeApprovedPersonalizationFacts(row.approved_facts),
    learnerSummary: row.learner_summary ?? '',
    confidenceSummary: row.confidence_summary ?? '',
    assumptions: row.assumptions ?? [],
    dismissedAt: row.dismissed_at,
    lastGeneratedAt: row.last_generated_at,
    lastModelProvider: row.last_model_provider,
    lastModelName: row.last_model_name,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  });
}

function mapProfileUpsertToRow(userId: string, input: PersonalizationProfileUpsert): Partial<PersonalizationProfileRow> {
  return {
    user_id: userId,
    ...(input.sourceProvider !== undefined ? { source_provider: input.sourceProvider } : {}),
    ...(input.sourcePromptVersion !== undefined ? { source_prompt_version: input.sourcePromptVersion } : {}),
    ...(input.approvedFacts !== undefined ? { approved_facts: input.approvedFacts } : {}),
    ...(input.learnerSummary !== undefined ? { learner_summary: input.learnerSummary } : {}),
    ...(input.confidenceSummary !== undefined ? { confidence_summary: input.confidenceSummary } : {}),
    ...(input.assumptions !== undefined ? { assumptions: input.assumptions } : {}),
    ...(input.dismissedAt !== undefined ? { dismissed_at: input.dismissedAt } : {}),
    ...(input.lastGeneratedAt !== undefined ? { last_generated_at: input.lastGeneratedAt } : {}),
    ...(input.lastModelProvider !== undefined ? { last_model_provider: input.lastModelProvider } : {}),
    ...(input.lastModelName !== undefined ? { last_model_name: input.lastModelName } : {}),
  };
}

export async function getAuthenticatedPersonalizationProfile() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from('student_personalization_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return mapRowToProfile((data as PersonalizationProfileRow | null) ?? null);
  } catch (error) {
    if (isRecoverablePersonalizationStorageError(error)) {
      return null;
    }

    throw error;
  }
}

export async function upsertAuthenticatedPersonalizationProfile(input: PersonalizationProfileUpsert) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const payload = mapProfileUpsertToRow(user.id, input);

  try {
    const { data, error } = await supabase
      .from('student_personalization_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return mapRowToProfile(data as PersonalizationProfileRow);
  } catch (error) {
    if (isRecoverablePersonalizationStorageError(error)) {
      return null;
    }

    throw error;
  }
}
