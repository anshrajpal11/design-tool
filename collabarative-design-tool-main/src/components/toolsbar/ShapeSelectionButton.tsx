import { useEffect, useRef, useState } from "react";
import { LayerType, CanvasMode, type CanvasState } from "~/types";
import IconButton from "./IconButton";
import { BiPointer } from "react-icons/bi";
import { RiHand } from "react-icons/ri";
import { IoEllipseOutline, IoSquareOutline } from "react-icons/io5";

export default function ShapesSelectionButton({
  isActive,
  canvasState,
  onClick,
}: {
  isActive: boolean;
  canvasState: CanvasState;
  onClick: (layerType:LayerType.Rectangle| LayerType.Ellipse) => void;
}){
  const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
  
  
    useEffect(()=>{
      const handleClickOutside=(event:MouseEvent)=>{
        if(menuRef.current && !menuRef.current.contains(event.target as Node)){
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown",handleClickOutside);
      return ()=>document.removeEventListener("mousedown",handleClickOutside);
    },[])
  
  
    const handleClick = (layerType:LayerType.Rectangle| LayerType.Ellipse) => {
      onClick(layerType);
      setIsOpen(false);
    };
    
    return (
        <div className="relative flex" ref={menuRef}>
          <IconButton isActive={isActive} onClick={() => onClick(LayerType.Rectangle)}>
            {canvasState.mode!==CanvasMode.Inserting && <IoSquareOutline className="h-5 w-5"/> }
            {canvasState.mode===CanvasMode.Inserting && canvasState.layerType===LayerType.Ellipse && <IoEllipseOutline className="h-5 w-5"/> }
            {canvasState.mode===CanvasMode.Inserting && (canvasState.layerType===LayerType.Rectangle || canvasState.layerType===LayerType.Text  ) && <IoSquareOutline className="h-5 w-5"/> }
            
          </IconButton>
    
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="ml-1 rotate-270 text-black"
          >
            <svg width="15" height="15" viewBox="0 0 8 8" fill="none">
              <path
                d="M3.646 6.354l-.353-.354L5.293 4 3.293 2l.353-.354L6.707 4l-3.061 2.354z"
                fill="currentColor"
              />
            </svg>
          </button>
    
          {isOpen && (
          <div className="absolute -top-20 mt-1 min-w-[150px] rounded-xl bg-[#1e1e1e] p-2 shadow-lg">
              <button
                className={`flex w-full items-center rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType===LayerType.Rectangle ? "bg-blue-500" : ""}`}
                onClick={() => handleClick(LayerType.Rectangle)}
              >
                <span className="w-5 text-xs">
                  {(canvasState.mode === CanvasMode.Inserting) && canvasState.layerType===LayerType.Rectangle && "✓"}
                </span>
                <IoSquareOutline className="mr-2 h-4 w-4" />
                <span className="text-xs">Rectangle</span>
              </button>
              <button
                className={`flex w-full items-center rounded-md p-1 text-white hover:bg-blue-500 ${canvasState.mode === CanvasMode.Inserting && canvasState.layerType===LayerType.Ellipse ? "bg-blue-500" : ""}`}
                onClick={() => handleClick(LayerType.Ellipse)}
              >
                <span className="w-5 text-xs">
                  {canvasState.mode === CanvasMode.Inserting && canvasState.layerType===LayerType.Ellipse && "✓"}
                </span>
                <IoEllipseOutline className="mr-2 h-4 w-4" />
                <span className="text-xs">Ellipse</span>
              </button>
            </div>
          )} 
        </div>
      );
   

}