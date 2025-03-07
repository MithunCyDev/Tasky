import Link from "next/link";
import Image from "next/image";

export default function AuthHeader() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Image
            src="../../public/logo.png"
            alt="Task Management Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <Link href="/" className="text-xl font-bold hidden md:block">
            Task Management
          </Link>
        </div>
        <div className="text-sm text-gray-500 hidden md:block">
          Manage your team's tasks efficiently
        </div>
      </div>
    </header>
  );
}
