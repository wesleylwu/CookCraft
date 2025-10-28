"use client";

import Link from "next/link";
import Image from "next/image";
import chefHatIcon from "@/public/chefHatIcon.webp";
import profileIcon from "@/public/profileIcon.webp";
import navigations from "@/data/NavBarLinks";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const NavBar = () => {
  const pathName = usePathname();
  const { user, loading } = useAuth();

  return (
    <div className="bg-cookcraft-white font-cookcraft-roboto border-cookcraft-olive relative flex justify-between border-b-3 p-5">
      <div className="ml-10">
        <Link href="/">
          <Image src={chefHatIcon} alt="Chef Hat Icon" width={40} />
        </Link>
      </div>

      <div className="flex items-center justify-center gap-25 text-2xl font-bold">
        {navigations.map(({ link, name }, index) => (
          <div key={index}>
            <Link
              href={link}
              className={
                pathName === link
                  ? "text-cookcraft-red"
                  : "text-cookcraft-olive"
              }
            >
              {name}
            </Link>
          </div>
        ))}
      </div>

      <div className="mr-10">
        {loading ? (
          <div className="border-cookcraft-olive h-10 w-10 animate-spin rounded-full border-3 border-t-transparent"></div>
        ) : (
          <Link href={user ? "/profile" : "/login"}>
            <Image src={profileIcon} alt="Profile Icon" width={40} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default NavBar;
