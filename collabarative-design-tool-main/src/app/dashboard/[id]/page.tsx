import React from 'react'
import Canvas from '~/components/canvas/Canvas';
import Room from '~/components/liveblocks/Room';
import { auth } from '~/server/auth';

type ParamsType =Promise<{id:string}>;
 

const page = async ({params}:{params:ParamsType}) => {

  
  const {id} = await params;
  const session = await auth();

  


  return (
    <Room roomId={"room:"+id}>
      <Canvas/>
    </Room>

  )
}

export default page
