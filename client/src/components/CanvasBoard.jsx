import { useRef, useEffect, useState, useCallback } from 'react';

const CanvasBoard = ({ 
  tool, 
  color, 
  brushSize, 
  onDraw,
  onCursorMove,
  isDrawing,
  setIsDrawing,
  strokes,
  setStrokes,
  currentStroke,
  setCurrentStroke
}) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const containerRef = useRef(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      contextRef.current = ctx;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getCoordinates = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  const startDrawing = useCallback((e) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    
    setIsDrawing(true);
    setCurrentStroke([{ x, y, color, brushSize, tool }]);

    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
  }, [color, brushSize, tool, getCoordinates, setIsDrawing, setCurrentStroke]);

  const draw = useCallback((e) => {
    e.preventDefault();
    if (!isDrawing) {
      // Track cursor movement even when not drawing
      if (onCursorMove) {
        const { x, y } = getCoordinates(e);
        onCursorMove(x, y);
      }
      return;
    }

    const { x, y } = getCoordinates(e);
    const ctx = contextRef.current;
    
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#0f172a' : color;
    ctx.lineTo(x, y);
    ctx.stroke();

    setCurrentStroke(prev => [...prev, { x, y, color, brushSize, tool }]);
  }, [isDrawing, color, brushSize, tool, getCoordinates, onCursorMove, setCurrentStroke]);

  const stopDrawing = useCallback(() => {
    if (isDrawing && currentStroke.length > 0) {
      setIsDrawing(false);
      const newStroke = { points: currentStroke };
      setStrokes(prev => [...prev, newStroke]);
      setUndoStack(prev => [...prev, strokes.length]);
      setRedoStack([]);

      // Send drawing data to server
      const canvas = canvasRef.current;
      if (onDraw) {
        onDraw({
          canvasData: canvas.toDataURL(),
          stroke: newStroke
        });
      }
    }
  }, [isDrawing, currentStroke, strokes.length, setIsDrawing, setStrokes, setUndoStack, setRedoStack, onDraw]);

  // Handle remote drawing
  useEffect(() => {
    if (!contextRef.current) return;
    
    // Redraw all strokes when strokes change from remote
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    
    const redrawCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      strokes.forEach(stroke => {
        if (stroke.points && stroke.points.length > 0) {
          ctx.beginPath();
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          
          stroke.points.forEach((point, i) => {
            if (i > 0) {
              ctx.lineWidth = point.brushSize;
              ctx.strokeStyle = point.tool === 'eraser' ? '#0f172a' : point.color;
              ctx.lineTo(point.x, point.y);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(point.x, point.y);
            }
          });
        }
      });
    };

    redrawCanvas();
  }, [strokes]);

  const undo = useCallback(() => {
    if (strokes.length === 0) return;
    
    const lastStroke = strokes[strokes.length - 1];
    setRedoStack(prev => [...prev, lastStroke]);
    const newStrokes = strokes.slice(0, -1);
    setStrokes(newStrokes);

    // Redraw
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [strokes, setStrokes]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    
    const nextStroke = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    setStrokes(prev => [...prev, nextStroke]);
  }, [redoStack, setStrokes]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (strokes.length > 0) {
      setUndoStack(prev => [...prev, strokes.length]);
    }
    setStrokes([]);
    setRedoStack([]);
  }, [strokes.length, setStrokes, setRedoStack]);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `collabboard-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  // Expose functions to parent
  useEffect(() => {
    window.canvasActions = {
      undo,
      redo,
      clearCanvas,
      downloadCanvas,
      getCanvasData: () => canvasRef.current?.toDataURL(),
      loadCanvasData: (dataUrl) => {
        const img = new Image();
        img.onload = () => {
          const ctx = contextRef.current;
          ctx.drawImage(img, 0, 0);
        };
        img.src = dataUrl;
      }
    };
  }, [undo, redo, clearCanvas, downloadCanvas]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-dark-900">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="absolute inset-0 cursor-crosshair touch-none"
      />
    </div>
  );
};

export default CanvasBoard;
