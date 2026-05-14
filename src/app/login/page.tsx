import { AuthTemplate } from "@/components/templates/athlete-view/AuthTemplate";
import { LoginForm } from "@/components/molecules/LoginForm";

export default function LoginPage() {
  return (
    <AuthTemplate imageSrc="/assets/athelete_auth.png">
      <LoginForm />
    </AuthTemplate>
  );
}
