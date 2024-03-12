import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface RamDataI {
    total: number
    used: number
    percentage: number
    free: number
}

interface CpuDataI {
    total_usage: number
    total_time_cpu: number
}

export const Realtime = () => {
    const [ramData, setRamData] = useState<null | RamDataI>(null)
    const [cpuData, setCpuData] = useState<null | {percentage:number}>(null)


    const getRamInfo = async () => {
        try {
            const resp = await fetch('/api/ram-info', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await resp.json()
            setRamData({
                total: data.total / (1024 * 1024 * 1024),
                used: data.used / (1024 * 1024 * 1024),
                free: data.free / (1024 * 1024 * 1024),
                percentage: data.percentage,
            })
        } catch (error) {
            setRamData(null)
        }
    }

    const getCpuInfo = async () => {
        try {
            const resp = await fetch('/api/cpu-info', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await resp.json()
            setCpuData({
                percentage: 100 - Number(data.idle)
            })
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            getRamInfo()
            getCpuInfo()
        }, 500)

        return () => clearInterval(interval)
    }, [])

    if(!ramData || !cpuData) return <>Información no disponible</>
  return (
    <section className='grid grid-cols-2'>
            <article>
            <h1 className='w-full text-center text-xl'>RAM</h1>
            <h2>Porcentaje utilizado: {ramData.percentage} %</h2>
            <h2>Porcentaje libre: {100 - ramData.percentage} %</h2>
            <h2>Usado: {ramData.used.toFixed(4)} GB</h2>
            <h2>Libre: {ramData.free.toFixed(4)} GB</h2>
            <h2>Total: {ramData.total.toFixed(4)} GB</h2>
            <Pie
                className='ram-chart'
                data={{
                    labels: ['Usado', 'Libre'],
                    datasets: [{
                        label: 'RAM',
                        data: [ramData.used, ramData.free],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                        ],
                        borderWidth: 1,
                    }],
                }}
            />

            </article>
            <article>
                <h1 className='w-full text-center text-xl'>CPU</h1>
                <h2>Porcentaje utilizado: {cpuData.percentage} %</h2>
                <h2>Porcentaje libre: {100 - cpuData.percentage} %</h2>
                <br/>
                <br/>
                <Pie
                    className='cpu-chart'
                    data={{
                        labels: ['Usado', 'Libre'],
                        datasets: [{
                            label: 'cpu',
                            data: [cpuData.percentage, 100 - cpuData.percentage],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                            ],
                            borderWidth: 1,
                        }],
                    }}
                />
            </article>
        </section>
  )
}