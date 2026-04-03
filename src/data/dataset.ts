/**
 * MasteryTree - Hardcoded Dataset
 * 
 * This file contains the tech tree structure and question bank.
 * The key innovation is that questions are MULTI-TAGGED with micro-skills,
 * enabling the deterministic Retrieval & Ranking algorithm to identify
 * specific weaknesses and build targeted remedial quizzes.
 * 
 * Tech Tree Structure (Python Basics):
 * 
 *         [Variables]         [Data Types]
 *              \                   /
 *               \                 /
 *                \               /
 *                 → [Booleans] ←
 *                       |
 *                       ↓
 *                 [If/Else]
 *                    /  \
 *                   /    \
 *                  ↓      ↓
 *          [While Loops]  [For Loops]
 *                  \        /
 *                   \      /
 *                    \    /
 *                     ↓  ↓
 *                  [Loop Control]
 */

import type { TechTreeNode, Question, MicroSkillTag } from '@/types';

// =============================================================================
// TECH TREE NODES (8 nodes covering Python basics)
// =============================================================================

export const techTreeNodes: TechTreeNode[] = [
  {
    id: 'variables',
    title: 'Variables',
    description: 'Learn how to declare, assign, and name variables in Python.',
    prerequisites: [],
    microSkillTags: [
      'variable_declaration',
      'variable_assignment',
      'variable_naming',
      'variable_scope',
    ],
    position: { x: 200, y: 50 },
  },
  {
    id: 'data_types',
    title: 'Data Types',
    description: 'Understand Python data types: integers, floats, strings, and booleans.',
    prerequisites: [],
    microSkillTags: [
      'data_type_int',
      'data_type_float',
      'data_type_string',
      'data_type_bool',
      'type_conversion',
      'type_inference',
    ],
    position: { x: 500, y: 50 },
  },
  {
    id: 'booleans',
    title: 'Booleans & Logic',
    description: 'Master boolean values, comparison operators, and logical operators.',
    prerequisites: ['variables', 'data_types'],
    microSkillTags: [
      'boolean_literals',
      'comparison_operators',
      'logical_operators',
      'boolean_expressions',
      'truth_tables',
    ],
    position: { x: 350, y: 180 },
  },
  {
    id: 'if_else',
    title: 'If/Else Statements',
    description: 'Learn conditional execution with if, else, and elif statements.',
    prerequisites: ['booleans'],
    microSkillTags: [
      'if_statement',
      'else_clause',
      'elif_chain',
      'nested_conditionals',
      'conditional_logic',
    ],
    position: { x: 350, y: 310 },
  },
  {
    id: 'while_loops',
    title: 'While Loops',
    description: 'Understand while loops and how to control loop execution.',
    prerequisites: ['if_else'],
    microSkillTags: [
      'while_loop',
      'loop_syntax',
      'loop_body',
      'loop_iteration',
      'infinite_loop',
      'loop_variable',
    ],
    position: { x: 200, y: 440 },
  },
  {
    id: 'for_loops',
    title: 'For Loops',
    description: 'Master for loops, the range function, and iteration patterns.',
    prerequisites: ['if_else'],
    microSkillTags: [
      'for_loop',
      'loop_syntax',
      'loop_body',
      'loop_iteration',
      'off_by_one_error',
      'loop_variable',
      'range_function',
    ],
    position: { x: 500, y: 440 },
  },
  {
    id: 'loop_control',
    title: 'Loop Control',
    description: 'Learn to control loop flow with break and continue statements.',
    prerequisites: ['while_loops', 'for_loops'],
    microSkillTags: [
      'loop_control_break',
      'loop_control_continue',
      'loop_iteration',
      'off_by_one_error',
      'infinite_loop',
      'code_tracing',
      'debugging',
    ],
    position: { x: 350, y: 570 },
  },
];

// =============================================================================
// QUESTION BANK (25 questions with multi-tagged micro-skills)
// =============================================================================

export const questionBank: Question[] = [
  // =========================================================================
  // VARIABLES QUESTIONS (3 questions)
  // =========================================================================
  {
    id: 'var_001',
    nodeId: 'variables',
    text: 'What is the correct way to declare a variable in Python?',
    options: [
      'var x = 5',
      'int x = 5',
      'x = 5',
      'declare x = 5',
    ],
    correctOptionIndex: 2,
    microSkillTags: ['variable_declaration', 'variable_assignment'],
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    explanation: 'In Python, you simply assign a value to a variable name. No keyword like "var" or type declaration is needed.',
  },
  {
    id: 'var_002',
    nodeId: 'variables',
    text: 'What will be the value of x after this code runs?',
    code: 'x = 10\nx = x + 5\nx = x * 2',
    options: ['10', '15', '30', '25'],
    correctOptionIndex: 2,
    microSkillTags: ['variable_assignment', 'variable_naming', 'code_tracing'],
    difficulty: 'easy',
    estimatedTimeSeconds: 45,
    explanation: 'x starts at 10, becomes 15 (10+5), then becomes 30 (15*2).',
  },
  {
    id: 'var_003',
    nodeId: 'variables',
    text: 'Which of these variable names is INVALID in Python?',
    options: [
      'my_variable',
      '2ndVariable',
      '_privateVar',
      'userName123',
    ],
    correctOptionIndex: 1,
    microSkillTags: ['variable_naming'],
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    explanation: 'Variable names cannot start with a number. They must start with a letter or underscore.',
  },

  // =========================================================================
  // DATA TYPES QUESTIONS (4 questions)
  // =========================================================================
  {
    id: 'dtype_001',
    nodeId: 'data_types',
    text: 'What is the data type of: x = 3.14',
    options: ['int', 'float', 'str', 'decimal'],
    correctOptionIndex: 1,
    microSkillTags: ['data_type_float', 'type_inference'],
    difficulty: 'easy',
    estimatedTimeSeconds: 20,
    explanation: 'Numbers with decimal points are floats in Python.',
  },
  {
    id: 'dtype_002',
    nodeId: 'data_types',
    text: 'What is the result of: int("42") + 8',
    options: ['"428"', '50', '428', 'Error'],
    correctOptionIndex: 1,
    microSkillTags: ['type_conversion', 'data_type_int', 'data_type_string'],
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    explanation: 'int("42") converts the string to integer 42, then 42 + 8 = 50.',
  },
  {
    id: 'dtype_003',
    nodeId: 'data_types',
    text: 'What will this code output?',
    code: 'print(type(True))',
    options: ["<class 'bool'>", "<class 'boolean'>", "<class 'int'>", 'true'],
    correctOptionIndex: 0,
    microSkillTags: ['data_type_bool', 'boolean_literals', 'type_inference'],
    difficulty: 'easy',
    estimatedTimeSeconds: 25,
    explanation: 'True is a boolean value, and type() returns <class \'bool\'>.',
  },
  {
    id: 'dtype_004',
    nodeId: 'data_types',
    text: 'What happens when you run: "Hello" + 123',
    options: ['"Hello123"', '123', 'Error', '"Hello 123"'],
    correctOptionIndex: 2,
    microSkillTags: ['type_conversion', 'data_type_string', 'data_type_int', 'debugging'],
    difficulty: 'medium',
    estimatedTimeSeconds: 30,
    explanation: 'You cannot concatenate a string and an integer directly. You must convert: str(123).',
  },

  // =========================================================================
  // BOOLEANS QUESTIONS (4 questions)
  // =========================================================================
  {
    id: 'bool_001',
    nodeId: 'booleans',
    text: 'What is the result of: True and False',
    options: ['True', 'False', 'Error', 'None'],
    correctOptionIndex: 1,
    microSkillTags: ['boolean_literals', 'logical_operators', 'truth_tables'],
    difficulty: 'easy',
    estimatedTimeSeconds: 20,
    explanation: 'The "and" operator returns True only if both operands are True.',
  },
  {
    id: 'bool_002',
    nodeId: 'booleans',
    text: 'What is the result of: 5 > 3 and 2 < 1',
    options: ['True', 'False', 'Error', '5 > 3'],
    correctOptionIndex: 1,
    microSkillTags: ['comparison_operators', 'logical_operators', 'boolean_expressions'],
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    explanation: '5 > 3 is True, but 2 < 1 is False. True and False = False.',
  },
  {
    id: 'bool_003',
    nodeId: 'booleans',
    text: 'What is the result of: not (5 == 5)',
    options: ['True', 'False', 'Error', '5'],
    correctOptionIndex: 1,
    microSkillTags: ['comparison_operators', 'logical_operators', 'boolean_expressions'],
    difficulty: 'easy',
    estimatedTimeSeconds: 25,
    explanation: '5 == 5 is True, and not True = False.',
  },
  {
    id: 'bool_004',
    nodeId: 'booleans',
    text: 'Evaluate: (True or False) and (not False)',
    options: ['True', 'False', 'Error', 'None'],
    correctOptionIndex: 0,
    microSkillTags: ['logical_operators', 'truth_tables', 'boolean_expressions'],
    difficulty: 'medium',
    estimatedTimeSeconds: 45,
    explanation: '(True or False) = True, (not False) = True, True and True = True.',
  },

  // =========================================================================
  // IF/ELSE QUESTIONS (4 questions)
  // =========================================================================
  {
    id: 'if_001',
    nodeId: 'if_else',
    text: 'What will this code print?',
    code: 'x = 10\nif x > 5:\n    print("big")\nelse:\n    print("small")',
    options: ['big', 'small', 'Nothing', 'Error'],
    correctOptionIndex: 0,
    microSkillTags: ['if_statement', 'else_clause', 'conditional_logic', 'code_tracing'],
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    explanation: 'x is 10, which is greater than 5, so the if branch executes.',
  },
  {
    id: 'if_002',
    nodeId: 'if_else',
    text: 'What will this code print?',
    code: 'x = 5\nif x > 10:\n    print("A")\nelif x > 3:\n    print("B")\nelse:\n    print("C")',
    options: ['A', 'B', 'C', 'Nothing'],
    correctOptionIndex: 1,
    microSkillTags: ['elif_chain', 'conditional_logic', 'code_tracing'],
    difficulty: 'easy',
    estimatedTimeSeconds: 40,
    explanation: 'x=5 is not > 10, but it is > 3, so the elif branch executes and prints "B".',
  },
  {
    id: 'if_003',
    nodeId: 'if_else',
    text: 'What will this code print?',
    code: 'x = 15\nif x > 10:\n    if x > 20:\n        print("HUGE")\n    else:\n        print("BIG")\nelse:\n    print("small")',
    options: ['HUGE', 'BIG', 'small', 'Nothing'],
    correctOptionIndex: 1,
    microSkillTags: ['nested_conditionals', 'conditional_logic', 'code_tracing'],
    difficulty: 'medium',
    estimatedTimeSeconds: 50,
    explanation: 'x=15 > 10, so we enter the outer if. But 15 is not > 20, so the inner else prints "BIG".',
  },
  {
    id: 'if_004',
    nodeId: 'if_else',
    text: 'What is wrong with this code?',
    code: 'x = 5\nif x = 5:\n    print("five")',
    options: [
      'Nothing is wrong',
      'Should use == for comparison',
      'Missing else clause',
      'x cannot be 5',
    ],
    correctOptionIndex: 1,
    microSkillTags: ['if_statement', 'comparison_operators', 'debugging'],
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    explanation: 'In conditions, use == for comparison. A single = is for assignment.',
  },

  // =========================================================================
  // WHILE LOOPS QUESTIONS (3 questions)
  // =========================================================================
  {
    id: 'while_001',
    nodeId: 'while_loops',
    text: 'How many times will this loop run?',
    code: 'x = 0\nwhile x < 3:\n    print(x)\n    x = x + 1',
    options: ['0 times', '1 time', '3 times', 'Infinite'],
    correctOptionIndex: 2,
    microSkillTags: ['while_loop', 'loop_iteration', 'loop_variable', 'code_tracing'],
    difficulty: 'easy',
    estimatedTimeSeconds: 45,
    explanation: 'The loop runs for x = 0, 1, 2 (3 iterations), then x becomes 3 and the condition fails.',
  },
  {
    id: 'while_002',
    nodeId: 'while_loops',
    text: 'What will this code print?',
    code: 'x = 5\nwhile x > 0:\n    x = x - 1\n    if x == 2:\n        break\nprint(x)',
    options: ['0', '2', '5', '1'],
    correctOptionIndex: 1,
    microSkillTags: ['while_loop', 'loop_iteration', 'infinite_loop', 'code_tracing'],
    difficulty: 'medium',
    estimatedTimeSeconds: 60,
    explanation: 'The loop decrements x from 5. When x becomes 2, break exits the loop and prints 2.',
  },
  {
    id: 'while_003',
    nodeId: 'while_loops',
    text: 'What is the problem with this code?',
    code: 'x = 1\nwhile x > 0:\n    print(x)\n    x = x + 1',
    options: [
      'Syntax error',
      'Infinite loop',
      'x should start at 0',
      'Nothing is wrong',
    ],
    correctOptionIndex: 1,
    microSkillTags: ['while_loop', 'infinite_loop', 'debugging'],
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    explanation: 'x starts at 1 and keeps increasing. The condition x > 0 will always be True.',
  },

  // =========================================================================
  // FOR LOOPS QUESTIONS (4 questions)
  // =========================================================================
  {
    id: 'for_001',
    nodeId: 'for_loops',
    text: 'What will this code print?',
    code: 'for i in range(3):\n    print(i)',
    options: ['0 1 2', '1 2 3', '0 1 2 3', '1 2'],
    correctOptionIndex: 0,
    microSkillTags: ['for_loop', 'range_function', 'loop_iteration', 'off_by_one_error'],
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    explanation: 'range(3) generates 0, 1, 2. It starts at 0 and excludes the end value (off-by-one concept).',
  },
  {
    id: 'for_002',
    nodeId: 'for_loops',
    text: 'What will this code print?',
    code: 'for i in range(1, 5):\n    print(i)',
    options: ['0 1 2 3 4', '1 2 3 4', '1 2 3 4 5', '0 1 2 3'],
    correctOptionIndex: 1,
    microSkillTags: ['for_loop', 'range_function', 'off_by_one_error', 'code_tracing'],
    difficulty: 'easy',
    estimatedTimeSeconds: 30,
    explanation: 'range(1, 5) generates 1, 2, 3, 4. It starts at 1 and excludes 5.',
  },
  {
    id: 'for_003',
    nodeId: 'for_loops',
    text: 'What will this code print?',
    code: 'total = 0\nfor i in range(4):\n    total = total + i\nprint(total)',
    options: ['4', '6', '10', '0'],
    correctOptionIndex: 1,
    microSkillTags: ['for_loop', 'loop_variable', 'loop_body', 'code_tracing', 'off_by_one_error'],
    difficulty: 'medium',
    estimatedTimeSeconds: 60,
    explanation: 'The loop adds 0+1+2+3 = 6. range(4) gives [0, 1, 2, 3].',
  },
  {
    id: 'for_004',
    nodeId: 'for_loops',
    text: 'What will this code print?',
    code: 'for i in range(5):\n    if i == 3:\n        continue\n    print(i)',
    options: ['0 1 2 3 4', '0 1 2 4', '0 1 2', '3'],
    correctOptionIndex: 1,
    microSkillTags: ['for_loop', 'loop_iteration', 'loop_control_continue', 'code_tracing'],
    difficulty: 'medium',
    estimatedTimeSeconds: 45,
    explanation: 'The loop prints all values 0-4 except 3, which is skipped by continue.',
  },

  // =========================================================================
  // LOOP CONTROL QUESTIONS (3 questions)
  // =========================================================================
  {
    id: 'ctrl_001',
    nodeId: 'loop_control',
    text: 'What will this code print?',
    code: 'for i in range(10):\n    if i == 3:\n        break\nprint(i)',
    options: ['10', '3', '2', 'Error'],
    correctOptionIndex: 1,
    microSkillTags: ['loop_control_break', 'for_loop', 'code_tracing', 'off_by_one_error'],
    difficulty: 'medium',
    estimatedTimeSeconds: 45,
    explanation: 'When i == 3, break exits the loop. After the loop, i still holds the value 3.',
  },
  {
    id: 'ctrl_002',
    nodeId: 'loop_control',
    text: 'What is the output of this code?',
    code: 'count = 0\nfor i in range(5):\n    for j in range(3):\n        if i + j == 4:\n            break\n        count += 1\nprint(count)',
    options: ['15', '12', '13', '14'],
    correctOptionIndex: 2,
    microSkillTags: ['loop_control_break', 'nested_conditionals', 'code_tracing', 'debugging'],
    difficulty: 'hard',
    estimatedTimeSeconds: 90,
    explanation: 'The inner loop runs 3 times each for i=0,1. For i=2, j=2 triggers break after 2 iterations. i=3 has 2 iterations, i=4 has 1. Total: 3+3+2+2+1 = 13',
  },
  {
    id: 'ctrl_003',
    nodeId: 'loop_control',
    text: 'What will this code print?',
    code: 'result = []\nfor i in range(1, 6):\n    if i % 2 == 0:\n        continue\n    result.append(i)\nprint(result)',
    options: ['[1, 3, 5]', '[2, 4]', '[1, 2, 3, 4, 5]', '[]'],
    correctOptionIndex: 0,
    microSkillTags: ['loop_control_continue', 'for_loop', 'conditional_logic', 'code_tracing'],
    difficulty: 'medium',
    estimatedTimeSeconds: 60,
    explanation: 'Even numbers (2, 4) are skipped by continue. Odd numbers (1, 3, 5) are added to the list.',
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get all questions for a specific node
 */
export function getQuestionsForNode(nodeId: string): Question[] {
  return questionBank.filter(q => q.nodeId === nodeId);
}

/**
 * Get a node by ID
 */
export function getNodeById(nodeId: string): TechTreeNode | undefined {
  return techTreeNodes.find(n => n.id === nodeId);
}

/**
 * Get all unique micro-skill tags used in the dataset
 */
export function getAllMicroSkillTags(): MicroSkillTag[] {
  const tags = new Set<MicroSkillTag>();
  questionBank.forEach(q => q.microSkillTags.forEach(t => tags.add(t)));
  techTreeNodes.forEach(n => n.microSkillTags.forEach(t => tags.add(t)));
  return Array.from(tags);
}

/**
 * Get all prerequisite node IDs for a given node (recursive)
 */
export function getAllPrerequisites(nodeId: string, visited: Set<string> = new Set()): string[] {
  const node = getNodeById(nodeId);
  if (!node) return [];
  
  const prerequisites: string[] = [];
  for (const prereqId of node.prerequisites) {
    if (!visited.has(prereqId)) {
      visited.add(prereqId);
      prerequisites.push(prereqId);
      prerequisites.push(...getAllPrerequisites(prereqId, visited));
    }
  }
  return prerequisites;
}
