import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, FolderIcon, FileChartColumnIcon, Settings2Icon, CircleHelpIcon, Layers } from "lucide-react"

const data = {
  user: {
    name: "Jae",
    email: "jae@desafio-fullstack.ia",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
  },
  navMain: [
    {
      id: "dashboard",
      title: "Dashboard",
      url: "#",
      icon: (
        <LayoutDashboardIcon />
      ),
    },
    {
      id: "projects",
      title: "Projetos",
      url: "#",
      icon: (
        <FolderIcon />
      ),
    },
    {
      id: "ai-analysis",
      title: "Diagnósticos IA",
      url: "#",
      icon: (
        <FileChartColumnIcon />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Configurações",
      url: "#",
      icon: (
        <Settings2Icon />
      ),
    },
    {
      title: "Ajuda",
      url: "#",
      icon: (
        <CircleHelpIcon />
      ),
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab: string
  onTabChange: (id: string) => void
}

export function AppSidebar({ activeTab, onTabChange, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#" onClick={(e) => { e.preventDefault(); onTabChange("dashboard"); }}>
                <Layers className="size-5! text-primary" />
                <span className="text-base font-bold">Projetos IA</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} activeTab={activeTab} onTabChange={onTabChange} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
