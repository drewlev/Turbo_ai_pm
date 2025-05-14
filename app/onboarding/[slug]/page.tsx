import { OnboardingForm } from "@/components/onboarding-form/onboarding-form";

interface OnboardingPageProps {
  params: {
    slug: string;
  };
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { slug } = await params;
  return (
    <main className="min-h-screen bg-[#121212]">
      <OnboardingForm slug={slug} />
    </main>
  );
}
