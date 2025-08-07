import Link from 'next/link'
import { 
  IconListCheck, 
  IconBrandWhatsapp, 
  IconBrandGithub, 
  IconBrandGmail,
  IconMailFilled,
  IconGrain,
  IconServer
} from '@tabler/icons-react'
import Image from 'next/image'

import type { Metadata } from "next";
import ClockCard from './ClockCard';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard with links to my services",
  icons: {
    icon: '/dashboardIcon.png',
    // Optional: add more icon sizes
    shortcut: '/dashboardIcon.png',
    apple: '/dashboardIcon.png',
  },
};

const dashboardItems = [
  {
    title: 'Projects',
    description: 'Task management',
    href: 'https://app.plane.so/crack-vault/projects',
    icon: IconListCheck,
    status: 'online',
    color: 'bg-blue-500'
  },
  {
    title: 'Whatsapp',
    description: 'Texts & calls',
    href: 'https://web.whatsapp.com',
    icon: IconBrandWhatsapp,
    status: 'online',
    color: 'bg-green-500'
  },
  {
    title: 'Github',
    description: 'Code & projects',
    href: 'https://github.com',
    icon: IconBrandGithub,
    status: 'online',
    color: 'bg-[#14191F]'
  },
  {
    title: 'Gmail',
    description: 'Email & contacts',
    href: 'https://mail.google.com',
    icon: IconBrandGmail,
    status: 'online',
    color: 'bg-gradient-to-br from-red-500 to-blue-500'
  },
  {
    title: 'Outlook',
    description: 'Email & contacts',
    href: 'https://outlook.live.com',
    icon: IconMailFilled,
    status: 'online',
    color: 'bg-blue-500'
  }
]

const llms = [
  {
    title: 'ChatGPT',
    description: 'Chat with ChatGPT',
    href: 'https://chat.openai.com',
    icon: "/home-assets/chatgpt.svg",
    status: 'online',
    color: 'bg-[#14191F]',
  },
  {
    title: 'Gemini',
    description: 'Chat with Gemini',
    href: 'https://gemini.google.com',
    icon: "/home-assets/gemini.svg",
    status: 'online',
    color: 'bg-white'
  },
  {
    title: 'Claude',
    description: 'Chat with Claude',
    href: 'https://claude.ai',
    icon: "/home-assets/claude.svg",
    status: 'online',
    color: 'bg-[#D97757]',
  },
  {
    title: 'DeepSeek',
    description: 'Chat with DeepSeek',
    href: 'https://deepseek.com',
    icon: "/home-assets/deepseek.svg",
    status: 'online',
    color: 'bg-white',
    iconColor: 'text-blue-500'
  }
]

const getStatusColor = (status: string) => {
  switch(status) {
    case 'online': return 'bg-green-400'
    case 'warning': return 'bg-yellow-400'
    case 'offline': return 'bg-red-400'
    default: return 'bg-gray-400'
  }
}

export default async function Dashboard() {
  console.log("fetching...")
  const { data, error } = await supabase
  .from('websites')
  .select('*')

  console.log("fetched")
  if (error) {
    console.log(error)
    console.error(error)
    return
  }

  console.log(data)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
              <p className="text-slate-400 mt-1">Manage your infrastructure and services</p>
            </div>
            {/* <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-slate-300">All systems operational</span>
              </div>
            </div> */}
            <ClockCard />
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardItems.map((item, index) => {
            const IconComponent = item.icon
            return (
              <Link key={index} target={item.href.startsWith('http') ? '_blank' : '_self'} href={item.href}>
                <div className="group relative bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 rounded-xl p-6 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-slate-900/20 cursor-pointer">
                  {/* Status indicator */}
                  <div className="absolute top-4 right-4">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${item.color} mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-white text-lg font-semibold mb-2 group-hover:text-slate-100">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300">
                    {item.description}
                  </p>
                  
                  {/* Hover arrow */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Stats */}
      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-white text-xl font-semibold mb-4">Quick Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">12</div>
              <div className="text-slate-400 text-sm">Services Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">98.5%</div>
              <div className="text-slate-400 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">2.1GB</div>
              <div className="text-slate-400 text-sm">Memory Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">15%</div>
              <div className="text-slate-400 text-sm">CPU Load</div>
            </div>
          </div>
        </div>
      </div> */}

      {/* LLMs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-white text-xl font-semibold mb-4">Large Language Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {llms.map((item, index) => {
              const IconComponent = item.icon
              return (
                <Link key={index} target={item.href.startsWith('http') ? '_blank' : '_self'} href={item.href}>
                  <div className="group relative bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 rounded-xl p-2 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-slate-900/20 cursor-pointer flex items-center justify-start gap-4">
                    {/* Status indicator */}
                    {/* <div className="absolute top-4 right-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                    </div> */}
                    
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${item.color} group-hover:scale-110 transition-transform duration-200`}>
                      {/* {typeof item.icon === 'string' ? ( */}
                      <img src={item.icon} alt={item.title} className="w-6 h-6" />
                    {/* ) : (
                      <IconComponent className={`w-6 h-6 ${item.iconColor || 'text-white'}`} />
                    )} */}
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-white text-lg font-semibold group-hover:text-slate-100">
                      {item.title}
                    </h3>
                    {/* <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300">
                      {item.description}
                    </p> */}
                    
                    {/* Hover arrow */}
                    <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Clients */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h2 className="text-white text-xl font-semibold mb-4">Clients</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.map((item, index) => {
              return (
                <Link key={index} target={item.href.startsWith('http') ? '_blank' : '_self'} href={item.href}>
                  <div className="group relative bg-slate-800/50 backdrop-blur-sm hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 rounded-xl p-2 transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-slate-900/20 cursor-pointer flex items-center justify-start gap-4">
                    {/* Icon */}
                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg group-hover:scale-110 transition-transform duration-200`}
                      style={{ 
                        backgroundColor: item.color || '',
                        backgroundImage: item.color ? '' : `linear-gradient(to bottom right, #994683, #B8489A)`
                      }}
                    >
                      <IconServer className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-white text-lg font-semibold group-hover:text-slate-100">
                      {item.title}
                    </h3>
                    
                    {/* Hover arrow */}
                    <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}