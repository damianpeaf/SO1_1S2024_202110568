import {Button, ButtonGroup} from "@nextui-org/react";
import Graphviz from "graphviz-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";


enum SimulationStatus {
    NEW = "NEW",
    RUNNING = "RUNNING",
    WAITING = "WAITING",
    READY = "READY",
    TERMINATED = "TERMINATED",
}

interface SimulationStateI {
    pid: string | null;
    currentStatus: SimulationStatus | null;
    lastStatus: SimulationStatus | null;
    transitedStates: SimulationStatus[];
    transitions: { [key: string]: SimulationStatus[] };
}


const initialSimulationState : SimulationStateI = {
    pid: null,
    currentStatus: null,
    lastStatus: null,
    transitedStates: [],
    transitions: {},
}

export const Simulation = () => {

    const [simulationState, setSimulationState] = useState<SimulationStateI>(initialSimulationState);
    const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const stateChanged = (from: SimulationStatus, to: SimulationStatus, state: SimulationStateI = simulationState) : SimulationStateI => {
        const newTransited = new Set([...state.transitedStates, from, to]);
        const fromTransitions = state.transitions[from] || [];
        const newFromTransitions = new Set(fromTransitions).add(to)
        return {
            ...state,
            currentStatus: to,
            lastStatus: from,
            transitedStates: Array.from(newTransited),
            transitions:{
                ...state.transitions,
                [from]: Array.from(newFromTransitions),
            }
        }
    }

    const onNewSimulation = async () => {
        console.log("New simulation");

        let pid = null;
        try {
            const resp = await fetch(`/api/start-process`, {
                method: "GET",
            });
            const data = await resp.json();
            pid = data?.pid;
        } catch (error) { console.error(error); }

        if (!pid) return toast.error("Error al iniciar el proceso");

        const state1 = stateChanged(SimulationStatus.NEW, SimulationStatus.READY, {...initialSimulationState, pid});
        const state2 = stateChanged(SimulationStatus.READY, SimulationStatus.RUNNING, state1);
        setSimulationState(state2);
        toast.success("Proceso iniciado");
    }

    const onKillSimulation =async  () => {
        console.log("Kill simulation");
        try {
            const resp = await fetch(`/api/kill-process?pid=${simulationState.pid}`, {
                method: "GET",
            });
            if (resp.status !== 200) throw new Error()
        } catch (error) { 
            toast.error("Error al matar el proceso");
            return console.error(error); 
        }
        const state1 = stateChanged(SimulationStatus.RUNNING, SimulationStatus.TERMINATED);
        setSimulationState(state1);
        toast.success("Proceso terminado");
    }

    const onStopSimulation = async () => {
        console.log("Stop simulation");
        try {
            const resp = await fetch(`/api/stop-process?pid=${simulationState.pid}`, {
                method: "GET",
            });
            if (resp.status !== 200) throw new Error()
        } catch (error) { 
            toast.error("Error al detener el proceso");
            return console.error(error); 
        }

        const state1 = stateChanged(SimulationStatus.RUNNING, SimulationStatus.READY);
        setSimulationState(state1);
        toast.success("Proceso detenido");
    }

    const onResumeSimulation = async () => {
        console.log("Resume simulation");
        try {
            const resp = await fetch(`/api/resume-process?pid=${simulationState.pid}`, {
                method: "GET",
            });
            if (resp.status !== 200) throw new Error()
        } catch (error) { 
            toast.error("Error al reanudar el proceso");
            return console.error(error); 
        }
        const state1 = stateChanged(SimulationStatus.READY, SimulationStatus.RUNNING);
        setSimulationState(state1);
        toast.success("Proceso reanudado");
    }

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


    console.log({dot: getGraphviz(simulationState)})

  return (
    <section>
    <ButtonGroup>
        <Button
            color="success"
            onClick={onNewSimulation}
        >
            New
        </Button>
        <Button
            color="danger"
            onClick={onKillSimulation}
        >
            Kill
        </Button>
        <Button
        color="warning"
        onClick={onStopSimulation}
        >
            Stop
        </Button>
        <Button 
        color="primary"
        onClick={onResumeSimulation}
        >
            Resume
        </Button>
  </ButtonGroup>
  {
    simulationState.pid && <>
  <h4 className="text-xl font-bold">PID: {simulationState.pid}</h4>
  <Graphviz
            dot={getGraphviz(simulationState)}
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
        </>
  }
  </section>
  )
}

const getGraphviz = (simulation: SimulationStateI) : string => {

    let dot = `digraph G {\n rankdir=LR\n node [shape=circle]\n`

    // Define nodes
    simulation.transitedStates.forEach((state, index) => {
        dot += `${state} [label="${state}" ${simulation.currentStatus === state ? ", style=filled, fillcolor=lightblue" : ""}]\n`
    })

    // Define edges
    simulation.transitions && Object.keys(simulation.transitions).forEach((from, index) => {
        simulation.transitions[from].forEach((to, index) => {
            dot += `${from} -> ${to} ${(simulation.lastStatus === from && simulation.currentStatus === to) ? "[color=red]" : ""}\n`
        })
    })

    dot += `}`
    return dot;
}

