"use client";

import { useState } from "react";
import {
  Plus,
  LogOut,
  Users,
  UserPlus,
  Crown,
  Shield,
  User,
  MoreVertical,
  Trash2,
  Eye,
  Crown as CrownIcon,
  Import,
} from "lucide-react";
import { signout } from "~/actions/auth";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import Link from "next/link";

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
];

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
  ]);

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
  ]);


  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "aryan rudr",
      email: "aryan@example.com",
      avatar: "/avatars/john.jpg",
      role: "Owner",
      isOnline: true,
    },
    {
      id: 2,
      name: "Ansh",
      email: "ansh@company.com",
      avatar: "/avatars/sarah.jpg",
      role: "Admin",
      isOnline: true,
    },
    {
      id: 3,
      name: "Arsh Deep Bedi",
      email: "arsh@company.com",
      avatar: "/avatars/mike.jpg",
      role: "Member",
      isOnline: false,
    },
    {
      id: 4,
      name: "Mahajeen",
      email: "ayush@company.com",
      avatar: "/avatars/emily.jpg",
      role: "Member",
      isOnline: false,
    },
  ]);

  const [activeTab, setActiveTab] = useState("my-projects");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "bg-blue-300",
    password: "",
  });

  const [joinDialog, setJoinDialog] = useState({
    isOpen: false,
    projectId: null,
    projectName: "",
  });

  const [passwordDialog, setPasswordDialog] = useState({
    isOpen: false,
    projectId: null,
    enteredPassword: "",
  });

  const [participantDialog, setParticipantDialog] = useState({
    isOpen: false,
    projectId: null,
    email: "",
  });

  const [addMemberDialog, setAddMemberDialog] = useState({
    isOpen: false,
    name: "",
    email: "",
    role: "Member",
    avatar: null as File | null,
  });

  const [viewProfileDialog, setViewProfileDialog] = useState({
    isOpen: false,
    member: null as any,
  });

  
  const [teamSearchQuery, setTeamSearchQuery] = useState("");

 
  const filteredTeamMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(teamSearchQuery.toLowerCase()),
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateProject = () => {
    if (!formData.name.trim() || !formData.password.trim()) return;

    const newProject = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      createdDate: "Created Today",
      color: formData.color,
      password: formData.password,
      isOwner: true,
    };

    setMyProjects((prev) => [...prev, newProject]);

    // Reset form and close dialog
    setFormData({
      name: "",
      description: "",
      color: "bg-blue-300",
      password: "",
    });
    setIsCreateDialogOpen(false);
  };

  const handleMyProjectClick = (project: any) => {
    setJoinDialog({
      isOpen: true,
      projectId: project.id,
      projectName: project.name,
    });
  };

  const handleSharedProjectClick = (projectId: number) => {
    setPasswordDialog({
      isOpen: true,
      projectId,
      enteredPassword: "",
    });
  };

  const handleJoinRoom = () => {
    alert(`Joining ${joinDialog.projectName}...`);
    setJoinDialog({
      isOpen: false,
      projectId: null,
      projectName: "",
    });
  };

  const handleAddParticipants = () => {
    setJoinDialog({
      isOpen: false,
      projectId: null,
      projectName: "",
    });
    setParticipantDialog({
      isOpen: true,
      projectId: joinDialog.projectId,
      email: "",
    });
  };

  const handlePasswordSubmit = () => {
    const project = sharedProjects.find(
      (p) => p.id === passwordDialog.projectId,
    );
    if (project && project.password === passwordDialog.enteredPassword) {
      // Password correct - join the room
      alert(`Joining ${project.name}...`);
      setPasswordDialog({
        isOpen: false,
        projectId: null,
        enteredPassword: "",
      });
    } else {
      // Password incorrect
      alert("Incorrect password. Please try again.");
    }
  };

  const handleAddParticipant = () => {
    if (!participantDialog.email.trim()) return;

    alert(`Invitation sent to ${participantDialog.email}`);
    setParticipantDialog({
      isOpen: false,
      projectId: null,
      email: "",
    });
  };

  const handlePasswordChange = (value: string) => {
    setPasswordDialog((prev) => ({
      ...prev,
      enteredPassword: value,
    }));
  };

  const handleEmailChange = (value: string) => {
    setParticipantDialog((prev) => ({
      ...prev,
      email: value,
    }));
  };

  // Team management functions
  const handleAddMember = () => {
    if (!addMemberDialog.name.trim() || !addMemberDialog.email.trim()) return;

    const newMember = {
      id: Date.now(),
      name: addMemberDialog.name,
      email: addMemberDialog.email,
      avatar: addMemberDialog.avatar
        ? URL.createObjectURL(addMemberDialog.avatar)
        : null,
      role: addMemberDialog.role,
      isOnline: false,
    };

    setTeamMembers((prev) => [...prev, newMember]);

    // Reset form and close dialog
    setAddMemberDialog({
      isOpen: false,
      name: "",
      email: "",
      role: "Member",
      avatar: null,
    });
  };

  const handleRemoveMember = (memberId: number) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  const handlePromoteToAdmin = (memberId: number) => {
    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, role: "Admin" } : member,
      ),
    );
  };

  const handleViewProfile = (member: any) => {
    setViewProfileDialog({
      isOpen: true,
      member,
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Owner":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case "Admin":
        return <Shield className="h-4 w-4 text-blue-600" />;
      case "Member":
        return <User className="h-4 w-4 text-gray-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Owner":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Admin":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Member":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Design Workspace
                </h1>
                <p className="text-sm text-gray-600">
                  Manage your design projects
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => signout()}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-3">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared-with-me">Shared with Me</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myProjects.map((project) => (
                <div
                  key={project.id}
                  className="group cursor-pointer"
                  onClick={() => handleMyProjectClick(project)}
                >
                  <Card className="overflow-hidden transition-shadow duration-200 hover:shadow-lg">
                    <CardContent className="p-0">
                      <div
                        className={`${project.color} relative flex h-48 items-center justify-center`}
                      >
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="mt-1 text-sm text-gray-700 opacity-80">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-900">
                      {project.name}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {project.createdDate}
                    </p>
                  </div>
                </div>
              ))}

              {/* Add New Project Card */}
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <div className="group cursor-pointer">
                    <Card className="overflow-hidden border-2 border-dashed border-gray-300 transition-shadow duration-200 hover:border-gray-400 hover:shadow-lg">
                      <CardContent className="p-0">
                        <div className="flex h-48 items-center justify-center bg-gray-50 transition-colors hover:bg-gray-100">
                          <div className="text-center">
                            <Plus className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              Create new project
                            </p>
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
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">
                        Description (Optional)
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of your project"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
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
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="color">Color Theme</Label>
                      <Select
                        value={formData.color}
                        onValueChange={(value) =>
                          handleInputChange("color", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a color" />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map((color) => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`h-4 w-4 rounded-full ${color}`}
                                ></div>
                                <span className="capitalize">
                                  {color.replace("bg-", "").replace("-300", "")}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateProject}
                      disabled={
                        !formData.name.trim() || !formData.password.trim()
                      }
                    >
                      Create Project
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Empty State for My Projects */}
            {myProjects.length === 0 && (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Plus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  No projects yet
                </h3>
                <p className="mb-6 text-gray-600">
                  Create your first design project to get started
                </p>
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Create New Project
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            )}
          </TabsContent>

          <TabsContent value="shared-with-me">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sharedProjects.map((project) => (
                <div
                  key={project.id}
                  className="group cursor-pointer"
                  onClick={() => handleSharedProjectClick(project.id)}
                >
                  <Card className="overflow-hidden transition-shadow duration-200 hover:shadow-lg">
                    <CardContent className="p-0">
                      <div
                        className={`${project.color} relative flex h-48 items-center justify-center`}
                      >
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="mt-1 text-sm text-gray-700 opacity-80">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <div className="absolute top-2 right-2">
                          <Users className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="mt-3">
                    <h4 className="font-medium text-gray-900">
                      {project.name}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      {project.createdDate}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Shared by {project.sharedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State for Shared Projects */}
            {sharedProjects.length === 0 && (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  No shared projects
                </h3>
                <p className="text-gray-600">
                  Projects shared with you will appear here
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="team">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Team Management
              </h2>
              <p className="text-gray-600">
                Manage your team members and their roles • {teamMembers.length}{" "}
                member{teamMembers.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Search and Add Member Section */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-sm">
                <Input
                  placeholder="Search team members..."
                  className="pl-10"
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                />
                <Users className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <Dialog
                open={addMemberDialog.isOpen}
                onOpenChange={(open) =>
                  setAddMemberDialog((prev) => ({ ...prev, isOpen: open }))
                }
              >
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTeamMembers.map((member) => (
                <div key={member.id} className="group relative">
                  <Card className="overflow-visible rounded-2xl border-0 bg-white shadow-md transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
                    <CardContent className="p-0">
                      <div className="relative flex flex-col items-center justify-center px-4 pt-8 pb-4">
                        <div className="relative">
                          <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
                            <AvatarImage
                              src={member.avatar}
                              alt={member.name}
                            />
                            <AvatarFallback className="text-xl font-bold">
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <span
                            className={`absolute right-1 bottom-1 h-4 w-4 rounded-full border-2 border-white ${member.isOnline ? "bg-green-500" : "bg-gray-400"}`}
                          ></span>
                        </div>
                        
                        <h4 className="mt-4 text-center text-lg font-semibold text-gray-900">
                          {member.name}
                        </h4>
                        <p className="mt-1 text-center text-sm break-all text-gray-500">
                          {member.email}
                        </p>
                        {/* Role badge */}
                        <div className="mt-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${getRoleBadgeColor(member.role)}`}
                          >
                            {getRoleIcon(member.role)}
                            <span className="ml-1">{member.role}</span>
                          </span>
                        </div>
                        {/* Actions dropdown */}
                        <div className="absolute top-3 right-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 p-0 opacity-70 hover:opacity-100 focus:opacity-100"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewProfile(member)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              {member.role !== "Owner" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handlePromoteToAdmin(member.id)
                                    }
                                  >
                                    <CrownIcon className="mr-2 h-4 w-4" />
                                    Promote to Admin
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRemoveMember(member.id)
                                    }
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}

              
              <Dialog
                open={addMemberDialog.isOpen}
                onOpenChange={(open) =>
                  setAddMemberDialog((prev) => ({ ...prev, isOpen: open }))
                }
              >
                <DialogTrigger asChild>
                  <div className="group cursor-pointer">
                    <Card className="overflow-hidden border-2 border-dashed border-gray-300 transition-shadow duration-200 hover:border-gray-400 hover:shadow-lg">
                      <CardContent className="p-0">
                        <div className="flex h-48 items-center justify-center bg-gray-50 transition-colors hover:bg-gray-100">
                          <div className="text-center">
                            <UserPlus className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                            <p className="text-sm text-gray-600">
                              Add new member
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Member</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="addMemberName">Name</Label>
                      <Input
                        id="addMemberName"
                        placeholder="Enter member name"
                        value={addMemberDialog.name}
                        onChange={(e) =>
                          setAddMemberDialog((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="addMemberEmail">Email</Label>
                      <Input
                        id="addMemberEmail"
                        type="email"
                        placeholder="Enter member email"
                        value={addMemberDialog.email}
                        onChange={(e) =>
                          setAddMemberDialog((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="addMemberRole">Role</Label>
                      <Select
                        value={addMemberDialog.role}
                        onValueChange={(value) =>
                          setAddMemberDialog((prev) => ({
                            ...prev,
                            role: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Member">Member</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="addMemberAvatar">Avatar (Optional)</Label>
                      <div className="flex items-center space-x-4">
                        {addMemberDialog.avatar && (
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={URL.createObjectURL(addMemberDialog.avatar)}
                              alt="Preview"
                            />
                            <AvatarFallback>Preview</AvatarFallback>
                          </Avatar>
                        )}
                        <Input
                          id="addMemberAvatar"
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setAddMemberDialog((prev) => ({
                              ...prev,
                              avatar: e.target.files?.[0] || null,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setAddMemberDialog((prev) => ({
                          ...prev,
                          isOpen: false,
                        }))
                      }
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddMember}
                      disabled={
                        !addMemberDialog.name.trim() ||
                        !addMemberDialog.email.trim()
                      }
                    >
                      Add Member
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            
            {filteredTeamMembers.length === 0 && (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <UserPlus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  {teamSearchQuery
                    ? "No matching team members"
                    : "No team members yet"}
                </h3>
                <p className="mb-6 text-gray-600">
                  {teamSearchQuery
                    ? "Try adjusting your search terms"
                    : "Invite your team members to collaborate"}
                </p>
                {!teamSearchQuery && (
                  <Dialog
                    open={addMemberDialog.isOpen}
                    onOpenChange={(open) =>
                      setAddMemberDialog((prev) => ({ ...prev, isOpen: open }))
                    }
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add New Member
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      
      <Dialog
        open={joinDialog.isOpen}
        onOpenChange={(open) =>
          setJoinDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join Room</DialogTitle>
            <DialogDescription>
              What would you like to do with "{joinDialog.projectName}"?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Link
              href={'/dashboard/test'}
              className="flex items-center justify-center space-x-2 border p-2 rounded-sm hover:bg-[#C9CEDA]"
            >
              <Users className="h-4 w-4" />
              <span>Join Room</span>
            </Link>
            <Button
              onClick={handleAddParticipants}
              variant="outline"
              className="flex items-center justify-center space-x-2 bg-transparent"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Participants</span>
            </Button>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setJoinDialog((prev) => ({ ...prev, isOpen: false }))
              }
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Verification Dialog (Shared Projects) */}
      <Dialog
        open={passwordDialog.isOpen}
        onOpenChange={(open) =>
          setPasswordDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Room Password</DialogTitle>
            <DialogDescription>
              This room is password protected. Please enter the password to
              join.
            </DialogDescription>
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
                    handlePasswordSubmit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setPasswordDialog((prev) => ({ ...prev, isOpen: false }))
              }
            >
              Cancel
            </Button>
            <Link href={'/dashboard/test'}
            >
              Join Room
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Participant Dialog */}
      <Dialog
        open={participantDialog.isOpen}
        onOpenChange={(open) =>
          setParticipantDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Participant</DialogTitle>
            <DialogDescription>
              Enter the email address of the person you want to invite to this
              project.
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
                    handleAddParticipant();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setParticipantDialog((prev) => ({ ...prev, isOpen: false }))
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddParticipant}
              disabled={!participantDialog.email.trim()}
            >
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog
        open={viewProfileDialog.isOpen}
        onOpenChange={(open) =>
          setViewProfileDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>
              Details of {viewProfileDialog.member?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={viewProfileDialog.member?.avatar}
                  alt={viewProfileDialog.member?.name}
                />
                <AvatarFallback className="text-lg">
                  {viewProfileDialog.member?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {viewProfileDialog.member?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {viewProfileDialog.member?.email}
                </p>
                <div className="mt-2 flex items-center text-xs text-gray-400">
                  <span
                    className={`mr-1 ${viewProfileDialog.member?.isOnline ? "bg-green-500" : "bg-gray-500"} h-2 w-2 rounded-full`}
                  ></span>
                  {viewProfileDialog.member?.isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <div
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(viewProfileDialog.member?.role || "")}`}
              >
                {getRoleIcon(viewProfileDialog.member?.role || "")}
                {viewProfileDialog.member?.role}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                setViewProfileDialog((prev) => ({ ...prev, isOpen: false }))
              }
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default page;
