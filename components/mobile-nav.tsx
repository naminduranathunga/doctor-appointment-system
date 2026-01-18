"use client"

import Link from "next/link"
import { Search, Calendar, Home } from "lucide-react"

export default function MobileNav() {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t h-16 flex items-center justify-around z-50 px-2 safe-area-pb">
            <Link href="/medical-centers" className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-primary active:text-primary">
                <Search className="h-5 w-5" />
                <span className="text-[10px] font-medium">Find</span>
            </Link>
            <Link href="/my-appointments" className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-primary active:text-primary">
                <Calendar className="h-5 w-5" />
                <span className="text-[10px] font-medium">My Appts</span>
            </Link>
            <Link href="/" className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-primary active:text-primary">
                <Home className="h-5 w-5" />
                <span className="text-[10px] font-medium">Home</span>
            </Link>
        </div>
    )
}
