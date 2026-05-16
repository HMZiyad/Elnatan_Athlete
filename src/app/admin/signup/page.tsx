import { AdminAuthTemplate } from '@/components/templates/admin/AdminAuthTemplate';
import { AdminSignupForm } from '@/components/molecules/admin/AdminSignupForm';

export default function AdminSignupPage() {
  return (
    <AdminAuthTemplate 
      title="Create an Account" 
      subtitle="Create your account to manage your panel"
    >
      <AdminSignupForm />
    </AdminAuthTemplate>
  );
}
