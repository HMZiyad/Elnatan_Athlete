"use client";

import { useState } from "react";
import { AuthTemplate } from '@/components/templates/athlete-view/AuthTemplate';
import { SignupForm } from '@/components/molecules/SignupForm';

export default function SignupPage() {
  const [role, setRole] = useState<'athlete' | 'fan'>('athlete');

  const imageSrc = role === 'fan' ? "/assets/fan_auth.png" : "/assets/athelete_auth.png";

  return (
    <AuthTemplate imageSrc={imageSrc}>
      <SignupForm onRoleChange={setRole} />
    </AuthTemplate>
  );
}
