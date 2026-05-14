import { AuthTemplate } from '@/components/templates/athlete-view/AuthTemplate';
import { SignupForm } from '@/components/molecules/SignupForm';

export default function SignupPage() {
  return (
    <AuthTemplate imageSrc="/assets/athelete_auth.png">
      <SignupForm />
    </AuthTemplate>
  );
}
