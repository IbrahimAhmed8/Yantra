import type { StudentDashboardData } from '@/src/features/dashboard/student-dashboard-model';
import { getAuthenticatedChatHistory } from '@/src/lib/supabase/chat-history';
import { getAuthenticatedDashboardData } from '@/src/lib/supabase/dashboard';
import { getAuthenticatedProfile } from '@/src/lib/supabase/profiles';
import { buildYantraStudentContextFromData } from '@/src/lib/yantra-student-context';
import { getYantraAiServiceTimeoutMs, getYantraAiServiceUrl } from '@/src/lib/yantra-ai-service';

type AuthenticatedProfileResult = NonNullable<Awaited<ReturnType<typeof getAuthenticatedProfile>>>;

type DashboardRecommendationResponse = {
  title?: string;
  description?: string;
  prompt?: string;
  provider?: string;
  model_used?: string | null;
};

export type DashboardRecommendation = {
  title: string;
  description: string;
  prompt: string;
  provider: string;
  modelUsed: string | null;
};

type DashboardRecommendationOptions = {
  profileResult?: AuthenticatedProfileResult | null;
  dashboardData?: StudentDashboardData | null;
};

export async function getAuthenticatedDashboardRecommendation(
  options: DashboardRecommendationOptions = {},
): Promise<DashboardRecommendation | null> {
  const serviceUrl = getYantraAiServiceUrl();

  if (!serviceUrl) {
    return null;
  }

  const profileResult = options.profileResult ?? (await getAuthenticatedProfile());

  if (!profileResult) {
    return null;
  }

  const dashboardData = options.dashboardData ?? (await getAuthenticatedDashboardData(profileResult));

  if (!dashboardData) {
    return null;
  }

  try {
    const chatHistory = await getAuthenticatedChatHistory();
    const student = buildYantraStudentContextFromData(
      profileResult.profile,
      'Yantra Dashboard',
      dashboardData,
      chatHistory?.messages ?? [],
    );

    const response = await fetch(`${serviceUrl}/dashboard/recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(Math.min(getYantraAiServiceTimeoutMs(), 12000)),
      body: JSON.stringify({ student }),
    });

    const data = (await response.json().catch(() => ({}))) as DashboardRecommendationResponse;

    if (!response.ok || !data.title?.trim() || !data.description?.trim() || !data.prompt?.trim()) {
      return null;
    }

    return {
      title: data.title.trim(),
      description: data.description.trim(),
      prompt: data.prompt.trim(),
      provider: data.provider?.trim() || 'yantra-ai-service',
      modelUsed: data.model_used ?? null,
    };
  } catch (error) {
    console.error('Yantra dashboard recommendation error:', error);
    return null;
  }
}
