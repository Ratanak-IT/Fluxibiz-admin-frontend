import Image from "next/image";

export function LoginIllustration() {
  return (
    <div className="relative hidden h-full w-full items-center justify-center lg:flex">
      <Image
        src="/loginImage.png"
        alt="Login illustration"
        width={480}
        height={480}
        priority
        className="max-w-[420px]"
      />
    </div>
  );
}