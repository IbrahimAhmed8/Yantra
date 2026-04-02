export type PythonRoomDayOneContent = {
  phaseLabel: string;
  title: string;
  description: string;
  task: string;
  starterCode: string;
  fakeOutput: string;
  level: string;
  modeLabel: string;
  estimatedMinutes: number;
  successCriteria: string[];
  starterGuidance: string[];
};

export const pythonRoomDayOneContent: PythonRoomDayOneContent = {
  phaseLabel: 'Day 01 // Objective',
  title: 'Control Flow Calibration',
  description:
    'This first room is a quiet shell for focused Python work. You are not being graded yet. The goal is to settle into Yantra’s room flow and practice writing one clean pass through simple learner data.',
  task:
    'Write a Python program that loops through a list of learner scores, assigns each learner a performance label, and prints one readable summary line per learner.',
  starterCode: `scores = [
    ("Asha", 88),
    ("Dev", 73),
    ("Ira", 95),
    ("Kabir", 61),
]

for name, score in scores:
    # assign a label: Strong, Average, or Needs Work
    # print: "Asha - 88 - Strong"
    pass
`,
  fakeOutput: `Preview Output
--------------
Asha - 88 - Strong
Dev - 73 - Average
Ira - 95 - Strong
Kabir - 61 - Needs Work

Status: Simulated Day 1 output. Real execution begins in Day 2.`,
  level: 'Beginner',
  modeLabel: 'Live Practice',
  estimatedMinutes: 18,
  successCriteria: [
    'Loop through every learner in the scores list.',
    'Assign one label: Strong, Average, or Needs Work.',
    'Print one clean summary line for each learner.',
  ],
  starterGuidance: [
    'Decide the label first, then print the final sentence.',
    'Use one conditional block inside the loop, not many separate prints.',
    'Keep the output to one readable line per learner.',
  ],
};
