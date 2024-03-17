'use client'
import {Tabs, Tab, Card, CardBody} from "@nextui-org/react";
import { Realtime } from "./Realtime";
import { Tree } from "./Tree";
import { Historic } from "./Historic";
import { Simulation } from "./Simulation";

export const AppOptions = () => {
  return (
    <div className="flex w-full flex-col">
    <Tabs aria-label="Options">
      <Tab key="realtime" title="Monitoreo En Tiempo Real">
        <Card>
          <CardBody>
            <Realtime />
          </CardBody>
        </Card>  
      </Tab>
      <Tab key="historic" title="Monitoreo Histórico">
        <Card>
          <CardBody>
            <Historic />
          </CardBody>
        </Card>  
      </Tab>
      <Tab key="tree" title="Árbol de procesos">
        <Card>
          <CardBody>
            <Tree />
          </CardBody>
        </Card>  
      </Tab>
      <Tab key="simulation" title="Simulación de procesos">
        <Card>
          <CardBody>
            <Simulation />
          </CardBody>
        </Card>  
      </Tab>
    </Tabs>
  </div>  
  )
}