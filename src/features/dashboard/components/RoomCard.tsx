'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { memo } from 'react';
import { useChatWidgetActions } from '@/src/features/chat/ChatWidget';
import type { DashboardRoomTextureKey, StudentDashboardRoom } from '../student-dashboard-model';

const roomTextureMap: Record<DashboardRoomTextureKey, string> = {
  'python-room':
    'radial-gradient(circle at 20% 10%, rgba(255,255,255,0.12), transparent 32%), radial-gradient(circle at 78% 18%, rgba(255,255,255,0.06), transparent 24%), linear-gradient(145deg, rgba(3,10,14,0.95), rgba(9,20,24,0.82) 42%, rgba(11,11,11,0.96) 100%)',
  'neural-builder':
    'radial-gradient(circle at 80% 12%, rgba(255,255,255,0.14), transparent 30%), radial-gradient(circle at 20% 88%, rgba(255,255,255,0.06), transparent 34%), linear-gradient(145deg, rgba(19,19,22,0.98), rgba(27,27,30,0.9) 45%, rgba(9,9,11,0.98) 100%)',
  'data-explorer':
    'radial-gradient(circle at 72% 18%, rgba(255,255,255,0.08), transparent 26%), linear-gradient(160deg, rgba(10,12,14,0.95), rgba(21,21,21,0.85) 54%, rgba(8,8,8,0.98) 100%)',
  'prompt-lab':
    'radial-gradient(circle at 30% 18%, rgba(255,255,255,0.08), transparent 26%), linear-gradient(150deg, rgba(9,9,9,0.96), rgba(20,20,20,0.84) 50%, rgba(11,11,13,0.98) 100%)',
};

function buildRoomHref(roomKey: string) {
  if (roomKey === 'python-room') {
    return '/dashboard/rooms/python';
  }

  return null;
}

const RoomCard = memo(function RoomCard({ room, index }: { room: StudentDashboardRoom; index: number }) {
  const { openChat } = useChatWidgetActions();
  const roomHref = buildRoomHref(room.roomKey);

  return (
    <motion.article
      className={`relative overflow-hidden rounded-[2rem] border border-white/8 p-8 backdrop-blur-[20px] ${
        room.featured ? 'min-h-[25rem]' : 'min-h-[20rem]'
      }`}
      style={{ backgroundImage: roomTextureMap[room.textureKey] }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_26%,rgba(0,0,0,0.34)_100%)]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: room.featured ? '44px 44px' : '52px 52px',
          maskImage: 'radial-gradient(circle at center, black 28%, transparent 86%)',
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <div className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.06] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-white/64">
            {room.statusLabel}
          </div>

          <div className="mt-5 max-w-[24rem]">
            <h3 className="font-display text-3xl font-medium leading-[0.96] text-white md:text-4xl">{room.title}</h3>
            <p className="mt-4 text-sm font-light leading-relaxed text-white/56">{room.description}</p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          {roomHref ? (
            <Link
              href={roomHref}
              className={`rounded-full px-6 py-3 text-sm uppercase tracking-[0.18em] transition-colors hoverable ${
                room.featured ? 'bg-white text-black hover:bg-white/92' : 'border border-white/12 bg-white/[0.05] text-white hover:bg-white/[0.08]'
              }`}
            >
              {room.ctaLabel}
            </Link>
          ) : (
            <button
              type="button"
              className={`rounded-full px-6 py-3 text-sm uppercase tracking-[0.18em] transition-colors hoverable ${
                room.featured ? 'bg-white text-black hover:bg-white/92' : 'border border-white/12 bg-white/[0.05] text-white hover:bg-white/[0.08]'
              }`}
              onClick={() => openChat({ message: room.prompt })}
            >
              {room.ctaLabel}
            </button>
          )}

          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
            <span>AI-guided</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </motion.article>
  );
});

RoomCard.displayName = 'RoomCard';

export default RoomCard;
