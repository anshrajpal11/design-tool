"use client";

import React, { useState, useMemo } from "react";
import {
  UserPlus,
  Users,
  Settings,
  Share2,
  Download,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { useOthers, useSelf } from "@liveblocks/react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

// Participants are read from Liveblocks presence (useOthers/useSelf)

interface NavbarProps {
  roomName?: string;
}

const Navbar = ({ roomName = "Untitled Room" }: NavbarProps) => {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const others = useOthers();
  const self = useSelf();

  // combine self and others into a single participants array for rendering
  const participants = useMemo(() => {
    const base: any[] = [];
    if (self) base.push(self);
    if (others && others.length) base.push(...others);
    return base;
  }, [self, others]);

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return;

    alert(`Invitation sent to ${inviteEmail}`);
    setInviteEmail("");
    setIsInviteDialogOpen(false);
  };

  return (
    <TooltipProvider>
      <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-gray-900">CoDraw</h1>
          </div>

          <div className="hidden h-6 w-px bg-gray-300 md:block" />

          <div className="hidden md:block">
            <h2 className="text-sm font-medium text-gray-900">{roomName}</h2>
            <p className="text-xs text-gray-500"></p>
          </div>
        </div>

        <div className="ml-250 flex items-center space-x-2">
          <div className="flex items-center -space-x-2">
            {/* Render connected users from Liveblocks (self + others). Show up to 5 avatars, then a +N indicator */}
            {participants.slice(0, 5).map((person: any, idx) => {
              const info = person?.info ?? {};
              const displayName =
                info?.user?.name ?? info?.name ?? info?.email ?? "Anonymous";
              const email = info?.user?.email ?? info?.email ?? "";
              const color = info?.user?.color ?? info?.color ?? undefined;
              const initials = displayName
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

              const isOnline = true; // if connected they appear here

              return (
                <Tooltip key={String(person.connectionId ?? idx)}>
                  <TooltipTrigger>
                    <div className="relative">
                      <Avatar className="h-8 w-8 cursor-pointer border-2 border-white transition-transform hover:scale-110">
                        {/* If user provided an avatar url in info, show it */}
                        {info?.avatar ? (
                          <AvatarImage src={info.avatar} alt={displayName} />
                        ) : (
                          <AvatarFallback style={{ backgroundColor: color }}>
                            {initials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {isOnline && (
                        <div className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-medium">{displayName}</p>
                    {email && <p className="text-xs text-gray-500">{email}</p>}
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* +N indicator when more participants are present */}
            {participants.length > 5 && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                +{participants.length - 5}
              </div>
            )}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Invite Button */}
          <Dialog
            open={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 bg-transparent"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Invite</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Invite</DialogTitle>
                <DialogDescription></DialogDescription>
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
                        handleInviteUser();
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsInviteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteUser}
                  disabled={!inviteEmail.trim()}
                >
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </nav>
    </TooltipProvider>
  );
};

export default Navbar;
