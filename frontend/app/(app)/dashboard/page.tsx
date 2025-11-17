"use client"
import EtfService from "@/lib/api/etfService"
import { useEffect } from "react"
import { useMultipleSectorsReturnRateHistory}  from "@/hooks/useEtfQueryHooks"
export default function Page() {
  // const  = useMultipleSectorsReturnRateHistory(["计算机", "创新药", "红利"], "2024-09-20", 5)
  // const { data, isLoading, error } = useMultipleSectorsReturnRateHistory(
  //   ["计算机", "创新药", "红利"], 
  //   "2024-09-20", 
  //   5
  // )
  // console.log(data)
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        {/* {JSON.stringify(data)} */}
      </div>
    </div>

  )
}
