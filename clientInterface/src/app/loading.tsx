import React from 'react'
import loader from '../../public/loader.svg'
import Image from 'next/image'
function Loading() {
  return (
    <div className='flex justify-center items-center text-center'>
      <Image priority src={loader} alt='Loading...' height={400} width={400}/>
    </div>
  )
}

export default Loading