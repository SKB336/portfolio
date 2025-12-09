"use client";

import React, { useEffect, useState } from "react";
import { FloatingDock } from "@/components/ui/FloatingDock";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandInstagram,
} from "@tabler/icons-react";

export default function FloatingDockAce() {
  const [isVisible, setIsVisible] = useState(true);
  
  const links = [
    {
      title: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://github.com/SKB336",
    },
    {
      title: "LinkedIn",
      icon: (
        <IconBrandLinkedin className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://www.linkedin.com/in/shakeeb-ahmed-9a9366285/",
    },
    {
      title: "Instagram",
      icon: (
        <IconBrandInstagram className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://www.instagram.com/shakeeb.fr?igsh=eG9yNDlreWczMzh4",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (footerRect.top <= windowHeight) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`fixed -bottom-0.5 left-0 md:left-1/2 md:-translate-x-1/2 mx-0 md:mx-auto z-50 m-4 transition-transform duration-500 ease-in-out ${
        isVisible ? 'translate-y-0' : 'md:translate-y-[150%] -translate-x-[150%]'
      }`}
    >
      <FloatingDock
        mobileClassName="left-4 translate-x-0"
        items={links}
      />
    </div>
  );
}
