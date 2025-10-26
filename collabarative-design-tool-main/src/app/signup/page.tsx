"use client"

import Link from 'next/link'
import React from 'react'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { register } from '~/actions/auth'
import { useActionState } from 'react'
import { VscLoading } from "react-icons/vsc";



const page = () => {
   const [errorMessage, formAction, isPending] = useActionState(
    register,
    undefined,
  );
  return (
     <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border rounded-2xl p-6 bg-card">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-semibold text-foreground">
            Create an Account
          </CardTitle>
          <p className="text-muted-foreground text-sm">CoDraw-Design with mind, build with hands ! </p>
        </CardHeader>

        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                className=""
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className=""
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder=""
                className=""
              />
            </div>


            <Button type="submit" className="w-full text-sm font-medium cursor-pointer" disabled={isPending}>
              Register {isPending && <span className='animate-spin'> <VscLoading/> </span>}  
            </Button>
    

            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/signin" className="underline text-primary">
                Sign in
              </Link>
            </p>

            

          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default page



