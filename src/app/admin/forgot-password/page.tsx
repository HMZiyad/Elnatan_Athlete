import { AdminAuthTemplate } from '@/components/templates/admin/AdminAuthTemplate';
import { AdminForgotPasswordForm } from '@/components/molecules/admin/AdminForgotPasswordForm';

export default function AdminForgotPasswordPage() {
  return (
    <AdminAuthTemplate 
      title="Forget Password?" 
      subtitle="Please enter your email to get verification code"
    >
      <AdminForgotPasswordForm />
    </AdminAuthTemplate>
  );
}
