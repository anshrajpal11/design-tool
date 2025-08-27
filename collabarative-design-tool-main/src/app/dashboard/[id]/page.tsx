import React from 'react'
import Canvas from '~/components/canvas/Canvas';
import Room from '~/components/liveblocks/Room';
import { auth } from '~/server/auth';

type ParamsType =Promise<{id:string}>;
 

const page = async ({params}:{params:ParamsType}) => {

  // id of the room
  const {id} = await params;
  const session = await auth();

  // id of the user - so we will check if the user have the access to the room
  // session?.user.id


  return (
    <Room roomId={"room:"+id}>
      <Canvas/>
    </Room>

  )
}

export default page
