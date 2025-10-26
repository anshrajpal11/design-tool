"use server"

import { signUpSchema } from "~/schemas";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";
import { redirect } from "next/navigation";
import { signIn, signOut } from "~/server/auth";
import { ZodError } from "zod";
import { AuthError } from "next-auth";

export async function signout(){
  await signOut();
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials";
        default:
          return "Something went wrong";
      }
    }
    throw error;
  }
}





export async function register(
  prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const {email, password, name} = await signUpSchema.parseAsync({
    email:formData.get('email'),
    password:formData.get('password'),
    name:formData.get('name')
  });

  const user=await db.user.findUnique({where:{email}});
  if(user){
    return "user already exists"
  }

  const hash = await bcrypt.hash(password,10);

  await db.user.create({
    data:{
      email,
      password:hash,
      name
    }
  })

  redirect("/signin")

  try {
    
  } catch (error) {
    return "error"
  }


}

