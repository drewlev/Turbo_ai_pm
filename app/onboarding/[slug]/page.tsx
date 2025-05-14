// app/onboarding/[slug]/page.tsx

import { OnboardingForm } from "@/components/onboarding-form/onboarding-form";
import {
  getQuestionsBySlug,
  updateOnboardingStatus,
} from "@/app/actions/onboarding-form";
import { AlreadyCompletedScreen } from "@/components/onboarding-form/already-completed";
import { OnboardingNotFoundScreen } from "@/components/onboarding-form/missing-from";
interface OnboardingPageProps {
  params: {
    slug: string;
  };
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { slug } = params;

  const data = await getQuestionsBySlug(slug);
  console.log("data", data);
  if (!data) return <OnboardingNotFoundScreen />;

  if (data.status === "completed") {
    // Track form was completed
    return <AlreadyCompletedScreen />;
  }
  await updateOnboardingStatus(slug, "opened");

  return (
    <main className="min-h-screen bg-[#121212]">
      <OnboardingForm
        slug={slug}
        questions={data.questions.map((q) => ({
          ...q,
          placeholder: q.placeholder ?? undefined,
        }))}
        onboardingId={data.onboardingId}
      />
    </main>
  );
}

