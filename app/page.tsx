import Grid from "@/components/Grid";
import Hero from "@/components/Hero";
import { FloatingNav } from "@/components/ui/FloatingNav";
import Image from "next/image";
import { FaHome } from "react-icons/fa";
import RecentProjects from "@/components/RecentProjects";
import { navItems } from "@/data";
import Clients from "@/components/Clients";
import Experience from "@/components/Experience";
import Approach from "@/components/Approach";
import Footer from "@/components/Footer";
import FixedElements from "@/components/FixedElements";

export default function Home() {
  return (
    <main className="relative bg-black-100 flex justify-center items-center flex-col 
      mx-auto sm:px-10 px-5 overflow-clip"
    >
      <div className="max-w-7xl w-full">
        {/* <FixedElements /> */}
        <FloatingNav navItems={navItems}/>
        <Hero />
        <Grid />
        <RecentProjects />
        <Clients />
        <Experience />
        <Approach />
        <Footer />
      </div>
    </main>
  );
}
