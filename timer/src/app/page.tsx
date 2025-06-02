"use client";
import { useState, useEffect, useRef, useContext } from "react";
import { ThemeContext } from "./theme-context";

export default function TimerPage() {
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [duration, setDuration] = useState(10);
  const [completedCount, setCompletedCount] = useState(0);
  const [quote, setQuote] = useState<{ q: string; a: string } | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Load name and completedCount from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("timer_name");
    if (savedName) {
      setInput(savedName);
      setName(savedName);
    }
    const savedCount = localStorage.getItem("timer_completed_count");
    if (savedCount) {
      setCompletedCount(Number(savedCount));
    }
  }, []);

  
  useEffect(() => {
    if (name) {
      localStorage.setItem("timer_name", name);
    }
  }, [name]);

  useEffect(() => {
    localStorage.setItem("timer_completed_count", String(completedCount));
  }, [completedCount]);

  useEffect(() => {
    if (started && !done) {
      setSeconds(0);
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= duration - 1) {
            clearInterval(intervalRef.current!);
            setDone(true);
            setCompletedCount((c) => c + 1);
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play();
            }
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [started, done, duration]);

  useEffect(() => {
    if (done) {
      setQuote(null);
      setQuoteLoading(true);
      fetch("https://zenquotes.io/api/random")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data[0]?.q && data[0]?.a) {
            setQuote({ q: data[0].q, a: data[0].a });
          } else {
            setQuote(null);
          }
        })
        .catch(() => setQuote(null))
        .finally(() => setQuoteLoading(false));
    }
  }, [done]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setName(input);
    setStarted(true);
    setDone(false);
  };

  const handleReset = () => {
    setName("");
    setInput("");
    setStarted(false);
    setDone(false);
    setSeconds(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCompletedCount(0);
    localStorage.removeItem("timer_name");
    localStorage.removeItem("timer_completed_count");
  };

  const handleTryAgain = () => {
    setStarted(false);
    setDone(false);
    setSeconds(0);
    setQuote(null);
    setQuoteLoading(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const progress = Math.min((seconds / duration) * 100, 100);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center transition-all duration-500 ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
      <button
        onClick={toggleTheme}
        className="absolute top-4 left-4 px-3 py-1 rounded border border-gray-300 bg-gray-100 dark:bg-gray-800 dark:text-white"
      >
        {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
      </button>
      <audio ref={audioRef} src="https://www.soundjay.com/buttons/sounds/button-3.mp3" preload="auto" />
      <div className="absolute top-4 right-4 text-sm text-gray-600">Завершено: {completedCount}</div>
      {!started && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
          <label className="text-lg font-medium">Введите имя:</label>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="border rounded px-3 py-2 text-lg"
            required
            autoFocus
          />
          <label className="text-lg font-medium">Выберите время таймера:</label>
          <select
            value={duration}
            onChange={e => setDuration(Number(e.target.value))}
            className="border rounded px-3 py-2 text-lg"
          >
            <option value={10}>10 секунд</option>
            <option value={20}>20 секунд</option>
            <option value={30}>30 секунд</option>
          </select>
          <button type="submit" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">Старт</button>
        </form>
      )}
      {started && !done && (
        <div className="flex flex-col items-center gap-4 w-80">
          <div className="text-2xl font-semibold">{name}, осталось {duration - seconds} сек</div>
          <div className="w-full h-4 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-1000"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <button onClick={handleReset} className="mt-2 bg-gray-200 text-black px-4 py-2 rounded hover:bg-gray-300 transition">Сброс</button>
        </div>
      )}
      {done && (
        <div className="flex flex-col items-center gap-4 animate-bounce">
          <div className="text-2xl font-bold text-green-600 mt-4">Ты справился, {name} 💪</div>
          {quoteLoading && (
            <div className="max-w-md text-center mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded shadow">
              <div className="italic text-lg">Загружаем цитату...</div>
            </div>
          )}
          {quote && !quoteLoading && (
            <div className="max-w-md text-center mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded shadow">
              <div className="italic text-lg">“{quote.q}”</div>
              <div className="mt-2 text-sm text-gray-700">— {quote.a}</div>
            </div>
          )}
          <button onClick={handleTryAgain} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Попробовать ещё раз</button>
        </div>
      )}
    </div>
  );
}
