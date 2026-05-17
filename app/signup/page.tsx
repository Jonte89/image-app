import AuthCard from "@/components/auth/AuthCard";
import SignupForm from "@/components/auth/SignupForm";

export const metadata = { title: "Sign up · AI Image Mixer" };

export default function SignupPage() {
  return (
    <AuthCard
      title="Create account"
      subtitle="Sign up to start mixing images."
      footer={{
        prompt: "Already have an account?",
        href: "/login",
        label: "Sign in",
      }}
    >
      <SignupForm />
    </AuthCard>
  );
}
