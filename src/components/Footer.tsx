import Link from "next/link";
import Image from "next/image";
import chefHatIcon from "@/public/chefHatIcon.webp";
import linkedInIcon from "@/public/linkedInIcon.webp";

const Footer = () => {
  return (
    <div className="flow-row bg-cookcraft-white border-cookcraft-olive flex items-center justify-between border-t-3">
      <div className="text-cookcraft-olive flex items-center p-5 text-lg">
        <Image src={chefHatIcon} alt="Chef Hat Icon" className="mr-4" />
        2025 CookCraft ©
      </div>

      <div>
        <Link href="https://linktr.ee/yubinzhen" target="_blank">
          <Image
            src={linkedInIcon}
            alt="LinkedIn Icon"
            width={60}
            className="mr-3"
          />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
