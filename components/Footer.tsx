import React from 'react'
import MagicButton from './ui/MagicButton'
import { FaLocationArrow } from 'react-icons/fa'
import { socialMedia } from '@/data'
import { Cover } from './ui/Cover'

const Footer = () => {
  return (
    <footer className='w-full pb-10 mb-[100px] md:mb-5' id="contact">
      <div className='flex flex-col items-center justify-center'>
        <h1 className='heading lg:max-w[45vw]'>
          Ready to take {' '}
          <span className='text-purple'>
            your
          </span>
          {' '} digital presence to the <Cover>next level</Cover>?
        </h1>

        <p className='text-white-200 md:mt-10 my-5 text-center'>
          Reach out to me today and let&apos;s discuss how we can help you take your digital presence to the next level.
        </p>

        <a href="mailto:shakeebahmed336@gmail.com">
          <MagicButton
            title="Let's get in touch"
            icon={<FaLocationArrow />}
            position='right'
          />
        </a>
      </div>

      <div className='flex mt-16 md:flex-row flex-col justify-between items-center'>
        <p className='md:text-base text-sm md:font-normal font-light text-center sm:text-left mb-4 sm:mb-0'>
          Copyright © {new Date().getFullYear()} Shakeeb Ahmed. All rights reserved.
        </p>

        <div className='flex items-center md:gap-3 gap-6'>
          {socialMedia.map(profile => (
            <a key={profile.id} href={profile.link} target="_blank" rel="noopener noreferrer">
              <div className="w-10 h-10 cursor-pointer flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300">
                <img src={profile.img} alt={profile.id.toString()} width={20} height={20} />
              </div>
            </a>
          ))}

        </div>
      </div>
    </footer>
  )
}

export default Footer