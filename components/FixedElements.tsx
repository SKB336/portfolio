import React from 'react'
import { FaDownload } from 'react-icons/fa'

const FixedElements = () => {
  return (
    // <div className='fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-black-100 p-2 rounded-full'>
    //   <FaDownload className='w-5 h-5 cursor-pointer' />
    //   <span className='text-xl font-semibold text-white-200'>Resume</span>
    // </div>
    // <button className="fixed bottom-5 left-5 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-b from-[#372189] to-black-100 text-white focus:ring-2 focus:ring-blue-400 hover:shadow-xl transition duration-200">
    //     <FaDownload className='w-5 h-5 cursor-pointer' />
    //     <span className='text-xl'>Resume</span>
    // </button>
    <button className="p-[3px] fixed bottom-5 left-5 z-50 rounded-full">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
      <div className="px-8 py-2 flex items-center gap-2 bg-black rounded-full  relative group transition duration-200 text-white hover:bg-transparent">
        <FaDownload className='w-5 h-5 cursor-pointer' />
        <span className='text-xl'>Resume</span>
      </div>
    </button>
  )
}

export default FixedElements