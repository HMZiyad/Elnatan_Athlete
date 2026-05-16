import { AdminAuthTemplate } from '@/components/templates/admin/AdminAuthTemplate';
import { AdminLoginForm } from '@/components/molecules/admin/AdminLoginForm';

export default function AdminLoginPage() {
  return (
    <AdminAuthTemplate 
      title="Login to Account" 
      subtitle="Please enter your email and password to continue"
    >
      <AdminLoginForm />
    </AdminAuthTemplate>
  );
}
