'use client'
import dynamic from 'next/dynamic';

const SignInForm = dynamic(() => import('@/components/ui/auth/SignInForm'));

export default function SignIn() {
  return <SignInForm />;
}
