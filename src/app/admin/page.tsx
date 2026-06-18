import { redirect } from 'next/navigation';
import { getAuthUser, isEmployee } from '@/lib/auth';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export const metadata = {
  title: 'PR Store | Dashboard ERP',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getAuthUser();

  if (!user || !isEmployee(user)) {
    redirect('/admin/login');
  }

  return <DashboardClient user={user} />;
}
