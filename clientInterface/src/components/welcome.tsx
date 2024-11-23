"use client"
import React, { useContext, useEffect, useState } from 'react'
import { getCookie, verifyAuthToken } from '@/lib/cookieHandler'

function Welcome() {
  const [name, setName] = useState<string>()

  const findName = async () => {
    try {
      const res = await getCookie()
      const val = await verifyAuthToken(res as string)
      if(val)
        setName(val._id)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    findName()
  }, [])

  return (
    <p className='text-[25px] md:text-[40px] '> Welcome {name ? name: "to REC client portal"}</p>
  )
}

export default Welcome