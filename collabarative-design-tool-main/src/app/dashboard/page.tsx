"use client"

import { useState } from "react"
import { Plus, LogOut, Users, UserPlus } from "lucide-react"
import { signout } from "~/actions/auth"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
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
import { Textarea } from "~/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

const colors = [
  "bg-rose-300",
  "bg-blue-300",
  "bg-green-300",
  "bg-yellow-300",
  "bg-purple-300",
  "bg-pink-300",
  "bg-indigo-300",
  "bg-orange-300",
  "bg-teal-300",
  "bg-cyan-300",
]

const page = () => {
  const [myProjects, setMyProjects] = useState([
    {
      id: 1,
      name: "Test Room",
      description: "Initial test project",
      createdDate: "Created Today",
      color: "bg-rose-300",
      password: "test123",
      isOwner: true,
    },
  ])

  const [sharedProjects, setSharedProjects] = useState([
    {
      id: 2,
      name: "Design Collaboration",
      description: "Shared design workspace",
      createdDate: "Created Yesterday",
      color: "bg-green-300",
      password: "shared123",
      isOwner: false,
      sharedBy: "john@example.com",
    },
    {
      id: 3,
      name: "Marketing Assets",
      description: "Brand assets and materials",
      createdDate: "Created 2 days ago",
      color: "bg-purple-300",
      password: "marketing456",
      isOwner: false,
      sharedBy: "sarah@company.com",
    },
  ])

  const [activeTab, setActiveTab] = useState("my-projects")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "bg-blue-300",
    password: "",
  })

  const [joinDialog, setJoinDialog] = useState({
    isOpen: false,
    projectId: null,
    projectName: "",
  })

  const [passwordDialog, setPasswordDialog] = useState({
    isOpen: false,
    projectId: null,
    enteredPassword: "",
  })

  const [participantDialog, setParticipantDialog] = useState({
    isOpen: false,
    projectId: null,
    email: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCreateProject = () => {
    if (!formData.name.trim() || !formData.password.trim()) return

    const newProject = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      createdDate: "Created Today",
      color: formData.color,
      password: formData.password,
      isOwner: true,
    }

    setMyProjects((prev) => [...prev, newProject])

    // Reset form and close dialog
    setFormData({
      name: "",
      description: "",
      color: "bg-blue-300",
      password: "",
    })
    setIsCreateDialogOpen(false)
  }

  const handleMyProjectClick = (project: any) => {
    setJoinDialog({
      isOpen: true,
      projectId: project.id,
      projectName: project.name,
    })
  }

  const handleSharedProjectClick = (projectId: number) => {
    setPasswordDialog({
      isOpen: true,
      projectId,
      enteredPassword: "",
    })
  }

  const handleJoinRoom = () => {
    alert(`Joining ${joinDialog.projectName}...`)
    setJoinDialog({
      isOpen: false,
      projectId: null,
      projectName: "",
    })
  }

  const handleAddParticipants = () => {
    setJoinDialog({
      isOpen: false,
      projectId: null,
      projectName: "",
    })
    setParticipantDialog({
      isOpen: true,
      projectId: joinDialog.projectId,
      email: "",
    })
  }

  const handlePasswordSubmit = () => {
    const project = sharedProjects.find((p) => p.id === passwordDialog.projectId)
    if (project && project.password === passwordDialog.enteredPassword) {
      // Password correct - join the room
      alert(`Joining ${project.name}...`)
      setPasswordDialog({
        isOpen: false,
        projectId: null,
        enteredPassword: "",
      })
    } else {
      // Password incorrect
      alert("Incorrect password. Please try again.")
    }
  }

  const handleAddParticipant = () => {
    if (!participantDialog.email.trim()) return

    alert(`Invitation sent to ${participantDialog.email}`)
    setParticipantDialog({
      isOpen: false,
      projectId: null,
      email: "",
    })
  }

  const handlePasswordChange = (value: string) => {
    setPasswordDialog((prev) => ({
      ...prev,
      enteredPassword: value,
    }))
  }

  const handleEmailChange = (value: string) => {
    setParticipantDialog((prev) => ({
      ...prev,
      email: value,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Design Workspace</h1>
                <p className="text-sm text-gray-600">Manage your design projects</p>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => signout()} className="flex items-center space-x-2">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared-with-me">Shared with Me</TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myProjects.map((project) => (
                <div key={project.id} className="group cursor-pointer" onClick={() => handleMyProjectClick(project)}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-0">
                      <div className={`${project.color} h-48 flex items-center justify-center relative`}>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                          {project.description && (
                            <p className="text-sm text-gray-700 mt-1 opacity-80">{project.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{project.createdDate}</p>
                  </div>
                </div>
              ))}

              {/* Add New Project Card */}
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <div className="group cursor-pointer">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 border-dashed border-2 border-gray-300 hover:border-gray-400">
                      <CardContent className="p-0">
                        <div className="h-48 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="text-center">
                            <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Create new project</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Project Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter project name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of your project"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Room Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter room password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="color">Color Theme</Label>
                      <Select value={formData.color} onValueChange={(value) => handleInputChange("color", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center space-x-2">
                                <div className={`w-4 h-4 rounded-full ${color}`}></div>
                                <span className="capitalize">{color.replace("bg-", "").replace("-300", "")}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject} disabled={!formData.name.trim() || !formData.password.trim()}>
                      Create Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Empty State for My Projects */}
            {myProjects.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6">Create your first design project to get started</p>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Project
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shared-with-me">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sharedProjects.map((project) => (
                <div
                  key={project.id}
                  className="group cursor-pointer"
                  onClick={() => handleSharedProjectClick(project.id)}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <CardContent className="p-0">
                      <div className={`${project.color} h-48 flex items-center justify-center relative`}>
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                          {project.description && (
                            <p className="text-sm text-gray-700 mt-1 opacity-80">{project.description}</p>
                          )}
                        </div>
                        <div className="absolute top-2 right-2">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">{project.createdDate}</p>
                    <p className="text-xs text-gray-400 mt-1">Shared by {project.sharedBy}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State for Shared Projects */}
            {sharedProjects.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No shared projects</h3>
                <p className="text-gray-600">Projects shared with you will appear here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Join or Add Participants Dialog (My Projects) */}
      <Dialog open={joinDialog.isOpen} onOpenChange={(open) => setJoinDialog((prev) => ({ ...prev, isOpen: open }))}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join Room</DialogTitle>
            <DialogDescription>What would you like to do with "{joinDialog.projectName}"?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button onClick={handleJoinRoom} className="flex items-center justify-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Join Room</span>
            </Button>
            <Button
              onClick={handleAddParticipants}
              variant="outline"
              className="flex items-center justify-center space-x-2 bg-transparent"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Participants</span>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinDialog((prev) => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Verification Dialog (Shared Projects) */}
      <Dialog
        open={passwordDialog.isOpen}
        onOpenChange={(open) => setPasswordDialog((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Room Password</DialogTitle>
            <DialogDescription>This room is password protected. Please enter the password to join.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roomPassword">Password</Label>
              <Input
                id="roomPassword"
                type="password"
                placeholder="Enter room password"
                value={passwordDialog.enteredPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog((prev) => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit} disabled={!passwordDialog.enteredPassword.trim()}>
              Join Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Participant Dialog */}
      <Dialog
        open={participantDialog.isOpen}
        onOpenChange={(open) => setParticipantDialog((prev) => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
            <DialogDescription>
              Enter the email address of the person you want to invite to this project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="participantEmail">Email Address</Label>
              <Input
                id="participantEmail"
                type="email"
                placeholder="Enter email address"
                value={participantDialog.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddParticipant()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setParticipantDialog((prev) => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button onClick={handleAddParticipant} disabled={!participantDialog.email.trim()}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default page
