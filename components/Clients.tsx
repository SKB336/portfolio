import React from 'react'
import { InfiniteMovingCards } from './ui/InfiniteMovingCards'
import { companies, testimonials } from '@/data'

const Clients = () => {
  return (
    <div className='py-20' id="testimonials">
      <h1 className='heading'>
        Kind words from {` `}
        <span className='text-purple'>
            satisfied clients
        </span>
      </h1>
      <div className='flex flex-col items-center max-lg:mt-10'>
          <InfiniteMovingCards 
            items={testimonials}
            direction='right'
            speed='slow'
            pauseOnHover={false}
          />
          
          <div className='flex flex-wrap items-center justify-center gap-4 md:gap-16 max-lg:mt-10'>
            {companies.map(({ id, img, name, nameImg, both}) => (
              <div key={id} className='flex md:max-w-60 max-w-32 gap-2'>
                {both ? (
                  <img src={both} alt={name} className='md:w-24 w-20'/>
                ) : (
                  <>
                    <img src={img} alt={name} className='md:w-10 w-5'/>
                    <img src={nameImg} alt={name} className='md:w-24 w-20'/>
                  </>
                )}
              </div>
            ))}
          </div>
      </div>
    </div>
  )
}

export default Clients