from collections import deque

def bfs(grid: list[list[int]], start: tuple, end: tuple):
    """
    grid: 2D list, 0=empty, 1=obstacle
    start, end: (x, y)
    return: dict with 'steps' and 'path'
    """
    rows, cols = len(grid), len(grid[0])
    visited = [[False]*cols for _ in range(rows)]
    parent = [[None]*cols for _ in range(rows)]
    steps = []

    queue = deque()
    queue.append(start)
    visited[start[0]][start[1]] = True

    while queue:
        current = queue.popleft()
        x, y = current
        steps.append({"current": [x, y], "visited": [[i, j] for i in range(rows) for j in range(cols) if visited[i][j]]})

        if current == end:
            break

        for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:  # up, down, left, right
            nx, ny = x+dx, y+dy
            if 0 <= nx < rows and 0 <= ny < cols:
                if not visited[nx][ny] and grid[nx][ny] == 0:
                    visited[nx][ny] = True
                    parent[nx][ny] = (x, y)
                    queue.append((nx, ny))

    # Reconstruct path
    path = []
    cur = end
    while cur:
        path.append(list(cur))
        cur = parent[cur[0]][cur[1]]
    path.reverse()

    return {"steps": steps, "path": path}
