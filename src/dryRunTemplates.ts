export interface DryRunStep {
  line: number;
  explanation: string;
  variables: Record<string, any>;
  arr?: number[];
  highlightRange?: [number, number];
}

export interface DryRunTemplate {
  id: string;
  name: string;
  language: string;
  description: string;
  code: string;
  steps: DryRunStep[];
}

export const DRY_RUN_TEMPLATES: Record<string, DryRunTemplate> = {
  "bubble-sort": {
    id: "bubble-sort",
    name: "Bubble Sort Algorithm",
    language: "typescript",
    description: "Watch how elements bubble up to their correct position through adjacent swaps.",
    code: `function bubbleSort(arr: number[]) {
  let n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`,
    steps: [
      {
        line: 1,
        explanation: "Initialize sorting. Input array: [5, 1, 4, 2]. Length n = 4.",
        variables: { i: "undefined", j: "undefined", temp: "undefined", n: 4 },
        arr: [5, 1, 4, 2]
      },
      {
        line: 3,
        explanation: "Outer loop starts. Set i = 0. We will perform the first pass.",
        variables: { i: 0, j: "undefined", temp: "undefined", n: 4 },
        arr: [5, 1, 4, 2]
      },
      {
        line: 4,
        explanation: "Inner loop starts. Set j = 0. Comparing arr[0] (5) and arr[1] (1).",
        variables: { i: 0, j: 0, temp: "undefined", n: 4 },
        arr: [5, 1, 4, 2]
      },
      {
        line: 5,
        explanation: "Since arr[j] (5) > arr[j+1] (1) is true, we must enter the swap block.",
        variables: { i: 0, j: 0, temp: "undefined", n: 4 },
        arr: [5, 1, 4, 2]
      },
      {
        line: 7,
        explanation: "Store arr[j] (5) in temporary variable temp.",
        variables: { i: 0, j: 0, temp: 5, n: 4 },
        arr: [5, 1, 4, 2]
      },
      {
        line: 8,
        explanation: "Overwriting arr[j] (index 0) with arr[j+1] (1).",
        variables: { i: 0, j: 0, temp: 5, n: 4 },
        arr: [1, 1, 4, 2]
      },
      {
        line: 9,
        explanation: "Overwriting arr[j+1] (index 1) with temp (5). Swap complete!",
        variables: { i: 0, j: 0, temp: 5, n: 4 },
        arr: [1, 5, 4, 2]
      },
      {
        line: 4,
        explanation: "Increment j to 1. Comparing arr[1] (5) and arr[2] (4).",
        variables: { i: 0, j: 1, temp: 5, n: 4 },
        arr: [1, 5, 4, 2]
      },
      {
        line: 5,
        explanation: "Since arr[1] (5) > arr[2] (4) is true, enter the swap block.",
        variables: { i: 0, j: 1, temp: 5, n: 4 },
        arr: [1, 5, 4, 2]
      },
      {
        line: 7,
        explanation: "Set temp = 5.",
        variables: { i: 0, j: 1, temp: 5, n: 4 },
        arr: [1, 5, 4, 2]
      },
      {
        line: 9,
        explanation: "Swapped index 1 and 2! Array is now [1, 4, 5, 2].",
        variables: { i: 0, j: 1, temp: 5, n: 4 },
        arr: [1, 4, 5, 2]
      },
      {
        line: 4,
        explanation: "Increment j to 2. Comparing arr[2] (5) and arr[3] (2).",
        variables: { i: 0, j: 2, temp: 5, n: 4 },
        arr: [1, 4, 5, 2]
      },
      {
        line: 9,
        explanation: "Swapped index 2 and 3! Element 5 has bubbled up to its correct final place.",
        variables: { i: 0, j: 2, temp: 5, n: 4 },
        arr: [1, 4, 2, 5]
      },
      {
        line: 3,
        explanation: "Outer loop increment. Set i = 1. Starting the second pass.",
        variables: { i: 1, j: 2, temp: 5, n: 4 },
        arr: [1, 4, 2, 5]
      },
      {
        line: 4,
        explanation: "Set j = 0. Comparing arr[0] (1) and arr[1] (4). No swap needed.",
        variables: { i: 1, j: 0, temp: 5, n: 4 },
        arr: [1, 4, 2, 5]
      },
      {
        line: 4,
        explanation: "Increment j to 1. Comparing arr[1] (4) and arr[2] (2). Swap needed!",
        variables: { i: 1, j: 1, temp: 5, n: 4 },
        arr: [1, 4, 2, 5]
      },
      {
        line: 9,
        explanation: "Swapped index 1 and 2! Array is now [1, 2, 4, 5]. Sorting is complete!",
        variables: { i: 1, j: 1, temp: 4, n: 4 },
        arr: [1, 2, 4, 5]
      },
      {
        line: 13,
        explanation: "Return sorted array [1, 2, 4, 5]. Program exits successfully.",
        variables: { i: 1, j: 1, temp: 4, n: 4 },
        arr: [1, 2, 4, 5]
      }
    ]
  },
  "binary-search": {
    id: "binary-search",
    name: "Binary Search (Divide & Conquer)",
    language: "typescript",
    description: "Search a sorted array by repeatedly dividing the search interval in half.",
    code: `function binarySearch(arr: number[], target: number) {
  let low = 0;
  let high = arr.length - 1;
  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) {
      return mid; // Target found
    } else if (arr[mid] < target) {
      low = mid + 1; // Search right half
    } else {
      high = mid - 1; // Search left half
    }
  }
  return -1; // Not found
}`,
    steps: [
      {
        line: 1,
        explanation: "Starting Binary Search. Array: [2, 4, 7, 10, 14, 20]. Search target = 14.",
        variables: { target: 14, low: "undefined", high: "undefined", mid: "undefined" },
        arr: [2, 4, 7, 10, 14, 20]
      },
      {
        line: 2,
        explanation: "Set low index to 0.",
        variables: { target: 14, low: 0, high: "undefined", mid: "undefined" },
        arr: [2, 4, 7, 10, 14, 20]
      },
      {
        line: 3,
        explanation: "Set high index to length - 1 = 5.",
        variables: { target: 14, low: 0, high: 5, mid: "undefined" },
        arr: [2, 4, 7, 10, 14, 20]
      },
      {
        line: 4,
        explanation: "Check while (low <= high): 0 <= 5 is true. Enter search loop.",
        variables: { target: 14, low: 0, high: 5, mid: "undefined" },
        arr: [2, 4, 7, 10, 14, 20]
      },
      {
        line: 5,
        explanation: "Calculate mid = floor((0 + 5) / 2) = 2. Middle element arr[2] is 7.",
        variables: { target: 14, low: 0, high: 5, mid: 2 },
        arr: [2, 4, 7, 10, 14, 20]
      },
      {
        line: 6,
        explanation: "Compare arr[mid] (7) with target (14). Not equal.",
        variables: { target: 14, low: 0, high: 5, mid: 2 },
        arr: [2, 4, 7, 10, 14, 20]
      },
      {
        line: 8,
        explanation: "Since arr[mid] (7) < target (14) is true, target lies in right half.",
        variables: { target: 14, low: 0, high: 5, mid: 2 },
        arr: [2, 4, 7, 10, 14, 20]
      },
      {
        line: 9,
        explanation: "Update low = mid + 1 = 3. High remains 5.",
        variables: { target: 14, low: 3, high: 5, mid: 2 },
        arr: [2, 4, 7, 10, 14, 20]
      },
      {
        line: 4,
        explanation: "Check while loop: 3 <= 5 is true.",
        variables: { target: 14, low: 3, high: 5, mid: 2 },
        arr: [2, 4, 7, 10, 14, 20]
      },
      {
        line: 5,
        explanation: "Calculate mid = floor((3 + 5) / 2) = 4. arr[4] is 14.",
        variables: { target: 14, low: 3, high: 5, mid: 4 },
        arr: [2, 4, 7, 10, 14, 20]
      },
      {
        line: 6,
        explanation: "Compare arr[mid] (14) with target (14). Equal! Target found!",
        variables: { target: 14, low: 3, high: 5, mid: 4 },
        arr: [2, 4, 7, 10, 14, 20]
      },
      {
        line: 7,
        explanation: "Return mid index 4. Binary search successful.",
        variables: { target: 14, low: 3, high: 5, mid: 4 },
        arr: [2, 4, 7, 10, 14, 20]
      }
    ]
  },
  "fibonacci": {
    id: "fibonacci",
    name: "Fibonacci (Dynamic Programming)",
    language: "typescript",
    description: "Build a DP table to compute the n-th Fibonacci number in O(n) time.",
    code: `function fibonacci(n: number) {
  let dp = [0, 1];
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}`,
    steps: [
      {
        line: 1,
        explanation: "Initialize Dynamic Programming for n = 5.",
        variables: { n: 5, i: "undefined" },
        arr: []
      },
      {
        line: 2,
        explanation: "Set base cases. dp[0] = 0, dp[1] = 1.",
        variables: { n: 5, i: "undefined" },
        arr: [0, 1]
      },
      {
        line: 3,
        explanation: "Loop starts at i = 2.",
        variables: { n: 5, i: 2 },
        arr: [0, 1]
      },
      {
        line: 4,
        explanation: "Calculate dp[2] = dp[1] + dp[0] = 1 + 0 = 1.",
        variables: { n: 5, i: 2 },
        arr: [0, 1, 1]
      },
      {
        line: 3,
        explanation: "Increment loop counter to i = 3.",
        variables: { n: 5, i: 3 },
        arr: [0, 1, 1]
      },
      {
        line: 4,
        explanation: "Calculate dp[3] = dp[2] + dp[1] = 1 + 1 = 2.",
        variables: { n: 5, i: 3 },
        arr: [0, 1, 1, 2]
      },
      {
        line: 3,
        explanation: "Increment loop counter to i = 4.",
        variables: { n: 5, i: 4 },
        arr: [0, 1, 1, 2]
      },
      {
        line: 4,
        explanation: "Calculate dp[4] = dp[3] + dp[2] = 2 + 1 = 3.",
        variables: { n: 5, i: 4 },
        arr: [0, 1, 1, 2, 3]
      },
      {
        line: 3,
        explanation: "Increment loop counter to i = 5.",
        variables: { n: 5, i: 5 },
        arr: [0, 1, 1, 2, 3]
      },
      {
        line: 4,
        explanation: "Calculate dp[5] = dp[4] + dp[3] = 3 + 2 = 5.",
        variables: { n: 5, i: 5 },
        arr: [0, 1, 1, 2, 3, 5]
      },
      {
        line: 6,
        explanation: "Return dp[5] = 5. Fibonacci sequence computed successfully!",
        variables: { n: 5, i: 5 },
        arr: [0, 1, 1, 2, 3, 5]
      }
    ]
  }
};
