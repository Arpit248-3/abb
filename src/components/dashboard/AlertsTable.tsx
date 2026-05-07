import React from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ArrowRight, MoreVertical } from "lucide-react"

const alerts = [
  {
    time: "10:24:15 AM",
    asset: "P-101",
    name: "High Pressure Detected",
    severity: "Critical",
    status: "Active",
  },
  {
    time: "10:18:42 AM",
    asset: "V-205",
    name: "Valve Position Deviation",
    severity: "High",
    status: "Active",
  },
  {
    time: "09:55:33 AM",
    asset: "T-301",
    name: "High Temperature Warning",
    severity: "Medium",
    status: "Acknowledged",
  },
  {
    time: "09:42:10 AM",
    asset: "F-401",
    name: "Flow Sensor Malfunction",
    severity: "Low",
    status: "Resolved",
  },
]

export function AlertsTable() {
  return (
    <Card className="border border-zinc-200 shadow-md bg-white overflow-hidden h-full flex flex-col">
      <CardHeader className="p-5 flex flex-row items-center justify-between space-y-0 border-b border-zinc-50 bg-zinc-50/20">
        <CardTitle className="text-sm font-black text-zinc-500 uppercase tracking-widest leading-none">Global Event Log</CardTitle>
        <button className="flex items-center gap-2 text-blue-600 text-xs font-black uppercase hover:gap-4 transition-all tracking-widest">
          View Audit Trail <ArrowRight className="w-4 h-4" />
        </button>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-100 hover:bg-transparent h-14 bg-zinc-50/50">
              <TableHead className="px-6 text-xs font-black text-zinc-500 uppercase tracking-widest">Timestamp</TableHead>
              <TableHead className="text-xs font-black text-zinc-500 uppercase tracking-widest">System Asset</TableHead>
              <TableHead className="text-xs font-black text-zinc-500 uppercase tracking-widest">Alert Category</TableHead>
              <TableHead className="text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Severity</TableHead>
              <TableHead className="text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Status</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alerts.map((alert, i) => (
              <TableRow key={i} className="border-zinc-50 hover:bg-blue-50/30 group transition-colors h-16">
                <TableCell className="px-6 text-sm font-bold text-zinc-500 whitespace-nowrap">{alert.time}</TableCell>
                <TableCell className="text-sm font-black text-zinc-900 whitespace-nowrap uppercase tracking-tight">{alert.asset}</TableCell>
                <TableCell className="text-base font-black text-rose-600 leading-tight">{alert.name}</TableCell>
                <TableCell className="text-center">
                  <Badge 
                    className={`text-xs px-3 py-1 border-2 font-black uppercase shadow-sm ${
                      alert.severity === 'Critical' ? 'bg-rose-600 text-white border-rose-500' :
                      alert.severity === 'High' ? 'bg-orange-500 text-white border-orange-400' :
                      alert.severity === 'Medium' ? 'bg-yellow-500 text-white border-yellow-400' :
                      'bg-emerald-600 text-white border-emerald-500'
                    }`}
                  >
                    {alert.severity}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant="outline" 
                    className={`text-xs px-3 py-1 border-2 font-black uppercase ${
                      alert.status === 'Active' ? 'bg-emerald-600 text-white border-emerald-500 shadow-md' : 'text-zinc-500 bg-zinc-100 border-zinc-200'
                    }`}
                  >
                    {alert.status}
                  </Badge>
                </TableCell>
                <TableCell className="pr-6">
                   <button className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-400 group-hover:text-zinc-900 transition-all border border-transparent hover:border-zinc-200">
                      <MoreVertical className="w-5 h-5" />
                   </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
