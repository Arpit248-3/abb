import React from "react"
import { ReactFlow, Background, Controls } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const initialNodes = [
  { 
    id: '1', 
    position: { x: 50, y: 100 }, 
    data: { label: 'Inlet Flow Sensor' },
    style: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', width: 120 }
  },
  { 
    id: '2', 
    position: { x: 250, y: 100 }, 
    data: { label: 'Pump P-101 (Critical)' },
    style: { background: '#fef2f2', border: '1px solid #fee2e2', color: '#ef4444', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', width: 120 }
  },
  { 
    id: '3', 
    position: { x: 450, y: 100 }, 
    data: { label: 'Line L-203 (Blockage)' },
    style: { background: '#fff7ed', border: '1px solid #ffedd5', color: '#f97316', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', width: 120 }
  },
]

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '3', target: '2', animated: true, label: 'Backpressure', style: { stroke: '#ef4444' } },
]

export function RootCauseFlow() {
  return (
    <Card className="border border-zinc-200 shadow-md flex flex-col overflow-hidden bg-white">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-sm font-black text-zinc-500 uppercase tracking-widest leading-none">Root Cause Network</CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[240px] relative bg-zinc-50/20">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          className="w-full h-full"
        >
          <Background color="#cbd5e1" gap={20} size={1} />
          <Controls className="scale-100 origin-bottom-left" />
        </ReactFlow>
      </CardContent>
    </Card>
  )
}
