"use client"

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import SidebarItem from "./SidebarItem";

export default function Sidebar() { 
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // When mounted on client, now we can show the UI
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <div>
            <SidebarItem />
        </div>
    )
}