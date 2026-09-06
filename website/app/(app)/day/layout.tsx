import { DayFrame } from '@/components/DayFrame';

export const dynamic = 'force-dynamic';

/**
 * The device shell. On a phone this is the whole screen; on a desktop browser
 * it renders as a device so the family can see exactly what Sabiha will see.
 */
export default function DayLayout({ children }: { children: React.ReactNode }) {
  return <DayFrame>{children}</DayFrame>;
}
