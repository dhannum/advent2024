/**
 * Example usage of the DFS implementation
 * These are just examples - you can delete this file if not needed
 */

import { dfsFindPath, dfsOptimize, dfsTraverse } from './dfs';

// Example 1: Simple graph traversal
interface GraphNode {
    id: string;
    neighbors: string[];
}

async function example1_GraphTraversal() {
    const graph: Record<string, GraphNode> = {
        'A': { id: 'A', neighbors: ['B', 'C'] },
        'B': { id: 'B', neighbors: ['D', 'E'] },
        'C': { id: 'C', neighbors: ['F'] },
        'D': { id: 'D', neighbors: [] },
        'E': { id: 'E', neighbors: [] },
        'F': { id: 'F', neighbors: [] },
    };
    
    const visited = await dfsTraverse('A', {
        getNeighbors: (node: string) => graph[node]?.neighbors || [],
        onVisit: (node) => {
            console.log(`Visited: ${node}`);
        }
    });
    
    console.log('All visited nodes:', visited);
}

// Example 2: Path finding in a grid
interface Point {
    x: number;
    y: number;
}

async function example2_GridPathfinding() {
    const grid = [
        [0, 0, 0, 0],
        [1, 1, 0, 1],
        [0, 0, 0, 0],
        [0, 1, 1, 0],
    ]; // 0 = walkable, 1 = wall
    
    const start: Point = { x: 0, y: 0 };
    const goal: Point = { x: 3, y: 3 };
    
    const path = await dfsFindPath(start, {
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
        getKey: (p: Point) => `${p.x},${p.y}`
    });
    
    console.log('Path found:', path);
}

// Example 3: Optimization with pruning
async function example3_OptimizationWithPruning() {
    // Find path with minimum cost
    // Nodes have costs, and we want the cheapest path
    
    interface CostNode {
        id: string;
        cost: number;
        neighbors: string[];
    }
    
    const graph: Record<string, CostNode> = {
        'A': { id: 'A', cost: 1, neighbors: ['B', 'C'] },
        'B': { id: 'B', cost: 5, neighbors: ['D'] },
        'C': { id: 'C', cost: 2, neighbors: ['D'] },
        'D': { id: 'D', cost: 1, neighbors: [] },
    };
    
    let bestCostSoFar = Infinity;
    
    const solution = await dfsOptimize('A', {
        getNeighbors: (node: string) => graph[node]?.neighbors || [],
        isGoal: (node: string) => node === 'D',
        getCost: (from: string, to: string, currentCost: number) => {
            return currentCost + (graph[to]?.cost || 0);
        },
        shouldPrune: (node: string, path: string[], depth: number, cost: number) => {
            // Prune if current cost is already worse than best found
            if (cost > bestCostSoFar) {
                return true; // Skip this path
            }
            return false;
        },
        isBetter: (a, b) => a.cost < b.cost, // Minimization
        getKey: (node: string) => node,
        onVisit: (node: string, path: string[], depth: number) => {
            // Update best cost when we find a goal
            if (node === 'D') {
                const totalCost = path.reduce((sum, n) => sum + (graph[n]?.cost || 0), 0);
                if (totalCost < bestCostSoFar) {
                    bestCostSoFar = totalCost;
                }
            }
        }
    });
    
    console.log('Best solution:', solution);
}

// Example 4: Backtracking problem (like N-Queens)
async function example4_Backtracking() {
    // Simplified: find a valid arrangement
    // In real N-Queens, you'd check for conflicts
    
    interface BoardState {
        queens: Array<{ row: number; col: number }>;
        size: number;
    }
    
    const size = 4;
    const start: BoardState = { queens: [], size };
    
    const solution = await dfsFindPath(start, {
        getNeighbors: (state: BoardState) => {
            if (state.queens.length >= state.size) {
                return []; // Board is full
            }
            
            const nextRow = state.queens.length;
            const neighbors: BoardState[] = [];
            
            // Try placing queen in each column of next row
            for (let col = 0; col < state.size; col++) {
                // Check if this position conflicts with existing queens
                const hasConflict = state.queens.some(q => 
                    q.col === col || 
                    Math.abs(q.row - nextRow) === Math.abs(q.col - col)
                );
                
                if (!hasConflict) {
                    neighbors.push({
                        queens: [...state.queens, { row: nextRow, col }],
                        size: state.size
                    });
                }
            }
            
            return neighbors;
        },
        isGoal: (state: BoardState) => state.queens.length === state.size,
        getKey: (state: BoardState) => 
            state.queens.map(q => `${q.row},${q.col}`).join(';')
    });
    
    if (solution) {
        console.log('Solution found:', solution[solution.length - 1]);
    } else {
        console.log('No solution found');
    }
}

// Uncomment to run examples:
// example1_GraphTraversal();
// example2_GridPathfinding();
// example3_OptimizationWithPruning();
// example4_Backtracking();
