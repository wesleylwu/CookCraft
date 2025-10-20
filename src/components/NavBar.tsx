"use client";

import Link from "next/link";
import Image from "next/image";
import chefHatIcon from "@/public/chefHatIcon.webp";
import profileIcon from "@/public/profileIcon.webp";
import navigations from "@/data/NavBarLinks";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const pathName = usePathname();

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
        <Link href="/profile">
          <Image src={profileIcon} alt="Profile Icon" width={40} />
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
