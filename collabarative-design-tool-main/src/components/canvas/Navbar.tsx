"use client"

import { useState } from "react"
import { UserPlus, Users, Settings, Share2, Download, MoreHorizontal } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"

// Dummy users data
const dummyUsers = [
  {
    id: 1,
    name: "A",
    email: "john@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    isOnline: true,
    color: "#3B82F6",
  },
  {
    id: 2,
    name: "B",
    email: "sarah@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    isOnline: true,
    color: "#EF4444",
  },
  {
    id: 3,
    name: "C",
    email: "mike@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    isOnline: false,
    color: "#10B981",
  },
  {
    id: 4,
    name: "D",
    email: "emily@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    isOnline: true,
    color: "#F59E0B",
  },
]

interface NavbarProps {
  roomName?: string
}

const Navbar = ({ roomName = "Untitled Room" }: NavbarProps) => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return


    alert(`Invitation sent to ${inviteEmail}`)
    setInviteEmail("")
    setIsInviteDialogOpen(false)
  }

  

  return (
    <TooltipProvider>
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            
            <h1 className="text-xl font-bold text-gray-900">CoDraw</h1>
          </div>

          <div className="hidden md:block w-px h-6 bg-gray-300" />

          <div className="hidden md:block">
            <h2 className="text-sm font-medium text-gray-900">{roomName}</h2>
            <p className="text-xs text-gray-500"></p>
          </div>
        </div>

        
        <div className="flex ml-250 items-center space-x-2">
          <div className="flex items-center -space-x-2">
            {dummyUsers.slice(0, 4).map((user) => (
              <Tooltip key={user.id}>
                <TooltipTrigger>
                  <div className="relative">
                    <Avatar className="w-8 h-8 border-2 border-white hover:scale-110 transition-transform cursor-pointer">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback style={{ backgroundColor: user.color }}>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.isOnline ? "Online" : "Offline"}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {dummyUsers.length > 4 && (
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
              +{dummyUsers.length - 4}
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Invite Button */}
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-1 bg-transparent">
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Invite</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite</DialogTitle>
                <DialogDescription>
                 
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleInviteUser()
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteUser} disabled={!inviteEmail.trim()}>
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

         

         
         
        </div>
      </nav>
    </TooltipProvider>
  )
}

export default Navbar
