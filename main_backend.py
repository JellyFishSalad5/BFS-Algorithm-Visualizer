from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Tuple
from algorithm_bfs import bfs
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# 输入数据模型
class GridRequest(BaseModel):
    grid: List[List[int]]  # 0=空, 1=障碍
    start: Tuple[int,int]
    end: Tuple[int,int]

@app.post("/solve")
def solve_path(req: GridRequest):
    result = bfs(req.grid, req.start, req.end)
    return result

# 测试启动：
# uvicorn main:app --reload
