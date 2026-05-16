"use client";

import { useState } from "react";
import { AuthTemplate } from "@/components/templates/athlete-view/AuthTemplate";
import { LoginForm } from "@/components/molecules/LoginForm";

export default function LoginPage() {
  const [role, setRole] = useState<'athlete' | 'fan'>('athlete');

  const imageSrc = role === 'fan' ? "/assets/fan_auth.png" : "/assets/athelete_auth.png";

  return (
    <AuthTemplate imageSrc={imageSrc}>
      <LoginForm onRoleChange={setRole} />
    </AuthTemplate>
  );
}
