/**
 * Example usage of the A* implementation
 * These are just examples - you can delete this file if not needed
 */

import { astar, weightedAstar } from './astar';

// Example 1: Grid pathfinding with Manhattan distance
interface Point {
    x: number;
    y: number;
}

async function example1_GridPathfinding() {
    const grid = [
        [0, 0, 0, 0, 0],
        [1, 1, 0, 1, 0],
        [0, 0, 0, 0, 0],
        [0, 1, 1, 1, 0],
        [0, 0, 0, 0, 0],
    ]; // 0 = walkable, 1 = wall
    
    const start: Point = { x: 0, y: 0 };
    const goal: Point = { x: 4, y: 4 };
    
    const result = await astar(start, {
        getNeighbors: (p: Point) => {
            const neighbors: Point[] = [];
            const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            
            for (const [dx, dy] of directions) {
                const nx = p.x + dx;
                const ny = p.y + dy;
                
                if (nx >= 0 && nx < grid[0].length && 
                    ny >= 0 && ny < grid.length && 
                    grid[ny][nx] === 0) {
                    neighbors.push({ x: nx, y: ny });
                }
            }
            
            return neighbors;
        },
        isGoal: (p: Point) => p.x === goal.x && p.y === goal.y,
        heuristic: (p: Point) => {
            // Manhattan distance (admissible for grid with 4-directional movement)
            return Math.abs(p.x - goal.x) + Math.abs(p.y - goal.y);
        },
        getCost: (from: Point, to: Point) => {
            // All moves cost 1 in this grid
            return 1;
        },
        getKey: (p: Point) => `${p.x},${p.y}`
    });
    
    if (result) {
        console.log('Path found:', result.path);
        console.log('Path length:', result.cost);
    } else {
        console.log('No path found');
    }
}

// Example 2: Grid with different terrain costs
async function example2_TerrainCosts() {
    // 0 = road (cost 1), 1 = grass (cost 2), 2 = mountain (cost 5), 3 = wall (impassable)
    const grid = [
        [0, 0, 1, 1, 0],
        [0, 1, 2, 1, 0],
        [0, 0, 1, 0, 0],
        [3, 3, 0, 0, 0],
        [0, 0, 0, 0, 0],
    ];
    
    const start: Point = { x: 0, y: 0 };
    const goal: Point = { x: 4, y: 4 };
    
    const terrainCosts: Record<number, number> = {
        0: 1, // road
        1: 2, // grass
        2: 5, // mountain
    };
    
    const result = await astar(start, {
        getNeighbors: (p: Point) => {
            const neighbors: Point[] = [];
            const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            
            for (const [dx, dy] of directions) {
                const nx = p.x + dx;
                const ny = p.y + dy;
                
                if (nx >= 0 && nx < grid[0].length && 
                    ny >= 0 && ny < grid.length && 
                    grid[ny][nx] !== 3) { // Not a wall
                    neighbors.push({ x: nx, y: ny });
                }
            }
            
            return neighbors;
        },
        isGoal: (p: Point) => p.x === goal.x && p.y === goal.y,
        heuristic: (p: Point) => {
            // Manhattan distance (still admissible, but could use Euclidean for diagonal movement)
            return Math.abs(p.x - goal.x) + Math.abs(p.y - goal.y);
        },
        getCost: (from: Point, to: Point) => {
            const terrain = grid[to.y][to.x];
            return terrainCosts[terrain] || Infinity;
        },
        getKey: (p: Point) => `${p.x},${p.y}`
    });
    
    if (result) {
        console.log('Optimal path found:', result.path);
        console.log('Total cost:', result.cost);
    }
}

// Example 3: Weighted A* for faster (but potentially suboptimal) search
async function example3_WeightedAstar() {
    const grid = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0],
    ];
    
    const start: Point = { x: 0, y: 0 };
    const goal: Point = { x: 6, y: 4 };
    
    // Weighted A* with weight 2.0 - explores fewer nodes but may not be optimal
    const result = await weightedAstar(start, {
        getNeighbors: (p: Point) => {
            const neighbors: Point[] = [];
            const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            
            for (const [dx, dy] of directions) {
                const nx = p.x + dx;
                const ny = p.y + dy;
                
                if (nx >= 0 && nx < grid[0].length && 
                    ny >= 0 && ny < grid.length && 
                    grid[ny][nx] === 0) {
                    neighbors.push({ x: nx, y: ny });
                }
            }
            
            return neighbors;
        },
        isGoal: (p: Point) => p.x === goal.x && p.y === goal.y,
        heuristic: (p: Point) => Math.abs(p.x - goal.x) + Math.abs(p.y - goal.y),
        getCost: () => 1,
        getKey: (p: Point) => `${p.x},${p.y}`,
        weight: 2.0 // More greedy - faster but may not be optimal
    });
    
    if (result) {
        console.log('Path found (may be suboptimal):', result.path);
        console.log('Path cost:', result.cost);
    }
}

// Example 4: Puzzle solving with A*
interface PuzzleState {
    board: number[][];
    emptyRow: number;
    emptyCol: number;
}

async function example4_PuzzleSolving() {
    // Simplified 8-puzzle example
    // In a real implementation, you'd have a proper puzzle state
    
    const start: PuzzleState = {
        board: [[1, 2, 3], [4, 0, 5], [6, 7, 8]],
        emptyRow: 1,
        emptyCol: 1
    };
    
    const goal: PuzzleState = {
        board: [[1, 2, 3], [4, 5, 6], [7, 8, 0]],
        emptyRow: 2,
        emptyCol: 2
    };
    
    const result = await astar(start, {
        getNeighbors: (state: PuzzleState) => {
            const neighbors: PuzzleState[] = [];
            const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
            
            for (const [dr, dc] of directions) {
                const newRow = state.emptyRow + dr;
                const newCol = state.emptyCol + dc;
                
                if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
                    // Create new state by swapping
                    const newBoard = state.board.map(row => [...row]);
                    newBoard[state.emptyRow][state.emptyCol] = newBoard[newRow][newCol];
                    newBoard[newRow][newCol] = 0;
                    
                    neighbors.push({
                        board: newBoard,
                        emptyRow: newRow,
                        emptyCol: newCol
                    });
                }
            }
            
            return neighbors;
        },
        isGoal: (state: PuzzleState) => {
            // Check if board matches goal
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    if (state.board[r][c] !== goal.board[r][c]) {
                        return false;
                    }
                }
            }
            return true;
        },
        heuristic: (state: PuzzleState) => {
            // Manhattan distance heuristic for 8-puzzle
            let distance = 0;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const value = state.board[r][c];
                    if (value !== 0) {
                        // Find where this value should be
                        const goalRow = Math.floor((value - 1) / 3);
                        const goalCol = (value - 1) % 3;
                        distance += Math.abs(r - goalRow) + Math.abs(c - goalCol);
                    }
                }
            }
            return distance;
        },
        getCost: () => 1, // Each move costs 1
        getKey: (state: PuzzleState) => 
            state.board.map(row => row.join(',')).join(';')
    });
    
    if (result) {
        console.log('Solution found in', result.cost, 'moves');
        console.log('Path length:', result.path.length);
    }
}

// Example 5: Graph pathfinding with custom costs
async function example5_GraphPathfinding() {
    interface GraphNode {
        id: string;
        x: number;
        y: number;
        neighbors: Array<{ id: string; cost: number }>;
    }
    
    const graph: Record<string, GraphNode> = {
        'A': { id: 'A', x: 0, y: 0, neighbors: [{ id: 'B', cost: 4 }, { id: 'C', cost: 2 }] },
        'B': { id: 'B', x: 2, y: 0, neighbors: [{ id: 'D', cost: 5 }] },
        'C': { id: 'C', x: 1, y: 1, neighbors: [{ id: 'D', cost: 1 }, { id: 'E', cost: 3 }] },
        'D': { id: 'D', x: 3, y: 1, neighbors: [{ id: 'F', cost: 2 }] },
        'E': { id: 'E', x: 2, y: 2, neighbors: [{ id: 'F', cost: 1 }] },
        'F': { id: 'F', x: 4, y: 2, neighbors: [] },
    };
    
    const start = 'A';
    const goal = 'F';
    const goalNode = graph[goal];
    
    const result = await astar(start, {
        getNeighbors: (nodeId: string) => {
            return graph[nodeId]?.neighbors.map(n => n.id) || [];
        },
        isGoal: (nodeId: string) => nodeId === goal,
        heuristic: (nodeId: string) => {
            const node = graph[nodeId];
            // Euclidean distance to goal (admissible)
            const dx = node.x - goalNode.x;
            const dy = node.y - goalNode.y;
            return Math.sqrt(dx * dx + dy * dy);
        },
        getCost: (from: string, to: string) => {
            const fromNode = graph[from];
            const edge = fromNode.neighbors.find(n => n.id === to);
            return edge?.cost || Infinity;
        },
        getKey: (nodeId: string) => nodeId
    });
    
    if (result) {
        console.log('Optimal path:', result.path);
        console.log('Total cost:', result.cost);
    }
}

// Uncomment to run examples:
// example1_GridPathfinding();
// example2_TerrainCosts();
// example3_WeightedAstar();
// example4_PuzzleSolving();
// example5_GraphPathfinding();
