import { useEffect, useState } from "react"
import { Graphviz } from 'graphviz-react';
import {Select, SelectItem, Selection} from "@nextui-org/react";


interface ProcessI {
    pid: number
    name: string
    pidPadre?: number
    child?: ProcessI[]
}

interface CpuInfoI {
    processes: ProcessI[]
}

export const Tree = () => {

    const [dot, setDot] = useState<null | string>(null)
    const [processes, setProcesses] = useState<null | ProcessI[]>(null)
    const [options, setOptions] = useState<ProcessI[]>([])
    const [selectedProcess, setSelectedProcess] = useState<string>('')
    const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const getTreeInfo = async () => {
        try {
            const resp = await fetch('/api/proc-tree-info', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await resp.json() as CpuInfoI
            setProcesses(data.processes)
            const options =getAllProcesses(data.processes)
            setOptions(options)
            if(!selectedProcess) setSelectedProcess(options[0].pid.toString())
        } catch (error) {
            console.log(error)
        }
    }


    // TODO test this
    const onChangeOption = async (selected: ProcessI) => {
        setDot(null)
        await new Promise((resolve) => setTimeout(resolve, 100))
        setDot(graph(selected))
    }

    useEffect(() => {
        getTreeInfo()
    }, [])

    useEffect(() => {
        if(selectedProcess && processes) {
            const selected = processes.find((proc) => proc.pid.toString() === selectedProcess)
            if(selected) onChangeOption(selected)

        }
    }, [selectedProcess, processes])

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("load", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("load", handleResize);
        };
    }, []);

  if(!dot) return <div>Información no disponible</div>

  return (
        <div className="flex w-full flex-col gap-2">
      <Select
        label="Proceso"
        variant="bordered"
        placeholder="Selecciona un proceso padre"
        selectedKeys={[selectedProcess]}
        className="max-w-xs"
        onChange={(e) => setSelectedProcess(e.target.value)}
        >
        {options.map((proc) => (
          <SelectItem key={proc.pid} value={proc.pid}>
            {`${proc.pid} - ${proc.name}`}
          </SelectItem>
        ))}
      </Select>
      <Graphviz
            dot={dot}
            options={{
                useWorker: false,
                engine: "dot",
                height: (windowSize.height * 0.8),
                width: (windowSize.width * 0.8),
                fit: true,
                scale: 1,
                zoom: true,
            }}
        />
    </div>
  )
}


const graph = (processes: ProcessI) => {
    return `digraph G {
        ${graphNode(processes)}
    }`

}
const graphNode = (root: ProcessI) :string => {
    
    // define all nodes
    let nodeDefs = ''
    let edgeDefs = ''
    
    // define root
    nodeDefs += getGraphvizNode(root) + '\n'

    // define children
    root.child?.forEach((child) => {
        nodeDefs += graphNode(child)
        edgeDefs += getGraphvizEdge(child) + '\n'
    })
    
    return nodeDefs + edgeDefs
}

const getGraphvizNode = (process: ProcessI) => {
    return `N${process.pid} [label="${process.pid} - ${process.name}" shape=box]`
}

const getGraphvizEdge = (process: ProcessI) => {
    return `N${process.pidPadre} -> N${process.pid}`
}

const getAllProcesses = (processes: ProcessI[]) => {
    const procs :ProcessI[] = []
    processes.forEach((proc) => {
        procs.push(proc)
    })
    return procs
}