import React, { useState } from "react";

const GRID_SIZE = 15;

type Cell = 0 | 1 | 2 | 3 | 4;
// 0 = 空白, 1 = 障碍, 2 = 起点, 3 = 终点, 4 = 已访问

const App: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>(
    Array(GRID_SIZE)
      .fill(0)
      .map(() => Array(GRID_SIZE).fill(0))
  );
  const [start, setStart] = useState<[number, number] | null>(null);
  const [end, setEnd] = useState<[number, number] | null>(null);
  const [running, setRunning] = useState(false);

  const handleCellClick = (r: number, c: number) => {
    if (running) return;

    if (!start) {
      setStart([r, c]);
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row]);
        newGrid[r][c] = 2;
        return newGrid;
      });
    } else if (!end && grid[r][c] === 0) {
      setEnd([r, c]);
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row]);
        newGrid[r][c] = 3;
        return newGrid;
      });
    } else if (grid[r][c] === 0) {
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row]);
        newGrid[r][c] = 1;
        return newGrid;
      });
    } else if (grid[r][c] === 1) {
      setGrid((prev) => {
        const newGrid = prev.map((row) => [...row]);
        newGrid[r][c] = 0;
        return newGrid;
      });
    }
  };

  const resetGrid = () => {
    setGrid(Array(GRID_SIZE).fill(0).map(() => Array(GRID_SIZE).fill(0)));
    setStart(null);
    setEnd(null);
  };

  const startBFS = async () => {
    if (!start || !end) {
      alert("请先设置起点和终点！");
      return;
    }

    setRunning(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grid: grid.map(row => row.map(v => (v === 1 ? 1 : 0))),
          start: start,
          end: end,
        }),
      });

      if (!response.ok) throw new Error("后端请求失败");
      const data = await response.json();

      // 动画显示搜索过程
      const steps = data.steps;
      for (let i = 0; i < steps.length; i++) {
        await new Promise((res) => setTimeout(res, 50));
        const { current } = steps[i];
        setGrid((prev) => {
          const newGrid = prev.map((row) => [...row]);
          const [r, c] = current;
          if (newGrid[r][c] === 0) newGrid[r][c] = 4; // visited
          return newGrid;
        });
      }

      // 高亮最终路径
      const path = data.path;
      for (let i = 0; i < path.length; i++) {
        await new Promise((res) => setTimeout(res, 80));
        const [r, c] = path[i];
        setGrid((prev) => {
          const newGrid = prev.map((row) => [...row]);
          if (newGrid[r][c] !== 2 && newGrid[r][c] !== 3)
            newGrid[r][c] = 4;
          return newGrid;
        });
      }
    } catch (err) {
      console.error(err);
      alert("后端连接错误，请确认 FastAPI 正在运行。");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-700">
        🧭 BFS Path Visualizer
      </h1>

      <div className="flex gap-4 mb-4">
        <button
          onClick={startBFS}
          disabled={running}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          开始 BFS
        </button>
        <button
          onClick={resetGrid}
          disabled={running}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
        >
          重置
        </button>
      </div>

      <div className="grid grid-cols-15 gap-0.5 border border-gray-300 bg-white">
        {grid.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              onClick={() => handleCellClick(rIdx, cIdx)}
              className={`w-8 h-8 border border-gray-200 
              ${cell === 0 ? "bg-white" : ""}
              ${cell === 1 ? "bg-gray-800" : ""}
              ${cell === 2 ? "bg-green-500" : ""}
              ${cell === 3 ? "bg-red-500" : ""}
              ${cell === 4 ? "bg-blue-400" : ""}
              cursor-pointer`}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default App;
