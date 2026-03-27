'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { BadgeCheck, PencilLine, School } from 'lucide-react';
import { type StudentProfile } from './student-profile-model';

export type StudentProfileCardHandle = {
  openEditor: () => void;
  closeEditor: () => void;
};

type StudentProfileCardProps = {
  profile: StudentProfile;
  onSave: (profile: StudentProfile) => Promise<void> | void;
};

const profileCardSurfaceClassName =
  'relative overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.045] p-8 shadow-[0_24px_72px_rgba(0,0,0,0.24)] backdrop-blur-[28px]';
const profileCardInputClassName =
  'w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition-all focus:border-white/40 focus:bg-white/[0.07] cursor-text';

const StudentProfileCard = forwardRef<StudentProfileCardHandle, StudentProfileCardProps>(function StudentProfileCard(
  { profile, onSave },
  ref,
) {
  const [draft, setDraft] = useState<StudentProfile>(profile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  useImperativeHandle(
    ref,
    () => ({
      openEditor() {
        setDraft(profile);
        setIsEditing(true);
      },
      closeEditor() {
        setDraft(profile);
        setIsEditing(false);
      },
    }),
    [profile],
  );

  const handleToggleEdit = () => {
    if (isEditing) {
      setDraft(profile);
    }

    setIsEditing((current) => !current);
  };

  const handleSaveProfile = async () => {
    const nextProfile = {
      ...draft,
      progress: Math.max(0, Math.min(100, draft.progress)),
    };

    setIsSaving(true);

    try {
      await onSave(nextProfile);
      setDraft(nextProfile);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const studentInitial = profile.name.trim().charAt(0).toUpperCase() || 'A';

  return (
    <section className="group relative lg:col-span-5">
      <div className="absolute -inset-10 rounded-full bg-white/[0.06] opacity-0 blur-[110px] transition-opacity duration-700 group-hover:opacity-100" />

      <div className={profileCardSurfaceClassName}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.08)_0%,transparent_52%)]" />
        <div className="pointer-events-none absolute right-[-16%] top-[-14%] h-36 w-36 rounded-full bg-white/[0.08] blur-[80px]" />

        {!isEditing ? (
          <div className="relative space-y-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] border border-white/20 bg-white/[0.08]">
                <span className="font-display text-4xl font-bold text-white">{studentInitial}</span>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white">Active Portal</span>
              </div>
            </div>

            <div>
              <h2 className="font-display text-4xl font-bold tracking-tight text-white">{profile.name}</h2>
              <p className="mt-1 text-white/56">{profile.classDesignation} - Academic Year {profile.academicYear}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full bg-white/[0.08] px-4 py-2">
                <School size={16} className="text-white/60" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white">{profile.skillLevel}</span>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
                <BadgeCheck size={14} className="text-white/60" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white">Verified Student</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Syllabus Completion</span>
                <span className="font-display text-2xl font-bold text-white">{profile.progress}%</span>
              </div>
              <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700 ease-out"
                  style={{ width: `${profile.progress}%` }}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                className="w-full rounded-[1.5rem] bg-white py-4 font-semibold text-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                onClick={handleToggleEdit}
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="relative space-y-6">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] border border-white/10 bg-white/[0.05]">
                <PencilLine size={20} className="text-white/60" />
              </div>
              <h3 className="font-display text-xl font-bold text-white">Modify Record</h3>
            </div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1">
              <BadgeCheck size={14} className="text-white/60" />
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white">Verified Student</span>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Full Name</label>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  className={profileCardInputClassName}
                />
              </div>

              <div className="space-y-2">
                <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Class</label>
                <input
                  type="text"
                  value={draft.classDesignation}
                  onChange={(event) => setDraft((current) => ({ ...current, classDesignation: event.target.value }))}
                  className={profileCardInputClassName}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Skill Level</label>
                  <select
                    value={draft.skillLevel}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        skillLevel: event.target.value as StudentProfile['skillLevel'],
                      }))
                    }
                    className="w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none transition-all focus:border-white/40 focus:bg-white/[0.07] cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Progress</label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={draft.progress}
                      onChange={(event) => setDraft((current) => ({ ...current, progress: Number(event.target.value) }))}
                      className="h-1 w-full accent-white cursor-pointer"
                    />
                    <span className="font-mono text-xs text-white">{draft.progress}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6">
              <button
                type="button"
                className="w-full rounded-[1.5rem] bg-white py-4 font-semibold text-black transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-white/45 cursor-pointer"
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? 'Saving Profile...' : 'Save Profile'}
              </button>
              <button
                type="button"
                className="w-full rounded-[1.5rem] border border-white/10 bg-white/[0.05] py-4 font-semibold text-white transition-all duration-300 hover:bg-white/[0.1] cursor-pointer"
                onClick={handleToggleEdit}
                disabled={isSaving}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});

export default StudentProfileCard;
