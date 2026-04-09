import {
  buildStudentDashboardProfile,
  type StudentDashboardCurriculumNode,
  type StudentDashboardData,
  type StudentDashboardPath,
  type StudentDashboardSeed,
  type StudentDashboardRoom,
  type StudentDashboardSkill,
  type StudentDashboardWeeklyActivity,
} from '@/src/features/dashboard/student-dashboard-model';
import { buildDeterministicDashboardSnapshot } from '@/src/features/dashboard/student-dashboard-generation';
import { getAuthenticatedPersonalizationProfile } from './personalization';
import { getAuthenticatedProfile } from './profiles';
import { createClient } from './server';
import { generateDashboardSnapshot } from '@/src/lib/yantra-personalization';

type DashboardPathRow = {
  user_id: string;
  path_title: string;
  path_description: string;
  path_status_label: string;
  path_progress: number;
  current_focus: string;
  recommended_action_title: string;
  recommended_action_description: string;
  recommended_action_prompt: string;
  learning_track_title: string;
  learning_track_description: string;
  completion_estimate_label: string;
  mastery_progress: number;
  mastery_unlocked_count: number;
  mastery_total_count: number;
  next_session_date_day: string;
  next_session_date_month: string;
  next_session_title: string;
  next_session_day_label: string;
  next_session_time_label: string;
  next_session_instructor_name: string;
  next_session_instructor_role: string;
  next_session_instructor_image_url: string;
  weekly_completed_sessions: number;
  weekly_change_label: string;
  momentum_summary: string;
  focus_summary: string;
  consistency_summary: string;
};

type DashboardSkillRow = {
  user_id: string;
  skill_key: string;
  title: string;
  description: string;
  level_label: string;
  progress: number;
  icon_key: StudentDashboardSkill['iconKey'];
  tone_key: StudentDashboardSkill['toneKey'];
  locked: boolean;
  sort_order: number;
};

type DashboardCurriculumNodeRow = {
  user_id: string;
  node_key: string;
  module_label: string;
  title: string;
  description: string;
  status_label: string;
  unlocked: boolean;
  sort_order: number;
};

type DashboardRoomRow = {
  user_id: string;
  room_key: string;
  title: string;
  description: string;
  status_label: string;
  cta_label: string;
  prompt: string;
  featured: boolean;
  texture_key: StudentDashboardRoom['textureKey'];
  sort_order: number;
};

type DashboardWeeklyActivityRow = {
  user_id: string;
  day_key: string;
  day_label: string;
  container_height: number;
  fill_height: number;
  highlighted: boolean;
  sort_order: number;
};

type DashboardQueryResult = {
  pathRow: DashboardPathRow | null;
  skillRows: DashboardSkillRow[];
  curriculumRows: DashboardCurriculumNodeRow[];
  roomRows: DashboardRoomRow[];
  weeklyRows: DashboardWeeklyActivityRow[];
};

type AuthenticatedProfileResult = NonNullable<Awaited<ReturnType<typeof getAuthenticatedProfile>>>;

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

export function isMissingDashboardSchemaError(error: unknown) {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  return (
    code === '42P01' ||
    code === '42703' ||
    code === 'PGRST204' ||
    code === 'PGRST205' ||
    message.includes('relation') ||
    message.includes('column') ||
    message.includes('could not find the table') ||
    message.includes('could not find the column') ||
    message.includes('schema cache') ||
    message.includes('does not exist')
  );
}

function isDashboardAccessError(error: unknown) {
  const code = getErrorCode(error);
  const message = getErrorMessage(error);

  return code === '42501' || message.includes('permission denied') || message.includes('row-level security');
}

function isUniqueViolationError(error: unknown) {
  const code = getErrorCode(error);
  return code === '23505';
}

export function isRecoverableDashboardError(error: unknown) {
  return isMissingDashboardSchemaError(error) || isDashboardAccessError(error);
}


function mapPathRow(row: DashboardPathRow): StudentDashboardPath {
  return {
    pathTitle: row.path_title,
    pathDescription: row.path_description,
    pathStatusLabel: row.path_status_label,
    pathProgress: row.path_progress,
    currentFocus: row.current_focus,
    recommendedActionTitle: row.recommended_action_title,
    recommendedActionDescription: row.recommended_action_description,
    recommendedActionPrompt: row.recommended_action_prompt,
    learningTrackTitle: row.learning_track_title,
    learningTrackDescription: row.learning_track_description,
    completionEstimateLabel: row.completion_estimate_label,
    masteryProgress: row.mastery_progress,
    masteryUnlockedCount: row.mastery_unlocked_count,
    masteryTotalCount: row.mastery_total_count,
    nextSessionDateDay: row.next_session_date_day,
    nextSessionDateMonth: row.next_session_date_month,
    nextSessionTitle: row.next_session_title,
    nextSessionDayLabel: row.next_session_day_label,
    nextSessionTimeLabel: row.next_session_time_label,
    nextSessionInstructorName: row.next_session_instructor_name,
    nextSessionInstructorRole: row.next_session_instructor_role,
    nextSessionInstructorImageUrl: row.next_session_instructor_image_url,
    weeklyCompletedSessions: row.weekly_completed_sessions,
    weeklyChangeLabel: row.weekly_change_label,
    momentumSummary: row.momentum_summary,
    focusSummary: row.focus_summary,
    consistencySummary: row.consistency_summary,
  };
}

function mapSkillRow(row: DashboardSkillRow): StudentDashboardSkill {
  return {
    skillKey: row.skill_key,
    title: row.title,
    description: row.description,
    levelLabel: row.level_label,
    progress: row.progress,
    iconKey: row.icon_key,
    toneKey: row.tone_key,
    locked: row.locked,
    sortOrder: row.sort_order,
  };
}

function mapCurriculumRow(row: DashboardCurriculumNodeRow): StudentDashboardCurriculumNode {
  return {
    nodeKey: row.node_key,
    moduleLabel: row.module_label,
    title: row.title,
    description: row.description,
    statusLabel: row.status_label,
    unlocked: row.unlocked,
    sortOrder: row.sort_order,
  };
}

function mapRoomRow(row: DashboardRoomRow): StudentDashboardRoom {
  return {
    roomKey: row.room_key,
    title: row.title,
    description: row.description,
    statusLabel: row.status_label,
    ctaLabel: row.cta_label,
    prompt: row.prompt,
    featured: row.featured,
    textureKey: row.texture_key,
    sortOrder: row.sort_order,
  };
}

function mapWeeklyRow(row: DashboardWeeklyActivityRow): StudentDashboardWeeklyActivity {
  return {
    dayKey: row.day_key,
    dayLabel: row.day_label,
    containerHeight: row.container_height,
    fillHeight: row.fill_height,
    highlighted: row.highlighted,
    sortOrder: row.sort_order,
  };
}

async function loadDashboardRows(userId: string) {
  const supabase = await createClient();

  const [pathResult, skillsResult, curriculumResult, roomsResult, weeklyResult] = await Promise.all([
    supabase.from('student_dashboard_paths').select('*').eq('user_id', userId).maybeSingle(),
    supabase.from('student_skill_progress').select('*').eq('user_id', userId).order('sort_order', { ascending: true }),
    supabase.from('student_curriculum_nodes').select('*').eq('user_id', userId).order('sort_order', { ascending: true }),
    supabase.from('student_practice_rooms').select('*').eq('user_id', userId).order('sort_order', { ascending: true }),
    supabase.from('student_weekly_activity').select('*').eq('user_id', userId).order('sort_order', { ascending: true }),
  ]);

  const error =
    pathResult.error || skillsResult.error || curriculumResult.error || roomsResult.error || weeklyResult.error || null;

  return {
    error,
    data: {
      pathRow: (pathResult.data as DashboardPathRow | null) ?? null,
      skillRows: (skillsResult.data as DashboardSkillRow[] | null) ?? [],
      curriculumRows: (curriculumResult.data as DashboardCurriculumNodeRow[] | null) ?? [],
      roomRows: (roomsResult.data as DashboardRoomRow[] | null) ?? [],
      weeklyRows: (weeklyResult.data as DashboardWeeklyActivityRow[] | null) ?? [],
    } satisfies DashboardQueryResult,
  };
}

function isDashboardSeedMissing(data: DashboardQueryResult) {
  return (
    !data.pathRow ||
    data.skillRows.length === 0 ||
    data.curriculumRows.length === 0 ||
    data.roomRows.length === 0 ||
    data.weeklyRows.length === 0
  );
}

function isLegacyStarterDashboard(data: DashboardQueryResult) {
  if (!data.pathRow) {
    return false;
  }

  const legacySkillTitles = new Set(data.skillRows.map((row) => row.title));
  const looksLikeLegacySkills =
    legacySkillTitles.has('Python Basics') &&
    legacySkillTitles.has('Logic Building') &&
    legacySkillTitles.has('ML Foundations');
  const looksLikeLegacyRooms = data.roomRows.some((row) => row.title === 'Neural Net Builder');

  return (
    data.pathRow.path_title === 'AI Foundations' &&
    data.pathRow.learning_track_title === 'Machine Learning Starter Track' &&
    data.pathRow.weekly_completed_sessions === 0 &&
    looksLikeLegacySkills &&
    looksLikeLegacyRooms
  );
}

async function persistDashboardSeed(userId: string, seed: StudentDashboardSeed, clearExisting = false) {
  const supabase = await createClient();
  const { path, skills, curriculumNodes, rooms, weeklyActivity } = seed;

  const pathPayload: DashboardPathRow = {
    user_id: userId,
    path_title: path.pathTitle,
    path_description: path.pathDescription,
    path_status_label: path.pathStatusLabel,
    path_progress: path.pathProgress,
    current_focus: path.currentFocus,
    recommended_action_title: path.recommendedActionTitle,
    recommended_action_description: path.recommendedActionDescription,
    recommended_action_prompt: path.recommendedActionPrompt,
    learning_track_title: path.learningTrackTitle,
    learning_track_description: path.learningTrackDescription,
    completion_estimate_label: path.completionEstimateLabel,
    mastery_progress: path.masteryProgress,
    mastery_unlocked_count: path.masteryUnlockedCount,
    mastery_total_count: path.masteryTotalCount,
    next_session_date_day: path.nextSessionDateDay,
    next_session_date_month: path.nextSessionDateMonth,
    next_session_title: path.nextSessionTitle,
    next_session_day_label: path.nextSessionDayLabel,
    next_session_time_label: path.nextSessionTimeLabel,
    next_session_instructor_name: path.nextSessionInstructorName,
    next_session_instructor_role: path.nextSessionInstructorRole,
    next_session_instructor_image_url: path.nextSessionInstructorImageUrl,
    weekly_completed_sessions: path.weeklyCompletedSessions,
    weekly_change_label: path.weeklyChangeLabel,
    momentum_summary: path.momentumSummary,
    focus_summary: path.focusSummary,
    consistency_summary: path.consistencySummary,
  };

  const skillPayload = skills.map<DashboardSkillRow>((skill) => ({
    user_id: userId,
    skill_key: skill.skillKey,
    title: skill.title,
    description: skill.description,
    level_label: skill.levelLabel,
    progress: skill.progress,
    icon_key: skill.iconKey,
    tone_key: skill.toneKey,
    locked: skill.locked,
    sort_order: skill.sortOrder,
  }));

  const curriculumPayload = curriculumNodes.map<DashboardCurriculumNodeRow>((node) => ({
    user_id: userId,
    node_key: node.nodeKey,
    module_label: node.moduleLabel,
    title: node.title,
    description: node.description,
    status_label: node.statusLabel,
    unlocked: node.unlocked,
    sort_order: node.sortOrder,
  }));

  const roomPayload = rooms.map<DashboardRoomRow>((room) => ({
    user_id: userId,
    room_key: room.roomKey,
    title: room.title,
    description: room.description,
    status_label: room.statusLabel,
    cta_label: room.ctaLabel,
    prompt: room.prompt,
    featured: room.featured,
    texture_key: room.textureKey,
    sort_order: room.sortOrder,
  }));

  const weeklyPayload = weeklyActivity.map<DashboardWeeklyActivityRow>((day) => ({
    user_id: userId,
    day_key: day.dayKey,
    day_label: day.dayLabel,
    container_height: day.containerHeight,
    fill_height: day.fillHeight,
    highlighted: day.highlighted,
    sort_order: day.sortOrder,
  }));

  if (clearExisting) {
    // If we are replacing a legacy/stale dashboard, we must clear old keys to prevent 
    // curriculum nodes or skills from different tracks overlapping.
    await Promise.all([
      supabase.from('student_skill_progress').delete().eq('user_id', userId),
      supabase.from('student_curriculum_nodes').delete().eq('user_id', userId),
      supabase.from('student_practice_rooms').delete().eq('user_id', userId),
      supabase.from('student_weekly_activity').delete().eq('user_id', userId),
    ]);
  }

  const [pathResult, skillsResult, curriculumResult, roomsResult, weeklyResult] = await Promise.all([
    supabase.from('student_dashboard_paths').upsert(pathPayload, { onConflict: 'user_id' }),
    supabase.from('student_skill_progress').upsert(skillPayload, { onConflict: 'user_id,skill_key' }),
    supabase.from('student_curriculum_nodes').upsert(curriculumPayload, { onConflict: 'user_id,node_key' }),
    supabase.from('student_practice_rooms').upsert(roomPayload, { onConflict: 'user_id,room_key' }),
    supabase.from('student_weekly_activity').upsert(weeklyPayload, { onConflict: 'user_id,day_key' }),
  ]);

  const error =
    pathResult.error || skillsResult.error || curriculumResult.error || roomsResult.error || weeklyResult.error || null;

  if (!error) {
    return true;
  }

  // If we hit a unique violation, it means another request already seeded the data.
  if (isUniqueViolationError(error)) {
    return true;
  }

  if (isRecoverableDashboardError(error)) {
    return false;
  }

  throw error;
}

function mapDashboardData(
  data: DashboardQueryResult,
  profile: StudentDashboardData['profile'],
  fallback: StudentDashboardSeed,
): StudentDashboardData {
  return {
    profile,
    path: data.pathRow ? mapPathRow(data.pathRow) : fallback.path,
    skills: data.skillRows.length > 0 ? data.skillRows.map(mapSkillRow) : fallback.skills,
    curriculumNodes: data.curriculumRows.length > 0 ? data.curriculumRows.map(mapCurriculumRow) : fallback.curriculumNodes,
    rooms: data.roomRows.length > 0 ? data.roomRows.map(mapRoomRow) : fallback.rooms,
    weeklyActivity: data.weeklyRows.length > 0 ? data.weeklyRows.map(mapWeeklyRow) : fallback.weeklyActivity,
  };
}

function mapSeedToDashboardData(seed: StudentDashboardSeed, profile: StudentDashboardData['profile']): StudentDashboardData {
  return {
    profile,
    path: seed.path,
    skills: seed.skills,
    curriculumNodes: seed.curriculumNodes,
    rooms: seed.rooms,
    weeklyActivity: seed.weeklyActivity,
  };
}

async function buildGeneratedDashboardData(profileResult: AuthenticatedProfileResult) {
  const email = profileResult.user.email ?? '';
  const profile = buildStudentDashboardProfile(profileResult.profile, email);
  const personalization = await getAuthenticatedPersonalizationProfile();
  const generation = await generateDashboardSnapshot(profileResult.profile, personalization);

  return {
    seed: {
      path: generation.snapshot.path,
      skills: generation.snapshot.skills,
      curriculumNodes: generation.snapshot.curriculumNodes,
      rooms: generation.snapshot.rooms,
      weeklyActivity: generation.snapshot.weeklyActivity,
    } satisfies StudentDashboardSeed,
    data: mapSeedToDashboardData(
      {
        path: generation.snapshot.path,
        skills: generation.snapshot.skills,
        curriculumNodes: generation.snapshot.curriculumNodes,
        rooms: generation.snapshot.rooms,
        weeklyActivity: generation.snapshot.weeklyActivity,
      },
      profile,
    ),
  };
}

export async function persistDashboardSnapshotForUser(userId: string, snapshot: StudentDashboardSeed, clearExisting = false) {
  return persistDashboardSeed(userId, snapshot, clearExisting);
}

export async function getAuthenticatedDashboardData(profileResult?: AuthenticatedProfileResult | null) {
  const resolvedProfileResult = profileResult ?? (await getAuthenticatedProfile());

  if (!resolvedProfileResult) {
    return null;
  }

  const email = resolvedProfileResult.user.email ?? '';
  const profile = buildStudentDashboardProfile(resolvedProfileResult.profile, email);
  const fallbackSeed = buildDeterministicDashboardSnapshot(resolvedProfileResult.profile, null);
  const fallback = mapSeedToDashboardData(fallbackSeed, profile);

  const initialLoad = await loadDashboardRows(resolvedProfileResult.user.id);

  if (initialLoad.error) {
    if (isRecoverableDashboardError(initialLoad.error)) {
      return (await buildGeneratedDashboardData(resolvedProfileResult)).data;
    }

    throw initialLoad.error;
  }

  let dashboardRows = initialLoad.data;

  if (isDashboardSeedMissing(dashboardRows) || isLegacyStarterDashboard(dashboardRows)) {
    const generated = await buildGeneratedDashboardData(resolvedProfileResult);
    const seeded = await persistDashboardSeed(resolvedProfileResult.user.id, generated.seed, true);

    if (!seeded) {
      return generated.data;
    }

    const reloaded = await loadDashboardRows(resolvedProfileResult.user.id);

    if (reloaded.error) {
      if (isRecoverableDashboardError(reloaded.error)) {
        return generated.data;
      }

      throw reloaded.error;
    }

    dashboardRows = reloaded.data;
  }

  return mapDashboardData(dashboardRows, profile, fallbackSeed);
}
