'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, X } from 'lucide-react';
import {
  externalMemoryImportPromptVersion,
  getExternalMemoryImportPrompt,
  type ApprovedPersonalizationFacts,
  type PersonalizationExtractionResult,
  type PersonalizationSourceProvider,
  type StudentPersonalizationProfile,
} from './student-personalization-model';
import {
  onboardingLearningGoalOptions,
  onboardingLearningPaceOptions,
  type LearningGoal,
  type LearningPace,
  type StudentProfile,
} from './student-profile-model';

const skillLevelOptions: StudentProfile['skillLevel'][] = ['Beginner', 'Intermediate', 'Advanced'];
const sourceProviderOptions: Array<{ value: PersonalizationSourceProvider; label: string }> = [
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'other', label: 'Other' },
];

type DashboardPersonalizationPanelProps = {
  personalization: StudentPersonalizationProfile | null;
  eyebrow?: string;
  title?: string;
  description?: string;
};

type ReviewDraft = {
  learnerSummary: string;
  confidenceSummary: string;
  assumptions: string;
  confirmedFacts: string;
  likelyPreferences: string;
  uncertainInferences: string;
  missingInformation: string;
  targetGoals: LearningGoal[];
  inferredSkillLevel: StudentProfile['skillLevel'] | '';
  timeAvailability: LearningPace | '';
  priorProjects: string;
  topicsOfInterest: string;
  preferredLearningStyle: string;
  constraints: string;
};

const reviewTextareaFields: Array<{
  key:
    | 'confirmedFacts'
    | 'likelyPreferences'
    | 'uncertainInferences'
    | 'missingInformation'
    | 'priorProjects'
    | 'topicsOfInterest'
    | 'preferredLearningStyle'
    | 'constraints';
  label: string;
}> = [
  { key: 'confirmedFacts', label: 'Confirmed Facts' },
  { key: 'likelyPreferences', label: 'Likely Preferences' },
  { key: 'uncertainInferences', label: 'Uncertain Inferences' },
  { key: 'missingInformation', label: 'Missing Information' },
  { key: 'priorProjects', label: 'Prior Projects' },
  { key: 'topicsOfInterest', label: 'Topics of Interest' },
  { key: 'preferredLearningStyle', label: 'Preferred Learning Style' },
  { key: 'constraints', label: 'Constraints' },
];

function joinLines(values: string[] | undefined) {
  return (values ?? []).join('\n');
}

function splitLines(value: string, limit = 8) {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function buildReviewDraft(source: PersonalizationExtractionResult | StudentPersonalizationProfile): ReviewDraft {
  const approvedFacts = source.approvedFacts;
  const normalized = approvedFacts?.normalized;

  return {
    learnerSummary: source.learnerSummary ?? '',
    confidenceSummary: source.confidenceSummary ?? '',
    assumptions: joinLines(source.assumptions),
    confirmedFacts: joinLines(approvedFacts?.confirmedFacts),
    likelyPreferences: joinLines(approvedFacts?.likelyPreferences),
    uncertainInferences: joinLines(approvedFacts?.uncertainInferences),
    missingInformation: joinLines(approvedFacts?.missingInformation),
    targetGoals: [...(normalized?.targetGoals ?? [])],
    inferredSkillLevel: normalized?.inferredSkillLevel ?? '',
    timeAvailability: normalized?.timeAvailability ?? '',
    priorProjects: joinLines(normalized?.priorProjects),
    topicsOfInterest: joinLines(normalized?.topicsOfInterest),
    preferredLearningStyle: joinLines(normalized?.preferredLearningStyle),
    constraints: joinLines(normalized?.constraints),
  };
}

function serializeApprovedFacts(draft: ReviewDraft): ApprovedPersonalizationFacts {
  return {
    confirmedFacts: splitLines(draft.confirmedFacts),
    likelyPreferences: splitLines(draft.likelyPreferences),
    uncertainInferences: splitLines(draft.uncertainInferences),
    missingInformation: splitLines(draft.missingInformation),
    normalized: {
      targetGoals: draft.targetGoals,
      inferredSkillLevel: draft.inferredSkillLevel || null,
      priorProjects: splitLines(draft.priorProjects),
      topicsOfInterest: splitLines(draft.topicsOfInterest),
      timeAvailability: draft.timeAvailability || null,
      preferredLearningStyle: splitLines(draft.preferredLearningStyle),
      constraints: splitLines(draft.constraints),
    },
  };
}

export default function DashboardPersonalizationPanel({
  personalization,
  eyebrow = 'Personalization Layer',
  title,
  description,
}: DashboardPersonalizationPanelProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'paste' | 'review'>(personalization?.approvedFacts ? 'review' : 'paste');
  const [provider, setProvider] = useState<PersonalizationSourceProvider>(personalization?.sourceProvider ?? 'chatgpt');
  const [sourceSummary, setSourceSummary] = useState('');
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft | null>(
    personalization?.approvedFacts ? buildReviewDraft(personalization) : null,
  );
  const [busyState, setBusyState] = useState<'idle' | 'extracting' | 'saving' | 'dismissing'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const hasApprovedFacts = Boolean(personalization?.approvedFacts);
  const hasLearnerSummary = Boolean(personalization?.learnerSummary.trim());
  const showIntroCard = !hasApprovedFacts && !personalization?.dismissedAt;
  const prompt = useMemo(() => getExternalMemoryImportPrompt(provider), [provider]);
  const resolvedTitle = title ?? (hasApprovedFacts
    ? 'Reviewed memory is active in your roadmap.'
    : 'Optional AI memory import can sharpen the roadmap.');
  const resolvedDescription = description ?? (hasApprovedFacts
    ? 'Yantra is using approved facts from your imported context plus onboarding answers. You can review those facts or rebuild the roadmap at any time.'
    : 'Paste a summary from ChatGPT or Gemini, review the extracted facts, and regenerate the roadmap without turning raw pasted text into source-of-truth profile data.');

  const openModal = () => {
    setStatusMessage(null);
    setCopied(false);
    setProvider(personalization?.sourceProvider ?? provider);
    setStep(personalization?.approvedFacts ? 'review' : 'paste');
    setReviewDraft(personalization?.approvedFacts ? buildReviewDraft(personalization) : reviewDraft);
    setIsOpen(true);
  };

  const closeModal = () => {
    if (busyState !== 'idle') {
      return;
    }

    setIsOpen(false);
    setStatusMessage(null);
  };

  const updateDraft = <Key extends keyof ReviewDraft>(key: Key, value: ReviewDraft[Key]) => {
    setReviewDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const toggleGoal = (goal: LearningGoal) => {
    if (!reviewDraft) {
      return;
    }

    updateDraft(
      'targetGoals',
      reviewDraft.targetGoals.includes(goal)
        ? reviewDraft.targetGoals.filter((entry) => entry !== goal)
        : [...reviewDraft.targetGoals, goal].slice(0, 3),
    );
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to copy the provider prompt.');
    }
  };

  const handleExtract = async () => {
    if (!sourceSummary.trim()) {
      setStatusMessage('Paste a ChatGPT or Gemini summary before extracting facts.');
      return;
    }

    setBusyState('extracting');
    setStatusMessage(null);

    try {
      const response = await fetch('/api/personalization/import/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceProvider: provider,
          sourceSummary,
        }),
      });

      const payload = (await response.json()) as PersonalizationExtractionResult & { error?: string };

      if (!response.ok || !payload.approvedFacts) {
        throw new Error(payload.error || 'Yantra could not extract structured facts from that summary.');
      }

      setReviewDraft(buildReviewDraft(payload));
      setStep('review');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Yantra could not extract structured facts right now.');
    } finally {
      setBusyState('idle');
    }
  };

  const handleDismissCard = async () => {
    setBusyState('dismissing');
    setStatusMessage(null);

    try {
      const response = await fetch('/api/personalization/import', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissed: true }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to dismiss the personalization card.');
      }

      router.refresh();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to dismiss the personalization card.');
    } finally {
      setBusyState('idle');
    }
  };

  const handleSaveAndGenerate = async () => {
    if (!reviewDraft) {
      setStatusMessage('Extract or load reviewed facts before saving.');
      return;
    }

    setBusyState('saving');
    setStatusMessage(null);

    try {
      const saveResponse = await fetch('/api/personalization/import', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceProvider: provider,
          sourcePromptVersion: externalMemoryImportPromptVersion,
          approvedFacts: serializeApprovedFacts(reviewDraft),
          learnerSummary: reviewDraft.learnerSummary,
          confidenceSummary: reviewDraft.confidenceSummary,
          assumptions: splitLines(reviewDraft.assumptions),
        }),
      });

      const savePayload = (await saveResponse.json()) as { error?: string };

      if (!saveResponse.ok) {
        throw new Error(savePayload.error || 'Unable to save reviewed personalization facts.');
      }

      const generateResponse = await fetch('/api/dashboard/generate', {
        method: 'POST',
      });

      const generatePayload = (await generateResponse.json()) as { error?: string };

      if (!generateResponse.ok) {
        throw new Error(generatePayload.error || 'Unable to regenerate the dashboard roadmap.');
      }

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to regenerate the dashboard roadmap.');
    } finally {
      setBusyState('idle');
    }
  };

  return (
    <>
      <section className="relative rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-[24px]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/36">{eyebrow}</div>
            <h2 className="font-display text-3xl font-medium text-white">{resolvedTitle}</h2>
            <p className="max-w-3xl text-sm leading-relaxed text-white/58">{resolvedDescription}</p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-black transition-colors hover:bg-white/92 hoverable"
            onClick={openModal}
          >
            <Sparkles size={14} />
            {hasApprovedFacts ? 'Review Import + Rebuild Roadmap' : 'Personalize with AI Memory Import'}
          </button>
        </div>

        {showIntroCard ? (
          <div className="mt-6 flex flex-col gap-4 rounded-[1.6rem] border border-white/8 bg-black/22 p-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/36">Optional Follow-Up</div>
              <p className="max-w-3xl text-sm leading-relaxed text-white/58">
                Paste only what you want Yantra to use for personalization. The imported summary is reviewed and discarded after extraction; only approved facts are stored.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="rounded-full border border-white/12 bg-white/[0.05] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/[0.08] hoverable"
                onClick={openModal}
              >
                Open Import Flow
              </button>
              <button
                type="button"
                className="rounded-full border border-white/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/54 transition-colors hover:bg-white/[0.04] hover:text-white hoverable"
                onClick={() => void handleDismissCard()}
                disabled={busyState === 'dismissing'}
              >
                {busyState === 'dismissing' ? 'Dismissing...' : 'Dismiss'}
              </button>
            </div>
          </div>
        ) : null}

        {hasLearnerSummary ? (
          <div className="mt-6 grid gap-4 rounded-[1.6rem] border border-white/8 bg-black/22 p-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/36">Current Learner Summary</div>
              <p className="text-sm leading-relaxed text-white/64">{personalization?.learnerSummary}</p>
            </div>
            <div className="space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/36">Confidence</div>
              <p className="text-sm leading-relaxed text-white/56">
                {personalization?.confidenceSummary || 'Built from onboarding answers first.'}
              </p>
            </div>
          </div>
        ) : null}

        {statusMessage ? <p className="mt-4 text-sm text-white/56">{statusMessage}</p> : null}
      </section>

      {isOpen ? (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/80 px-4 py-8 backdrop-blur-xl">
          <div className="relative w-full max-w-5xl rounded-[2rem] border border-white/10 bg-[#090909] p-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)] md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/36">AI Memory Import</div>
                <h3 className="font-display text-3xl font-medium text-white">Review first, then rebuild the roadmap.</h3>
                <p className="max-w-3xl text-sm leading-relaxed text-white/56">
                  This flow treats imported AI memory as a hint layer only. Yantra stores approved facts, not the raw pasted summary.
                </p>
              </div>

              <button
                type="button"
                className="rounded-full border border-white/10 p-2 text-white/54 transition-colors hover:bg-white/[0.05] hover:text-white hoverable"
                onClick={closeModal}
                aria-label="Close personalization flow"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex flex-wrap gap-3">
                {sourceProviderOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors hoverable ${
                      provider === option.value
                        ? 'border-white bg-white text-black'
                        : 'border-white/10 bg-white/[0.04] text-white/64 hover:bg-white/[0.08] hover:text-white'
                    }`}
                    onClick={() => setProvider(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {step === 'paste' ? (
                <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="space-y-4 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/36">Provider Prompt</div>
                        <p className="mt-2 text-sm text-white/52">Copy this into ChatGPT or Gemini to get a structured summary that Yantra can review.</p>
                      </div>
                      <button
                        type="button"
                        className="rounded-full border border-white/12 bg-white/[0.05] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/[0.08] hoverable"
                        onClick={() => void handleCopyPrompt()}
                      >
                        {copied ? 'Copied' : 'Copy Prompt'}
                      </button>
                    </div>
                    <pre className="max-h-[28rem] overflow-auto rounded-[1.5rem] bg-black/28 p-4 text-xs leading-relaxed text-white/74 whitespace-pre-wrap">
                      {prompt}
                    </pre>
                  </div>

                  <div className="space-y-4 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
                    <div className="space-y-2">
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/36">Paste Summary</div>
                      <p className="text-sm leading-relaxed text-white/56">
                        Paste only what you want Yantra to use for personalization. Avoid sensitive details you do not want stored as reviewed facts.
                      </p>
                    </div>
                    <textarea
                      value={sourceSummary}
                      onChange={(event) => setSourceSummary(event.target.value)}
                      className="min-h-[18rem] w-full rounded-[1.5rem] border border-white/10 bg-black/28 p-4 text-sm text-white outline-none transition-colors placeholder:text-white/24 focus:border-white/20"
                      placeholder="Paste the structured summary from ChatGPT, Gemini, or another AI assistant..."
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-white/92 hoverable"
                        onClick={() => void handleExtract()}
                        disabled={busyState === 'extracting'}
                      >
                        {busyState === 'extracting' ? <Loader2 size={14} className="animate-spin" /> : null}
                        {busyState === 'extracting' ? 'Extracting Facts' : 'Extract Facts'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : reviewDraft ? (
                <div className="space-y-6">
                  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-4 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/36">Learner Summary</div>
                      <textarea
                        value={reviewDraft.learnerSummary}
                        onChange={(event) => updateDraft('learnerSummary', event.target.value)}
                        className="min-h-[7rem] w-full rounded-[1.25rem] border border-white/10 bg-black/28 p-4 text-sm text-white outline-none transition-colors placeholder:text-white/24 focus:border-white/20"
                      />
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/36">Confidence Summary</div>
                      <textarea
                        value={reviewDraft.confidenceSummary}
                        onChange={(event) => updateDraft('confidenceSummary', event.target.value)}
                        className="min-h-[6rem] w-full rounded-[1.25rem] border border-white/10 bg-black/28 p-4 text-sm text-white outline-none transition-colors placeholder:text-white/24 focus:border-white/20"
                      />
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/36">Assumptions</div>
                      <textarea
                        value={reviewDraft.assumptions}
                        onChange={(event) => updateDraft('assumptions', event.target.value)}
                        className="min-h-[6rem] w-full rounded-[1.25rem] border border-white/10 bg-black/28 p-4 text-sm text-white outline-none transition-colors placeholder:text-white/24 focus:border-white/20"
                      />
                    </div>

                    <div className="space-y-4 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/36">Goals</div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {onboardingLearningGoalOptions.map((goal) => {
                          const selected = reviewDraft.targetGoals.includes(goal);
                          return (
                            <button
                              key={goal}
                              type="button"
                              className={`rounded-[1.1rem] border px-4 py-3 text-left text-sm transition-colors hoverable ${
                                selected
                                  ? 'border-white bg-white/[0.12] text-white'
                                  : 'border-white/10 bg-black/26 text-white/62 hover:bg-white/[0.06] hover:text-white'
                              }`}
                              onClick={() => toggleGoal(goal)}
                            >
                              {goal}
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2">
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/36">Inferred Skill Level</span>
                          <select
                            value={reviewDraft.inferredSkillLevel}
                            onChange={(event) =>
                              updateDraft('inferredSkillLevel', event.target.value as ReviewDraft['inferredSkillLevel'])
                            }
                            className="w-full rounded-full border border-white/10 bg-black/28 px-4 py-3 text-sm text-white outline-none"
                          >
                            <option value="">Not set</option>
                            {skillLevelOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="space-y-2">
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/36">Time Availability</span>
                          <select
                            value={reviewDraft.timeAvailability}
                            onChange={(event) =>
                              updateDraft('timeAvailability', event.target.value as ReviewDraft['timeAvailability'])
                            }
                            className="w-full rounded-full border border-white/10 bg-black/28 px-4 py-3 text-sm text-white outline-none"
                          >
                            <option value="">Not set</option>
                            {onboardingLearningPaceOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-2">
                    {reviewTextareaFields.map(({ key, label }) => (
                      <label key={key} className="space-y-2 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5">
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/36">{label}</span>
                        <textarea
                          value={reviewDraft[key]}
                          onChange={(event) => updateDraft(key, event.target.value)}
                          className="min-h-[8rem] w-full rounded-[1.25rem] border border-white/10 bg-black/28 p-4 text-sm text-white outline-none transition-colors placeholder:text-white/24 focus:border-white/20"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/[0.08] hoverable"
                      onClick={() => setStep('paste')}
                    >
                      Back to Paste Step
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-white/92 hoverable"
                      onClick={() => void handleSaveAndGenerate()}
                      disabled={busyState === 'saving'}
                    >
                      {busyState === 'saving' ? <Loader2 size={14} className="animate-spin" /> : null}
                      {busyState === 'saving' ? 'Saving + Rebuilding' : 'Save Reviewed Facts + Rebuild Roadmap'}
                    </button>
                  </div>
                </div>
              ) : null}

              {statusMessage ? <p className="text-sm text-white/56">{statusMessage}</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
