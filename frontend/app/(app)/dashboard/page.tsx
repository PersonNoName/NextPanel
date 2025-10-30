"use client"
import EtfService from "@/lib/api/etfService"
import { useEffect } from "react"
import {usePreloadSectorReturnRates, useSectorReturnRate}  from "@/hooks/useEtfQueryHooks"
export default function Page() {
  const { preload } = usePreloadSectorReturnRates()
  useEffect(() => {
    preload()
  }, [])
  const { data, isLoading, error } = useSectorReturnRate(5)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div>
        {isLoading ? "Loading..." : error ? `Error: ${error.message}` : JSON.stringify(data)}
      </div>
    </div>

  )
}
