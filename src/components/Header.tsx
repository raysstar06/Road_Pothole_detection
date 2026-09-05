"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "./ui/button"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-900 tracking-tight">RoadWatch<span className="text-blue-600">AI</span></span>
          </Link>
        </div>

        <nav className="flex items-center space-x-4">
          {session ? (
            <>
              {session.user.role === 'ADMIN' ? (
                <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-blue-600">Admin Dashboard</Link>
              ) : (
                <Link href="/citizen" className="text-sm font-medium text-slate-600 hover:text-blue-600">Citizen Portal</Link>
              )}
              <div className="text-sm font-medium text-slate-900 border-l pl-4 ml-4">
                {session.user.name} ({session.user.role})
              </div>
              <Button variant="ghost" onClick={() => signOut({ callbackUrl: '/' })}>
                Log out
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button>Login</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
