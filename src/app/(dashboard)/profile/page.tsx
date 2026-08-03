import UserProfileForm from "@/components/profile/UserProfileForm";

export default function ProfilePage() {
  return (
    <div className="py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#16181c]">Account Profile</h1>
        <p className="mt-1 text-[15px] text-[#5c6660]">
          Review your account details and keep your personal information up to date.
        </p>
      </div>

      <UserProfileForm />
    </div>
  );
}
