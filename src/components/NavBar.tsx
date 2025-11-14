"use client";

import Link from "next/link";
import Image from "next/image";
import chefHatIcon from "@/public/chefHatIcon.webp";
import profileIcon from "@/public/profileIcon.webp";
import navigations from "@/data/NavBarLinks";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathName = usePathname();
  const { user } = useAuth();

  return (
    <nav className="bg-cookcraft-white font-cookcraft-roboto border-cookcraft-olive relative border-b-3">
      <div className="flex items-center justify-between p-5">
        <div className="ml-6">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <Image src={chefHatIcon} alt="Chef Hat Icon" width={40} />
          </Link>
        </div>

        <div className="hidden items-center justify-center gap-16 text-2xl font-bold md:flex">
          {user &&
            navigations.map(({ link, name }, index) => (
              <Link
                key={index}
                href={link}
                className={`transition-colors ${
                  pathName === link
                    ? "text-cookcraft-red"
                    : "text-cookcraft-olive hover:text-cookcraft-red"
                }`}
              >
                {name}
              </Link>
            ))}
        </div>

        <div className="mr-6 flex items-center gap-4">
          {user && (
            <Link
              href="/profile"
              className="hidden md:block"
              onClick={() => setIsOpen(false)}
            >
              <Image src={profileIcon} alt="Profile Icon" width={40} />
            </Link>
          )}

          <div
            className="flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-2 md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div
              className={`bg-cookcraft-olive block h-1 w-6 transition-transform duration-300 ${
                isOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <div
              className={`bg-cookcraft-olive block h-1 w-6 transition-opacity duration-300 ${
                isOpen ? "opacity-0" : ""
              }`}
            />
            <div
              className={`bg-cookcraft-olive block h-1 w-6 transition-transform duration-300 ${
                isOpen ? "-translate-y-4 -rotate-45" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="bg-cookcraft-white border-cookcraft-olive flex flex-col items-center overflow-hidden border-t-3 md:hidden">
          {user &&
            navigations.map(({ name, link }, index) => (
              <Link
                key={index}
                href={link}
                onClick={() => setIsOpen(false)}
                className={`block w-full py-3 text-center text-lg font-bold transition-colors ${
                  pathName === link
                    ? "text-cookcraft-red"
                    : "text-cookcraft-olive hover:text-cookcraft-red"
                }`}
              >
                {name}
              </Link>
            ))}

          {user && (
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="border-cookcraft-olive flex w-full items-center justify-center gap-2 py-3"
            >
              <div className="text-cookcraft-olive hover:text-cookcraft-red text-lg font-bold">
                Profile
              </div>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
