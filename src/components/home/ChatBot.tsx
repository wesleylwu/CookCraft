"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import logo from "@/public/home/cookCraftLogo.webp";
const ChatBot = () => {
  const fullText = "Welcome to CookCraft!";
  const [displayedText, setDisplayedText] = useState<string>("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) {
        clearInterval(interval);
      }
    }, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-cookcraft-olive flex h-screen w-screen flex-col items-center justify-center">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-3xl font-bold sm:text-5xl lg:text-6xl"
      >
        {displayedText}
      </motion.p>
      <Image
        src={logo}
        alt="Cook Craft Logo"
        className="mt-17 w-40 sm:w-56 md:w-64 lg:w-72 xl:w-80"
      />
      <input
        type="text"
        placeholder="Ask CookCraft..."
        className="mt-12 w-1/2 rounded-2xl border-3 p-4 font-normal md:w-1/3"
      />
    </div>
  );
};

export default ChatBot;
