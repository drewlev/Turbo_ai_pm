import { OnboardingForm } from "@/components/onboarding-form/onboarding-form"

interface OnboardingPageProps {
  params: {
    slug: string
  }
}

export default function OnboardingPage({ params }: OnboardingPageProps) {
  return (
    <main className="min-h-screen bg-[#121212]">
      <OnboardingForm slug={params.slug} />
    </main>
  )
}
