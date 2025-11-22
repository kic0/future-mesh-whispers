
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getTodayCount } from "@/utils/db";
import { Link, useNavigate } from "react-router-dom";

const ThankYou = () => {
  const [count, setCount] = useState<number>(0);
  const [startPath, setStartPath] = useState<string>("/");
  const navigate = useNavigate();

  useEffect(() => {
    const storedPath = sessionStorage.getItem("station_start_path");
    if (storedPath) {
      setStartPath(storedPath);
    }
    getTodayCount().then(setCount);
  }, []);

  useEffect(() => {
    const storedPath = sessionStorage.getItem("station_start_path") || "/";
    const timer = setTimeout(() => {
      navigate(storedPath);
    }, 10000); // 10-second timeout

    return () => clearTimeout(timer); // Cleanup the timer
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4 md:px-6 pt-44 md:pt-52 lg:pt-56">
      <main className="container max-w-lg space-y-6 md:space-y-8">
        <h1 className="text-3xl md:text-4xl font-display leading-tight">Obrigado por partilhares a tua visão!</h1>
        <p className="text-base md:text-lg text-muted-foreground">A tua participação foi registada.</p>
        <p className="text-sm md:text-base">Participante nº {count} do dia</p>
        <Button variant="hero" size="lg" asChild className="w-full md:w-auto">
          <Link to={startPath}>Voltar ao início</Link>
        </Button>
      </main>
    </div>
  );
};

export default ThankYou;
