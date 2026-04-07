'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Clock3,
  Lock,
  Search,
  TerminalSquare,
  Waypoints,
  X,
} from 'lucide-react';
import { ChatProvider, useChatWidgetActions } from '@/src/features/chat/ChatWidget';
import YantraAmbientBackground from '@/src/features/dashboard/YantraAmbientBackground';
import GlobalSidebar from '@/src/features/navigation/GlobalSidebar';
import { pythonSkillTrack, type PythonRoomState, type PythonSkillRoom } from './python-skill-track';

type PythonRoomsIndexPageProps = {
  learnerName: string;
};

type RoomFilter = 'all' | 'current' | 'available' | 'completed' | 'locked' | 'milestone';

const filterOptions: { key: RoomFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'current', label: 'Current' },
  { key: 'available', label: 'Available' },
  { key: 'completed', label: 'Completed' },
  { key: 'locked', label: 'Locked' },
  { key: 'milestone', label: 'Milestone' },
];

function getStateLabel(state: PythonRoomState) {
  switch (state) {
    case 'current': return 'Live Now';
    case 'completed': return 'Completed';
    case 'unlocked': return 'Unlocked';
    case 'locked': return 'Locked';
    case 'milestone_locked': return 'Milestone';
  }
}

function matchesFilter(room: PythonSkillRoom, filter: RoomFilter) {
  switch (filter) {
    case 'all': return true;
    case 'current': return room.state === 'current';
    case 'available': return room.state === 'current' || room.state === 'unlocked';
    case 'completed': return room.state === 'completed';
    case 'locked': return room.state === 'locked';
    case 'milestone': return room.state === 'milestone_locked';
  }
}

function StateIcon({ state }: { state: PythonRoomState }) {
  if (state === 'completed') return <CheckCircle2 size={15} className="text-white/50" />;
  if (state === 'current') {
    return (
      <div className="relative flex h-[14px] w-[14px] items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/50 opacity-75" />
        <span className="relative inline-flex h-[7px] w-[7px] rounded-full bg-white" />
      </div>
    );
  }
  if (state === 'locked' || state === 'milestone_locked') return <Lock size={13} className="text-white/30" />;
  return <TerminalSquare size={13} className="text-white/45" />;
}

function RoomDetailPanel({
  room,
  openChat,
  onClose,
}: {
  room: PythonSkillRoom;
  openChat: (opts: { message: string }) => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col">
      {/* Panel header — badge row on top, then title + close side by side */}
      <div className="px-4 pb-3 pt-4 sm:px-5 sm:pt-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/10 bg-white/[0.07] px-2.5 py-1 font-mono text-[8.5px] uppercase tracking-[0.2em] text-white/55">
            {getStateLabel(room.state)}
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white/40 transition-colors hover:bg-white/[0.1] hover:text-white lg:hidden"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <div className="mt-2.5 min-w-0">
          <div className="font-mono text-[8.5px] uppercase tracking-[0.26em] text-white/30">
            Room {String(room.order).padStart(2, '0')}
          </div>
          <h2 className="mt-1 text-[1.6rem] font-semibold leading-tight tracking-tight text-white">
            {room.title}
          </h2>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-6 sm:px-5">
        {/* Objective + Practice — single col on mobile */}
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">Objective</div>
            <p className="mt-2 text-[13px] leading-relaxed text-white/70">{room.objective}</p>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/40">Practice</div>
            <p className="mt-2 text-[13px] leading-relaxed text-white/70">{room.practice}</p>
          </div>
        </div>

        {/* Stats row — 3 equal cols, no fixed widths */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
            <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/35">Time</div>
            <div className="mt-1 flex items-center gap-1 text-[12px] font-medium text-white/80">
              <Clock3 size={12} className="shrink-0 text-white/40" />
              {room.estimatedMinutes}m
            </div>
          </div>
          <div className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
            <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/35">Level</div>
            <div className="mt-1 text-[12px] font-medium text-white/80">{room.difficulty}</div>
          </div>
          <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-2.5">
            <div className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/35">Reward</div>
            <div className="mt-1 truncate text-[12px] font-medium text-white/80" title={room.rewardLabel}>{room.rewardLabel}</div>
          </div>
        </div>

        {/* Unlock condition */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
            <Waypoints size={13} />
            Unlock condition
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed text-white/70">{room.unlockHint}</p>
          {room.prerequisites.length > 0 && (
            <ul className="mt-3 space-y-2 text-[12px] text-white/50">
              {room.prerequisites.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-white/30" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-2.5">
          {room.enterHref ? (
            <Link
              href={room.enterHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 font-mono text-[10px] uppercase tracking-widest text-black transition-transform active:scale-[0.98] hover:scale-[0.99]"
            >
              Enter room <ArrowRight size={13} />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.025] py-3 font-mono text-[10px] uppercase tracking-widest text-white/30"
            >
              Room locked
            </button>
          )}
          <button
            type="button"
            onClick={() => openChat({ message: `Preview the concepts in ${room.title} and tell me how to prepare.` })}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-3 font-mono text-[10px] uppercase tracking-widest text-white/65 transition-colors hover:bg-white/[0.08]"
          >
            Preview with Yantra
          </button>
        </div>
      </div>
    </div>
  );
}

function PythonRoomsIndexContent({ learnerName }: PythonRoomsIndexPageProps) {
  const { openChat } = useChatWidgetActions();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<RoomFilter>('all');
  const [selectedRoomKey, setSelectedRoomKey] = useState(pythonSkillTrack.rooms[0]?.key ?? '');
  const [sheetOpen, setSheetOpen] = useState(false);

  const visibleRooms = useMemo(() => {
    const query = search.trim().toLowerCase();
    return pythonSkillTrack.rooms.filter((room) => {
      if (!matchesFilter(room, activeFilter)) return false;
      if (!query) return true;
      const haystack = [room.title, room.summary, room.objective, room.practice, room.tags.join(' ')]
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [activeFilter, search]);

  const selectedRoom =
    visibleRooms.find((r) => r.key === selectedRoomKey) ??
    visibleRooms[0] ??
    pythonSkillTrack.rooms.find((r) => r.key === selectedRoomKey) ??
    pythonSkillTrack.rooms[0];

  const learnerLabel = learnerName.trim() || 'Learner';

  function handleRoomClick(key: string) {
    setSelectedRoomKey(key);
    setSheetOpen(true);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white selection:bg-white selection:text-black">
      <YantraAmbientBackground />

      {/* ── NAV ── */}
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-black/80 backdrop-blur-2xl">
        <div className="mx-auto flex w-full min-w-0 max-w-[1600px] items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <Link href="/dashboard" className="shrink-0 font-heading text-2xl tracking-wider text-white sm:text-3xl">
              YANTRA.
            </Link>
            <nav className="hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40 sm:flex">
              <Link href="/dashboard" className="transition-colors hover:text-white/70">Dashboard</Link>
              <span className="text-white/18">/</span>
              <span className="text-white/70">Rooms</span>
              <span className="text-white/18">/</span>
              <span className="truncate text-white/70">{pythonSkillTrack.title}</span>
            </nav>
          </div>

          <div className="hidden items-center gap-2.5 md:flex">
            <Link
              href="/docs/python-room"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 font-mono text-[9.5px] uppercase tracking-[0.2em] text-white/65 transition-colors hover:bg-white/[0.08]"
            >
              <BookMarked size={13} /> Docs
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 font-mono text-[9.5px] uppercase tracking-[0.24em] text-black transition-transform hover:scale-[0.99]"
              onClick={() => openChat({ message: `Help me plan my ${pythonSkillTrack.title} path.` })}
            >
              Open Yantra AI
            </button>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/65">
              {learnerLabel}
            </div>
          </div>

          <GlobalSidebar />
        </div>
      </header>

      <main className="mx-auto w-full min-w-0 max-w-[1600px] overflow-x-hidden px-4 pb-16 pt-5 sm:px-6 sm:pt-7 lg:px-8">

        {/* ── HERO BANNER ── */}
        <section className="relative mb-5 overflow-hidden rounded-3xl border border-white/[0.08] bg-[linear-gradient(160deg,rgba(20,20,20,0.96),rgba(8,8,8,0.99))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.4)] sm:mb-6 sm:rounded-[2rem] sm:p-7 lg:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.07),transparent_40%),radial-gradient(ellipse_at_80%_20%,rgba(255,255,255,0.04),transparent_35%)]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              {/* Pills */}
              <div className="flex gap-2 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {[
                  `${pythonSkillTrack.learnerLevel} track`,
                  'Sequential unlock',
                  `${pythonSkillTrack.totalRooms} rooms`,
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/55"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-4 font-mono text-[9.5px] uppercase tracking-[0.28em] text-white/35">
                {pythonSkillTrack.eyebrow}
              </div>
              <h1 className="mt-2.5 font-display text-[2.2rem] font-semibold leading-[0.93] tracking-tight text-white sm:text-[3.4rem] lg:text-[4rem]">
                {pythonSkillTrack.title}
              </h1>
              <p className="mt-3.5 max-w-xl text-[13px] leading-relaxed text-white/60 sm:text-[14.5px]">
                A clean beginner path for syntax, logic, and readable problem solving. Enter the live room, then unlock the rest one chapter at a time.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row lg:w-[19rem] lg:flex-col lg:shrink-0">
              <Link
                href={pythonSkillTrack.rooms.find(r => r.state === 'current' || r.state === 'unlocked')?.enterHref ?? '/dashboard'}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-mono text-[9.5px] uppercase tracking-widest text-black transition-transform hover:scale-[0.99] active:scale-[0.97]"
              >
                Continue next room <ArrowRight size={13} />
              </Link>
              <button
                type="button"
                onClick={() => openChat({ message: `Give me a quick plan for finishing ${pythonSkillTrack.title}.` })}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 font-mono text-[9.5px] uppercase tracking-widest text-white/70 transition-colors hover:bg-white/[0.09]"
              >
                Open Yantra AI
              </button>
            </div>
          </div>
        </section>

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">

          {/* ── ROOM LIST ── */}
          <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.018] shadow-[0_8px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
            {/* Controls */}
            <div className="flex flex-col gap-3 border-b border-white/[0.06] bg-white/[0.012] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              {/* Scrollable filter pills */}
              <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="flex w-fit items-center gap-0.5 rounded-xl border border-white/[0.06] bg-black/50 p-1">
                    {filterOptions.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setActiveFilter(opt.key)}
                        className={`whitespace-nowrap rounded-lg px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-all ${
                          activeFilter === opt.key
                            ? 'bg-white/[0.12] text-white'
                            : 'text-white/45 hover:bg-white/[0.05] hover:text-white/75'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Fade hint */}
                <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-6 bg-gradient-to-l from-[#0a0a0a] to-transparent sm:hidden" />
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search rooms"
                  placeholder="Search rooms..."
                  className="h-9 w-full rounded-xl border border-white/[0.06] bg-black/50 pl-8 pr-3 text-[13px] text-white placeholder:text-white/28 focus:border-white/18 focus:outline-none focus:ring-1 focus:ring-white/18 transition-all"
                />
              </div>
            </div>

            {/* Room rows */}
            <div className="flex flex-col divide-y divide-white/[0.05]">
              {visibleRooms.map((room) => {
                const isSelected = selectedRoom?.key === room.key;
                const isDimmed = room.state === 'locked' || room.state === 'milestone_locked';
                return (
                  <button
                    key={room.key}
                    type="button"
                    onClick={() => handleRoomClick(room.key)}
                    className={`group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors sm:px-5 ${
                      isSelected ? 'bg-white/[0.07]' : 'hover:bg-white/[0.035]'
                    } ${isDimmed ? 'opacity-50' : ''}`}
                  >
                    {/* Number + state icon */}
                    <div className="flex w-7 shrink-0 flex-col items-center gap-1 pt-0.5">
                      <span className="font-mono text-[8.5px] leading-none text-white/35">
                        {String(room.order).padStart(2, '0')}
                      </span>
                      <StateIcon state={room.state} />
                    </div>

                    {/* Text */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`truncate text-[13.5px] font-medium leading-snug transition-colors sm:text-[14.5px] ${
                          isSelected ? 'text-white' : 'text-white/78 group-hover:text-white'
                        }`}>
                          {room.title}
                        </span>
                        {room.state === 'current' && (
                          <span className="shrink-0 rounded-full border border-white/20 bg-white/10 px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-white">
                            Live
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[11.5px] text-white/42 sm:text-[12.5px]">
                        {room.summary}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className={`shrink-0 transition-all ${isSelected ? 'text-white/40' : 'text-white/18 group-hover:translate-x-0.5 group-hover:text-white/50'}`}>
                      <ArrowRight size={15} />
                    </div>
                  </button>
                );
              })}

              {visibleRooms.length === 0 && (
                <div className="py-14 text-center">
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-white/35">No rooms matched</div>
                  <p className="mx-auto mt-2.5 max-w-[18rem] text-[12.5px] text-white/45">
                    Try a broader search or switch back to All.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ── DESKTOP ASIDE ── */}
          {selectedRoom && (
            <aside className="hidden lg:sticky lg:top-24 lg:block">
              <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.018] shadow-[0_8px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
                <RoomDetailPanel room={selectedRoom} openChat={openChat} />
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* ── MOBILE BOTTOM SHEET ── */}
      {selectedRoom && (
        <>
          {/* Scrim - no backdrop-blur to avoid WebKit width miscalc */}
          <div
            onClick={() => setSheetOpen(false)}
            className={`fixed inset-0 z-40 bg-black/65 transition-opacity duration-300 lg:hidden ${
              sheetOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          />
          {/* Sheet — flex column, scrolls internally */}
          <div
            className={`fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col overflow-x-hidden overflow-y-auto rounded-t-3xl border-t border-white/[0.1] bg-[rgba(10,10,10,0.98)] shadow-[0_-20px_60px_rgba(0,0,0,0.6)] backdrop-blur-3xl transition-transform duration-300 ease-out lg:hidden ${
              sheetOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            {/* Drag handle */}
            <div className="flex shrink-0 justify-center pb-1 pt-3">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close sheet"
                className="h-1 w-12 rounded-full bg-white/20 transition-colors hover:bg-white/30"
              />
            </div>
            <RoomDetailPanel
              room={selectedRoom}
              openChat={openChat}
              onClose={() => setSheetOpen(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}

export default function PythonRoomsIndexPage(props: PythonRoomsIndexPageProps) {
  return (
    <ChatProvider>
      <PythonRoomsIndexContent {...props} />
    </ChatProvider>
  );
}
