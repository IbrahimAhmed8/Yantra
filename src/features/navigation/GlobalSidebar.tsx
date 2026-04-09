'use client';

import { useChatWidgetActions } from '@/src/features/chat/ChatWidget';
import YantraMobileMenu, { type YantraMobileMenuLink } from './YantraMobileMenu';

export default function GlobalSidebar({ className, disableDesktop = false }: { className?: string, disableDesktop?: boolean }) {
  const { openChat } = useChatWidgetActions();

  const links: YantraMobileMenuLink[] = [
    { label: 'Platform', href: '/' },
    { label: 'Contributors', href: '/contributors' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Curriculum', href: '/dashboard/student-profile/curriculum' },
    { label: 'Docs', href: '/docs/first-dashboard-session' },
  ];

  const footerLinks: YantraMobileMenuLink[] = [
    { label: 'Onboard', href: '/signup' },
    {
      label: 'Open Yantra AI',
      tone: 'primary',
      action: () => openChat({ message: 'Help me with my current context on the Yantra platform.' }),
    },
  ];

  return (
    <YantraMobileMenu
      menuId="global-mobile-nav"
      title="Yantra Navigation"
      items={links}
      footerItems={footerLinks}
      triggerClassName={className || 'text-white hoverable md:hidden'}
    />
  );
}
