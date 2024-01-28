'use client'

import { useState } from "react"
import { Button } from "./ui/Button"


type StudentInfoT = {
  name: string
  id: number
}

export const Hero = () => {

  const [info, setInfo] = useState<StudentInfoT | null>(null)


  const fetchInfo = async () => {

    const res = await fetch('http://localhost:8080/data')
    const data = await res.json()
    setInfo(data)
  }

  return (
    <div className={`mb-3 text-2xl font-semibold`}>
        <Button
        onClick={fetchInfo}
        disabled={info !== null}
        >
          Mostrar datos
        </Button>

        {
          info && (
            <div className={`mt-3 text-xl font-semibold`}>
              <p>Nombre: {info.name}</p>
              <p>Carnet: {info.id}</p>
            </div>
          )
        }
    </div>
  )
}