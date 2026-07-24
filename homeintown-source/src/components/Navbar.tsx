"use client";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full px-4 py-2 flex items-center justify-between">
      <Link href="/">
        <div className="text-xl font-bold text-blue-600 rounded">
          <Image
            alt="HomeInTown Logo"
            width={100}
            height={40}
            className="rounded max-h-[40px] w-auto"
            src="/new_logo.png"
            priority
          />
        </div>
      </Link>
    </nav>
  );
}
