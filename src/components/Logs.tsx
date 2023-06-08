// @ts-nocheck
import { Console, Hook, Unhook } from 'console-feed'
import { useEffect, useState } from 'preact/hooks'

export function LogsContainer() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const hookedConsole = Hook(
      window.console,
      (log) => {
        setLogs((currLogs) => [...currLogs, log])
      },
      false
    )
    return () => Unhook(hookedConsole)
  }, [])

  return <Console logs={logs} />
}
