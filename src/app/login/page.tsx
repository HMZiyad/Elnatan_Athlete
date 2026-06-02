"use client";

import { useState, Suspense } from "react";
import { AuthTemplate } from "@/components/templates/athlete-view/AuthTemplate";
import { LoginForm } from "@/components/molecules/LoginForm";

export default function LoginPage() {
  const [role, setRole] = useState<'athlete' | 'fan'>('athlete');

  const imageSrc = role === 'fan' ? "/assets/fan_auth.png" : "/assets/athelete_auth.png";

  return (
    <AuthTemplate imageSrc={imageSrc}>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <LoginForm onRoleChange={setRole} />
      </Suspense>
    </AuthTemplate>
  );
}

