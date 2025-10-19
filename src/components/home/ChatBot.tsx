import Image from "next/image";
import logo from "@/public/home/cookCraftLogo.webp";
const ChatBot = () => {
  return (
    <div className="text-cookcraft-olive flex h-screen w-screen flex-col items-center justify-center text-6xl font-bold">
      Welcome to CookCraft!
      <Image src={logo} alt="Cook Craft Logo" className="mt-20 w-1/4" />
      <input
        type="text"
        placeholder="Ask CookCraft..."
        className="mt-12 w-1/3 rounded-2xl border-3 p-4 text-2xl font-normal"
      />
    </div>
  );
};

export default ChatBot;
