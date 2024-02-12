import { useEffect, useState } from 'react';
import { GetRamInfo } from "../wailsjs/go/main/App";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface RamDataI {
    total: number
    used: number
    percentage: number
    free: number
}

function App() {

    const [data, setData] = useState<null | RamDataI>(null)

    const getRamInfo = async () => {
        try {
            const res = await GetRamInfo()
            console.log(res)
            const data = JSON.parse(res)
            setData({
                total: data.total / (1024 * 1024 * 1024),
                used: data.used / (1024 * 1024 * 1024),
                free: data.free / (1024 * 1024 * 1024),
                percentage: data.percentage,
            })
        } catch (error) {
            setData(null)
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            getRamInfo()
        }, 500)

        return () => clearInterval(interval)
    }, [])

    if (!data) return <section>
        <h1>Sin datos</h1>
    </section>

    return (
        <section>
            <h1>RAM</h1>
            <h2>Porcentaje utilizado: {data.percentage} %</h2>
            <h2>Porcentaje libre: {100 - data.percentage} %</h2>
            <h2>Usado: {data.used.toFixed(4)} GB</h2>
            <h2>Libre: {data.free.toFixed(4)} GB</h2>
            <h2>Total: {data.total.toFixed(4)} GB</h2>
            <Pie
                className='ram-chart'
                data={{
                    labels: ['Usado', 'Libre'],
                    datasets: [{
                        label: 'RAM',
                        data: [data.used, data.free],
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
        </section>
    )
}

export default App
