import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-primary" data-testid="text-title">
            OnlineMid Portal
          </h1>
          <p className="text-xl text-muted-foreground" data-testid="text-subtitle">
            Bienvenido a tu proyecto React + Vite
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg" data-testid="text-counter-label">
              Contador: {count}
            </p>
            <Button 
              onClick={() => setCount(count + 1)}
              data-testid="button-counter"
              className="px-6 py-3 text-lg"
            >
              Incrementar
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-2" data-testid="text-instructions">
            <p>Este es tu template básico de React + Vite.</p>
            <p>Puedes empezar a construir tu aplicación desde aquí.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
