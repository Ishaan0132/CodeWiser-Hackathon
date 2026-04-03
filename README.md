# MasteryTree 🌳

> An adaptive learning platform where a syllabus is a "Tech Tree" (Directed Acyclic Graph).  
> **100% Deterministic Intelligence - No AI/LLM APIs used at runtime.**

## 🎯 Concept

MasteryTree is a hackathon project that demonstrates how "intelligent" adaptive learning can be achieved through pure deterministic logic, rules engines, and data structures—without any AI or LLM APIs.

### Core Innovation: Dynamic Remedial Assembly Engine

Instead of giving users static quizzes when they fail, the system uses a **deterministic Retrieval & Ranking algorithm** to dynamically build a custom "Frankenstein" quiz targeting their exact weakest micro-skills.

---

## ✨ Features

### 1. Tech Tree Visualization
- Interactive graph rendered with React Flow
- Color-coded node states:
  - 🔵 **Blue** = Available (ready to learn)
  - 🟢 **Green** = Mastered (≥85% score)
  - 🟠 **Orange** = Fragile (60-84% score)
  - 🔴 **Red** = Failed (<60% score)
  - ⚫ **Grey** = Locked (complete prerequisites first)

### 2. Multi-Tagged Question System
- Each question tests multiple micro-skills simultaneously
- Enables granular skill tracking and weakness identification
- Example: A loop question might test `for_loop`, `off_by_one_error`, and `output_prediction`

### 3. Weighted Scoring System
```
Total Score = Accuracy (0 or 100) + Time Penalty (-20 if slow) + Hint Penalty (-15 if used)
```

### 4. Dynamic Remedial Quiz Generator
The core algorithm that makes this system "intelligent" without AI:
- **Step 1**: Identify user's 2-3 weakest micro-skills
- **Step 2**: Retrieve questions containing those weak tags
- **Step 3**: Rank questions (+10 per weak tag, +5 for prerequisite questions)
- **Step 4**: Assemble top 3 questions into a targeted quiz

### 5. Assembly Trace Panel
Full transparency on why questions were selected—providing "explainability" without AI.

### 6. Skill Profile Radar
Visual display of top 5 strongest and weakest micro-skills based on historical performance.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mastery-tree

# Install dependencies
bun install
# or
npm install

# Start development server
bun run dev
# or
npm run dev
```

### Open in Browser
Navigate to `http://localhost:3000`

---

## 📖 How to Use

### Step 1: Explore the Tech Tree
- The graph shows 8 Python learning nodes arranged in a DAG
- **Variables** and **Data Types** are unlocked by default

### Step 2: Start a Quiz
1. Click on any **Available** (blue) node
2. Click "Start Quiz" in the details panel
3. Answer 3 questions to complete the quiz

### Step 3: Understand Your Score
- **≥85%** → Node becomes MASTERED (green)
- **60-84%** → Node becomes FRAGILE (orange)
- **<60%** → Node becomes FAILED (red)

### Step 4: Take Remedial Quizzes
- If FRAGILE or FAILED, click "Remedial Quiz"
- The system generates a custom quiz targeting your weakest skills
- Check the **Trace** tab to see WHY each question was chosen

### Step 5: Track Your Skills
- Switch to the **Skills** tab to see your skill profile
- Strongest skills are shown at the top
- Weakest skills highlight areas needing improvement

---
## 🧠 The Deterministic Logic Engine

### Why No AI?

This project proves that "intelligent" behavior doesn't require AI. The entire system uses:

1. **Rule-based state transitions** - Clear thresholds determine node states
2. **Statistical analysis** - Historical scores identify weaknesses
3. **Weighted ranking** - Deterministic formula prioritizes questions

### Core Algorithm: `generateRemedialQuiz()`

```typescript
function generateRemedialQuiz(nodeId, skillProfile, seenQuestionIds) {
  // STEP 1: Identify Weaknesses
  // - Get all micro-skill tags for the node
  // - Look up user's historical scores for each tag
  // - Return the 2-3 tags with lowest average scores
  
  // STEP 2: Retrieve Candidates
  // - Filter question bank for questions containing weak tags
  // - Exclude already-seen questions
  
  // STEP 3: Rank Questions
  // - +10 points for each weak tag the question hits
  // - +5 points if question is from a prerequisite node
  //   (catches root causes of misunderstanding)
  
  // STEP 4: Assemble Quiz
  // - Sort by rank (descending)
  // - Return top 3 questions
}
```

### Scoring Formula

```typescript
function calculateAttemptScore(isCorrect, timeTaken, estimatedTime, usedHint) {
  const rawScore = isCorrect ? 100 : 0;
  
  // Time penalty: -20 if took >1.5x estimated time
  const timePenalty = timeTaken > estimatedTime * 1.5 ? -20 : 0;
  
  // Hint penalty: -15 if hint was used
  const hintPenalty = usedHint ? -15 : 0;
  
  return Math.max(0, rawScore + timePenalty + hintPenalty);
}
```

### State Machine

```
                    ┌─────────────────────────────────────┐
                    │                                     │
                    ▼                                     │
    LOCKED ──(prereqs mastered)──► AVAILABLE ──(score≥85)──► MASTERED
                                      │                        ▲
                                      │                        │
                         (score 60-84)│                        │
                                      ▼                        │
                                  FRAGILE ──(score≥85)─────────┘
                                      │
                          (score<60)  │
                                      ▼
                                   FAILED ──(score≥85)─────────► MASTERED
```

---

## 📊 Data Model

### Micro-Skill Tags

Questions are tagged with granular skills:

```typescript
type MicroSkillTag = 
  // Variables & Data Types
  | 'variable_declaration'
  | 'variable_assignment'
  | 'variable_scope'
  | 'data_type_int'
  | 'type_conversion'
  // Booleans & Logic
  | 'boolean_literals'
  | 'comparison_operators'
  | 'logical_operators'
  // Control Flow
  | 'if_statement'
  | 'else_clause'
  | 'nested_conditionals'
  // Loops
  | 'for_loop'
  | 'while_loop'
  | 'off_by_one_error'
  | 'infinite_loop'
  | 'loop_control_break'
  // ... and more
```

### Question Structure

```typescript
interface Question {
  id: string;
  nodeId: string;
  text: string;
  code?: string;                  // Optional code snippet
  options: string[];              // Multiple choice (A, B, C, D)
  correctOptionIndex: number;
  microSkillTags: MicroSkillTag[]; // Multi-tagged!
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTimeSeconds: number;
  explanation: string;
}
```

### Skill Profile

```typescript
interface SkillProfile {
  [tag: MicroSkillTag]: {
    totalAttempts: number;
    correctAttempts: number;
    avgScore: number;            // Weighted average
    lastAttemptTimestamp: number;
  }
}
```

---

## 🎨 UI Components

### Interactive Graph (React Flow)
- Drag to pan, scroll to zoom
- Click nodes to select
- Animated edges show prerequisite flow
- MiniMap for navigation

### Assembly Trace Panel
Shows the deterministic decision-making process:
1. **Identified Weaknesses** - Which skills are weakest and by how much
2. **Question Rankings** - Point breakdown for each candidate question
3. **Selected Questions** - The final quiz composition
4. **Summary** - Human-readable explanation

### Skill Radar
- Top 5 strongest skills (green)
- Top 5 weakest skills (red)
- Progress bars show mastery level
- Attempt counts for context

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server (port 3000) |
| `bun run build` | Build for production |
| `bun run lint` | Run ESLint for code quality |
| `bun run start` | Start production server |

---

## 🧪 Testing the System

### Test Scenario: Weak Off-by-One Errors

1. Start the **For Loops** quiz
2. Deliberately get questions wrong that test `off_by_one_error`
3. Complete the quiz with a FRAGILE or FAILED state
4. Click "Remedial Quiz"
5. Check the **Trace** tab - you should see `off_by_one_error` as a targeted weakness
6. The remedial quiz will include questions specifically testing that skill

### Test Scenario: Prerequisite Root Cause

1. Fail questions about `variable_scope` in the Variables quiz
2. Later, fail the For Loops quiz
3. Take a remedial quiz for For Loops
4. The system may include Variables questions (prerequisite) to catch root causes
5. Check the Trace panel to see the +5 prerequisite bonus

---

## 🚧 Future Improvements

### Potential Enhancements
- [ ] Add more nodes to complete Python basics curriculum
- [ ] Implement spaced repetition for mastered skills
- [ ] Add code execution for programming questions
- [ ] Support for open-ended questions with test cases
- [ ] Learning analytics dashboard
- [ ] Export/import progress
- [ ] Multi-user support with authentication

### Algorithm Improvements
- [ ] Weight recent attempts more heavily
- [ ] Consider question difficulty in ranking
- [ ] Adaptive quiz length based on performance
- [ ] Cross-node skill relationships

---

## 📝 License

MIT License - Feel free to use this project for your own learning or hackathons!

---

## 🙏 Acknowledgments

- Built with [Next.js 16](https://nextjs.org/)
- Graph visualization by [React Flow](https://reactflow.dev/)
- State management by [Zustand](https://github.com/pmndrs/zustand)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts by [Recharts](https://recharts.org/)

---

## 🎓 Key Takeaways for Hackathon Judges

1. **No AI/LLM APIs** - All "intelligence" is deterministic and rule-based
2. **Full Transparency** - The Trace panel shows exactly WHY decisions are made
3. **Granular Tracking** - Multi-tagged questions enable precise weakness identification
4. **Root Cause Detection** - Prerequisite bonus catches underlying misconceptions
5. **Modular Architecture** - Logic engine is completely separate from UI
6. **Well-Documented Code** - Heavy comments explain every decision

**The innovation is in the deterministic algorithm, not in AI magic.**
