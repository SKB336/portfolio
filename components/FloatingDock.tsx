"use client";

import React, { useEffect, useState } from "react";
import { FloatingDock } from "@/components/ui/FloatingDock";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconExchange,
  IconHome,
  IconNewSection,
  IconTerminal2,
} from "@tabler/icons-react";

export default function FloatingDockAce() {
  const [isVisible, setIsVisible] = useState(true);
  
  const links = [
    {
      title: "LinkedIn",
      icon: (
        <IconBrandLinkedin className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "Twitter",
      icon: (
        <IconBrandX className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "#",
    },
    {
      title: "GitHub",
      icon: (
        <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "https://github.com/SKB336",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Get the footer element - adjust selector based on your footer implementation
      const footer = document.querySelector('footer');
      
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Hide dock when footer is visible (when footer top is less than window height)
      if (footerRect.top <= windowHeight) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Check initial state
    handleScroll();

    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`fixed bottom-0 left-0 md:left-1/2 md:-translate-x-1/2 mx-0 md:mx-auto z-50 m-4 transition-transform duration-500 ease-in-out ${
        isVisible ? 'translate-y-0' : 'translate-y-[150%]'
      }`}
    >
      <FloatingDock
        mobileClassName="left-4 translate-x-0"
        items={links}
      />
    </div>
  );
}
