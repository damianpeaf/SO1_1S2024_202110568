'use client'
import {Tabs, Tab, Card, CardBody} from "@nextui-org/react";
import { Realtime } from "./Realtime";
import { Tree } from "./Tree";

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
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
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
            <Tree />
          </CardBody>
        </Card>  
      </Tab>
    </Tabs>
  </div>  
  )
}