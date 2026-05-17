import AuthCard from "@/components/auth/AuthCard";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in · AI Image Mixer" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to mix your images."
      footer={{
        prompt: "New here?",
        href: "/signup",
        label: "Create an account",
      }}
    >
      <LoginForm />
    </AuthCard>
  );
}
