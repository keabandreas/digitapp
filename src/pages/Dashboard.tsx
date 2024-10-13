import React from 'react'
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card"
import { ServerIcon, BarChart2Icon, BoxesIcon, CloudIcon, HomeIcon, SettingsIcon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { Sidebar } from "@/components/ui/sidebar"

const cardData = [
  { title: 'Host Applications', icon: ServerIcon, link: '/HostApplications' },
  { title: 'Statistics', icon: BarChart2Icon, link: '/Statistics' },
  { title: 'Docker', icon: BoxesIcon, link: '#' },
  { title: 'Nextcloud', icon: CloudIcon, link: '#' },
]

const sidebarItems = [
  { name: "Home", icon: HomeIcon, link: "/" },
  { name: "Host Applications", icon: ServerIcon, link: "/HostApplications" },
  { name: "Statistics", icon: BarChart2Icon, link: "/Statistics" },
  { name: "Settings", icon: SettingsIcon, link: "#" },
  { name: "Profile", icon: UserIcon, link: "#" },
]

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar items={sidebarItems} />
      <div className="flex-1 overflow-auto">
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-10 text-center">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
              {cardData.map((card, index) => (
                <Link href={card.link} key={index} className="w-full max-w-sm">
                  <CardContainer className="inter-var w-full">
                    <CardBody className="bg-white relative group/card hover:shadow-2xl hover:shadow-emerald-500/[0.1] dark:bg-gray-800 dark:border-white/[0.2] border-black/[0.1] w-full h-[250px] rounded-xl p-6 border">
                      <CardItem
                        translateZ="50"
                        className="text-xl font-bold text-gray-900 dark:text-white"
                      >
                        {card.title}
                      </CardItem>
                      <CardItem
                        as="p"
                        translateZ="60"
                        className="text-neutral-500 text-sm mt-2 dark:text-neutral-300"
                      >
                        Manage your {card.title.toLowerCase()}
                      </CardItem>
                      <CardItem translateZ="100" className="w-full mt-4 flex justify-center">
                        <card.icon className="w-16 h-16 text-blue-500" />
                      </CardItem>
                      <CardItem
                        translateZ={20}
                        as="button"
                        className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold mt-4 absolute bottom-6 right-6"
                      >
                        View Details
                      </CardItem>
                    </CardBody>
                  </CardContainer>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
