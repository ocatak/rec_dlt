import React from 'react'
import loader from '../../public/loader.svg'
import Image from 'next/image'
function Loading() {
  return (
    <div className='fixed inset-16 flex justify-center items-center text-center'>
      <Image priority src={loader} alt='Loading...' height={300} width={300}/>
    </div>
  )
}

export default Loading