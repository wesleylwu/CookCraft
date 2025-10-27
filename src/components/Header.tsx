"use client";

type HeaderProps = {
  title: string;
};

const Header = ({ title }: HeaderProps) => {
  return (
    <p className="text-cookcraft-red flex justify-center text-5xl font-bold">
      <p className="mt-20">{title}</p>
    </p>
  );
};

export default Header;
