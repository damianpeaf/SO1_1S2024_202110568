import React, { useEffect, useState } from "react";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, LineElement
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend,PointElement,LineElement);

interface UsageInfoI {
    id: number
    usage_percentage: string
    created_at: string
}

interface DataI {
    cpu_info: UsageInfoI[]
    memory_info: UsageInfoI[]
}

export const Historic = () => {

    const [historicInfo, setHistoricInfo] = useState<null | DataI>(null)
    const getInfo = async () => {
        try {
            const resp = await fetch('/api/historical-info', {
                method: 'GET',
                headers: {'Content-Type': 'application/json'}
            })
            const data = await resp.json()
            setHistoricInfo(data)
        } catch (error) {
            setHistoricInfo(null)
        }
    }


    useEffect(() => {
        getInfo()
    }, [])
    
    if(!historicInfo) return <p>Información no disponible</p>

  return (
    <div className="flex flex-col w-full h-full justify-center items-center">
        <h1 className="text-2xl w-full text-center">
        Información Histórica
        </h1>
            <h2 className="text-xl w-full text-center">
                Uso de Memoria
            </h2>
            <Line data={{
                labels: historicInfo.memory_info.map(data => {
                    // format date
                    const date = new Date(data.created_at)
                    return `${date.getHours()}:${date.getMinutes()} - ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
                }),
                datasets: [
                    {
                        label: 'Uso de memoria',
                        data: historicInfo.memory_info.map(data => data.usage_percentage),
                        fill: false,
                        backgroundColor: 'rgb(75, 192, 192)',
                        borderColor: 'rgba(75, 192, 192, 0.2)',
                    }
                ]
            }} />
            <h2 className="text-xl w-full text-center">
                Uso de CPU
            </h2>
            <Line data={{
                labels: historicInfo.cpu_info.map(data => {
                    // format date
                    const date = new Date(data.created_at)
                    return `${date.getHours()}:${date.getMinutes()} - ${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`
                }),
                datasets: [
                    {
                        label: 'Uso de CPU',
                        data: historicInfo.cpu_info.map(data => data.usage_percentage),
                        fill: false,
                        backgroundColor: 'rgb(75, 192, 192)',
                        borderColor: 'rgba(75, 192, 192, 0.2)',
                    }
                ]
            }} />
    </div>
  )
}