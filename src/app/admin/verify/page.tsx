import { AdminAuthTemplate } from '@/components/templates/admin/AdminAuthTemplate';
import { AdminVerifyCodeForm } from '@/components/molecules/admin/AdminVerifyCodeForm';

export default function AdminVerifyCodePage() {
  return (
    <AdminAuthTemplate 
      title="Check your email" 
      subtitle="We sent a code to your email address. Please check your email for the 5 digit code."
    >
      <AdminVerifyCodeForm />
    </AdminAuthTemplate>
  );
}
