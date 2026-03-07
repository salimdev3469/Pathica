import Link from 'next/link';
import { CheckCircle2, MailX, AlertTriangle, CircleX } from 'lucide-react';

type StatusType = 'sent' | 'expired' | 'invalid' | 'failed';

const STATUS_CONFIG: Record<StatusType, { title: string; description: string; icon: typeof CheckCircle2; color: string }> = {
  sent: {
    title: 'Email confirmed',
    description: 'Your CV has been sent to your email address. Please check your inbox (and spam folder).',
    icon: CheckCircle2,
    color: 'text-green-600',
  },
  expired: {
    title: 'Confirmation link expired',
    description: 'Please return to the CV page and request a new verification email.',
    icon: AlertTriangle,
    color: 'text-amber-600',
  },
  invalid: {
    title: 'Invalid confirmation link',
    description: 'The link is invalid or has already been used.',
    icon: MailX,
    color: 'text-rose-600',
  },
  failed: {
    title: 'Could not send CV',
    description: 'Something went wrong while sending your CV. Please try again.',
    icon: CircleX,
    color: 'text-rose-600',
  },
};

export default function EmailSentPage({ searchParams }: { searchParams: { status?: string } }) {
  const status = (searchParams?.status as StatusType) || 'sent';
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.sent;
  const Icon = config.icon;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg rounded-2xl border bg-white p-8 text-center shadow-sm">
        <Icon className={`mx-auto h-12 w-12 ${config.color}`} />
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">{config.title}</h1>
        <p className="mt-3 text-slate-600">{config.description}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/cv/new" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            Back to CV Builder
          </Link>
          <Link href="/" className="rounded-md border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
            Go to Landing
          </Link>
        </div>
      </div>
    </main>
  );
}
