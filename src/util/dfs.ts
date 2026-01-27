/**
 * Generic Depth-First Search (DFS) Implementation
 * 
 * DFS explores as far as possible along each branch before backtracking.
 * This implementation supports:
 * - Basic graph traversal
 * - Path finding
 * - Optimization problems with pruning
 * - Early termination
 * 
 * Note: For pathfinding with optimal solutions, consider A* instead.
 * DFS is better for:
 * - Exhaustive search (finding all solutions)
 * - Backtracking problems
 * - Tree/graph traversal
 * - Problems where you need to explore the entire space
 */

export interface DFSNode<T> {
    state: T;
    path?: T[]; // Optional: track the path to this node
    depth?: number; // Optional: track depth
    cost?: number; // Optional: track cost to reach this node
}

export interface DFSOptions<T> {
    /**
     * Get neighbors of a node
     */
    getNeighbors: (node: T) => T[] | Promise<T[]>;
    
    /**
     * Check if a node is a goal/target state
     */
    isGoal?: (node: T) => boolean;
    
    /**
     * Check if we should prune this path (for optimization)
     * Return true to prune (skip), false to continue
     */
    shouldPrune?: (node: T, path: T[], depth: number, cost: number) => boolean;
    
    /**
     * Visit callback - called when a node is visited
     * Return false to stop searching
     */
    onVisit?: (node: T, path: T[], depth: number) => boolean | void;
    
    /**
     * Track visited nodes to avoid cycles
     */
    trackVisited?: boolean;
    
    /**
     * Custom key function for visited tracking (default: JSON.stringify)
     */
    getKey?: (node: T) => string;
    
    /**
     * Maximum depth to search (optional)
     */
    maxDepth?: number;
    
    /**
     * Calculate cost to reach a node (for optimization problems)
     */
    getCost?: (from: T, to: T, currentCost: number) => number;
    
    /**
     * Initial cost (default: 0)
     */
    initialCost?: number;
}

/**
 * Basic DFS traversal - finds all reachable nodes
 */
export async function dfsTraverse<T>(
    start: T,
    options: DFSOptions<T>
): Promise<T[]> {
    const visited = new Set<string>();
    const result: T[] = [];
    const getKey = options.getKey || ((node: T) => JSON.stringify(node));
    
    const stack: Array<{ node: T; depth: number }> = [{ node: start, depth: 0 }];
    
    if (options.trackVisited !== false) {
        visited.add(getKey(start));
    }
    
    while (stack.length > 0) {
        const { node, depth } = stack.pop()!;
        
        if (options.maxDepth !== undefined && depth > options.maxDepth) {
            continue;
        }
        
        result.push(node);
        
        if (options.onVisit) {
            const shouldContinue = options.onVisit(node, [], depth);
            if (shouldContinue === false) {
                break;
            }
        }
        
        const neighbors = await options.getNeighbors(node);
        
        for (const neighbor of neighbors) {
            const key = getKey(neighbor);
            
            if (options.trackVisited !== false && visited.has(key)) {
                continue;
            }
            
            if (options.trackVisited !== false) {
                visited.add(key);
            }
            
            stack.push({ node: neighbor, depth: depth + 1 });
        }
    }
    
    return result;
}

/**
 * DFS path finding - finds a path from start to goal
 */
export async function dfsFindPath<T>(
    start: T,
    options: DFSOptions<T>
): Promise<T[] | null> {
    if (!options.isGoal) {
        throw new Error('isGoal is required for path finding');
    }
    
    const visited = new Set<string>();
    const getKey = options.getKey || ((node: T) => JSON.stringify(node));
    
    const stack: Array<{ node: T; path: T[]; depth: number; cost: number }> = [
        { 
            node: start, 
            path: [start], 
            depth: 0, 
            cost: options.initialCost || 0 
        }
    ];
    
    if (options.trackVisited !== false) {
        visited.add(getKey(start));
    }
    
    while (stack.length > 0) {
        const { node, path, depth, cost } = stack.pop()!;
        
        if (options.maxDepth !== undefined && depth > options.maxDepth) {
            continue;
        }
        
        if (options.shouldPrune && options.shouldPrune(node, path, depth, cost)) {
            continue;
        }
        
        if (options.isGoal(node)) {
            return path;
        }
        
        if (options.onVisit) {
            const shouldContinue = options.onVisit(node, path, depth);
            if (shouldContinue === false) {
                break;
            }
        }
        
        const neighbors = await options.getNeighbors(node);
        
        // Reverse neighbors so we explore in the original order
        // (stack is LIFO, so we reverse to maintain order)
        for (let i = neighbors.length - 1; i >= 0; i--) {
            const neighbor = neighbors[i];
            const key = getKey(neighbor);
            
            if (options.trackVisited !== false && visited.has(key)) {
                continue;
            }
            
            if (options.trackVisited !== false) {
                visited.add(key);
            }
            
            const newCost = options.getCost 
                ? options.getCost(node, neighbor, cost)
                : cost;
            
            stack.push({
                node: neighbor,
                path: [...path, neighbor],
                depth: depth + 1,
                cost: newCost
            });
        }
    }
    
    return null;
}

/**
 * DFS with backtracking for optimization problems
 * Finds the best solution according to a comparison function
 */
export async function dfsOptimize<T>(
    start: T,
    options: DFSOptions<T> & {
        /**
         * Compare two solutions. Return true if 'a' is better than 'b'
         * For minimization: return a.cost < b.cost
         * For maximization: return a.cost > b.cost
         */
        isBetter?: (a: { path: T[]; cost: number }, b: { path: T[]; cost: number }) => boolean;
    }
): Promise<{ path: T[]; cost: number } | null> {
    const visited = new Set<string>();
    const getKey = options.getKey || ((node: T) => JSON.stringify(node));
    
    let bestSolution: { path: T[]; cost: number } | null = null;
    const isBetter = options.isBetter || ((a, b) => a.cost < b.cost);
    
    const stack: Array<{ node: T; path: T[]; depth: number; cost: number }> = [
        { 
            node: start, 
            path: [start], 
            depth: 0, 
            cost: options.initialCost || 0 
        }
    ];
    
    if (options.trackVisited !== false) {
        visited.add(getKey(start));
    }
    
    while (stack.length > 0) {
        const { node, path, depth, cost } = stack.pop()!;
        
        if (options.maxDepth !== undefined && depth > options.maxDepth) {
            continue;
        }
        
        // Pruning: if we have a best solution and current path is worse, skip
        if (options.shouldPrune && options.shouldPrune(node, path, depth, cost)) {
            continue;
        }
        
        // Additional pruning: if we have a best solution and current cost is worse
        if (bestSolution && options.getCost) {
            const currentSolution = { path, cost };
            if (!isBetter(currentSolution, bestSolution)) {
                // Current path is not better, but we might still explore if pruning allows
                // This is a simple check - more sophisticated pruning can be done in shouldPrune
            }
        }
        
        // Check if this is a goal state
        if (options.isGoal && options.isGoal(node)) {
            const solution = { path, cost };
            if (!bestSolution || isBetter(solution, bestSolution)) {
                bestSolution = solution;
            }
            // Continue searching for potentially better solutions
            continue;
        }
        
        if (options.onVisit) {
            const shouldContinue = options.onVisit(node, path, depth);
            if (shouldContinue === false) {
                break;
            }
        }
        
        const neighbors = await options.getNeighbors(node);
        
        // Reverse neighbors so we explore in the original order
        for (let i = neighbors.length - 1; i >= 0; i--) {
            const neighbor = neighbors[i];
            const key = getKey(neighbor);
            
            if (options.trackVisited !== false && visited.has(key)) {
                continue;
            }
            
            if (options.trackVisited !== false) {
                visited.add(key);
            }
            
            const newCost = options.getCost 
                ? options.getCost(node, neighbor, cost)
                : cost;
            
            stack.push({
                node: neighbor,
                path: [...path, neighbor],
                depth: depth + 1,
                cost: newCost
            });
        }
    }
    
    return bestSolution;
}

/**
 * Recursive DFS implementation (alternative to iterative)
 * Useful for problems where you want more control over the recursion
 */
export async function dfsRecursive<T>(
    node: T,
    options: DFSOptions<T> & {
        path?: T[];
        depth?: number;
        cost?: number;
    },
    visited: Set<string> = new Set()
): Promise<T[] | null> {
    const getKey = options.getKey || ((node: T) => JSON.stringify(node));
    const path = options.path || [node];
    const depth = options.depth || 0;
    const cost = options.cost ?? (options.initialCost || 0);
    const key = getKey(node);
    
    if (options.trackVisited !== false && visited.has(key)) {
        return null;
    }
    
    if (options.maxDepth !== undefined && depth > options.maxDepth) {
        return null;
    }
    
    if (options.shouldPrune && options.shouldPrune(node, path, depth, cost)) {
        return null;
    }
    
    if (options.trackVisited !== false) {
        visited.add(key);
    }
    
    if (options.isGoal && options.isGoal(node)) {
        return path;
    }
    
    if (options.onVisit) {
        const shouldContinue = options.onVisit(node, path, depth);
        if (shouldContinue === false) {
            return path;
        }
    }
    
    const neighbors = await options.getNeighbors(node);
    
    for (const neighbor of neighbors) {
        const newCost = options.getCost 
            ? options.getCost(node, neighbor, cost)
            : cost;
        
        const result = await dfsRecursive(neighbor, {
            ...options,
            path: [...path, neighbor],
            depth: depth + 1,
            cost: newCost
        }, visited);
        
        if (result) {
            return result;
        }
    }
    
    // Backtrack: remove from visited if we want to allow revisiting in different paths
    // For most cases, we keep it visited to avoid cycles
    
    return null;
}
