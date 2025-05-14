import { OnboardingForm } from "@/components/onboarding-form/onboarding-form";
import { getQuestionsBySlug } from "@/app/actions/onboarding-form";
interface OnboardingPageProps {
  params: {
    slug: string;
  };
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { slug } = await params;
  const questions = await getQuestionsBySlug(slug);
  if (!questions) {
    return <div>No questions found</div>;
  }
  return (
    <main className="min-h-screen bg-[#121212]">
      <OnboardingForm slug={slug} />
    </main>
  );
}
