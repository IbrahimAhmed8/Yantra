import type { RoomBlueprint } from './room-blueprint';

export const roomBlueprints: RoomBlueprint[] = [
  {
    id: 'control-flow-calibration',
    topic: 'Control Flow',
    roomNumber: 0,
    title: 'Control Flow Calibration',
    learningGoal: 'Settle into the Yantra room flow and practice readable control flow with learner-score data.',
    conceptSummary:
      'This first live room is a quiet shell for focused Python work. The goal is to make one clean pass through learner data and get comfortable with Yantra’s room flow before the broader sequence opens up.',
    difficulty: 'beginner',
    estimatedMinutes: 18,
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
    expectedOutputHint: 'Asha - 88 - Strong\nDev - 73 - Average\nIra - 95 - Strong\nKabir - 61 - Needs Work',
    successCriteria: [
      'Loop through every learner score exactly once.',
      'Assign a readable label for each learner based on the score.',
      'Print one clean summary line per learner.',
    ],
    starterGuidance: [
      'Use tuple unpacking inside the loop: for name, score in scores:',
      'Choose labels like Strong, Average, and Needs Work with if/elif/else.',
      'Keep the final output to one line per learner.',
    ],
    bannedConcepts: ['functions', 'while loops', 'list comprehension', 'classes'],
    phaseLabel: 'Control Flow // Calibration',
  },


  // ─── TOPIC 1: VARIABLES (3 rooms) ───────────────────────────

  {
    id: 'variables-room-1',
    topic: 'Variables',
    roomNumber: 1,
    title: 'Your First Variable',
    learningGoal: 'Store a value in a variable and print it.',
    conceptSummary: 'A variable is a named container that holds a value. You create one by writing a name, an equals sign, and the value. Python figures out the type automatically.',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    starterCode: `# Store your name in a variable and print it
name = "Asha"
print(name)
`,
    expectedOutputHint: 'Asha',
    successCriteria: [
      'Create at least one variable.',
      'Use print() to display the variable value.',
      'The output matches the value stored.',
    ],
    starterGuidance: [
      'Variable names should be lowercase and descriptive.',
      'Use quotes around text values.',
      'print() displays whatever is inside the brackets.',
    ],
    bannedConcepts: ['loops', 'functions', 'if statements', 'lists', 'dictionaries'],
    phaseLabel: 'Variables // Room 1',
  },

  {
    id: 'variables-room-2',
    topic: 'Variables',
    roomNumber: 2,
    title: 'Swap Two Variables',
    learningGoal: 'Reassign variables and swap their values.',
    conceptSummary: 'Variables can be updated at any time by assigning a new value. To swap two variables, use a temporary third variable to hold one value while you reassign.',
    difficulty: 'beginner',
    estimatedMinutes: 12,
    starterCode: `a = 10
b = 20

# Swap the values of a and b
# After the swap: a should be 20, b should be 10

print("a =", a)
print("b =", b)
`,
    expectedOutputHint: 'a = 20\nb = 10',
    successCriteria: [
      'a ends up with the original value of b.',
      'b ends up with the original value of a.',
      'Print both values after the swap.',
    ],
    starterGuidance: [
      'Use a third variable called temp to hold one value temporarily.',
      'Reassign step by step — do not try to do it in one line yet.',
    ],
    bannedConcepts: ['loops', 'functions', 'if statements', 'lists', 'tuple unpacking'],
    phaseLabel: 'Variables // Room 2',
  },

  {
    id: 'variables-room-3',
    topic: 'Variables',
    roomNumber: 3,
    title: 'Build a Summary Line',
    learningGoal: 'Combine multiple variables into a single printed sentence.',
    conceptSummary: 'You can combine variables and text using commas in print() or by using string concatenation with +. This is useful for building readable output from stored values.',
    difficulty: 'beginner',
    estimatedMinutes: 14,
    starterCode: `name = "Asha"
age = 17
city = "Mumbai"

# Print one line: "Asha is 17 years old and lives in Mumbai."
`,
    expectedOutputHint: 'Asha is 17 years old and lives in Mumbai.',
    successCriteria: [
      'All three variables appear in the output.',
      'The sentence reads naturally.',
      'age is stored as a number, not a string.',
    ],
    starterGuidance: [
      'Use print() with commas to combine values — Python adds spaces automatically.',
      'Or use str(age) to convert the number if you use + concatenation.',
    ],
    bannedConcepts: ['loops', 'functions', 'if statements', 'f-strings', 'format()'],
    phaseLabel: 'Variables // Room 3',
  },

  {
    id: 'variables-room-4',
    topic: 'Variables',
    roomNumber: 4,
    title: 'Update and Increment',
    learningGoal: 'Update a variable using its current value and basic math.',
    conceptSummary: 'Variables are dynamic. You can update a variable by assigning it a new value that depends on its old value, like incrementing a score by 1.',
    difficulty: 'beginner',
    estimatedMinutes: 12,
    starterCode: `score = 10
# Increase the score by 5
# Then decrease it by 2
# Print the final score
`,
    expectedOutputHint: '13',
    successCriteria: [
      'The variable score is updated twice.',
      'Mathematical operators + and - are used correctly.',
      'The final output matches the expected result.',
    ],
    starterGuidance: [
      'Use score = score + 5 to increase the value.',
      'Alternatively, use the shorthand score += 5.',
    ],
    bannedConcepts: ['loops', 'functions', 'if statements', 'lists', 'input()'],
    phaseLabel: 'Variables // Room 4',
  },

  // ─── TOPIC 2: DATA TYPES (3 rooms) ──────────────────────────

  {
    id: 'data-types-room-1',
    topic: 'Data Types',
    roomNumber: 1,
    title: 'Identify the Type',
    learningGoal: 'Use type() to discover what data type a value is.',
    conceptSummary: 'Every value in Python has a type: int for whole numbers, float for decimals, str for text, and bool for True or False. The type() function tells you what type any value is.',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    starterCode: `# Print the type of each value below
print(type(42))
print(type(3.14))
print(type("hello"))
print(type(True))
`,
    expectedOutputHint: "<class 'int'>\n<class 'float'>\n<class 'str'>\n<class 'bool'>",
    successCriteria: [
      'All four type() calls print correctly.',
      'Output shows int, float, str, and bool.',
    ],
    starterGuidance: [
      'Run the code as-is first to see the output.',
      'Then try type() on your own values.',
    ],
    bannedConcepts: ['loops', 'functions', 'if statements', 'lists', 'type casting'],
    phaseLabel: 'Data Types // Room 1',
  },

  {
    id: 'data-types-room-2',
    topic: 'Data Types',
    roomNumber: 2,
    title: 'Type Conversion',
    learningGoal: 'Convert between int, float, and str using casting functions.',
    conceptSummary: 'Python lets you convert values from one type to another using int(), float(), and str(). This is called type casting and is useful when combining numbers with text or doing math on user input.',
    difficulty: 'beginner',
    estimatedMinutes: 14,
    starterCode: `price = "49"
tax_rate = 0.18

# Convert price to a float and calculate total with tax
# Print: "Total: 57.82"
`,
    expectedOutputHint: 'Total: 57.82',
    successCriteria: [
      'price is converted from str to float before calculation.',
      'Tax is calculated correctly.',
      'Output shows the correct total.',
    ],
    starterGuidance: [
      'Use float(price) to convert the string to a number.',
      'Calculate total = float(price) + float(price) * tax_rate.',
      'Use str() or print with commas to display the result.',
    ],
    bannedConcepts: ['loops', 'functions', 'if statements', 'round()', 'format()'],
    phaseLabel: 'Data Types // Room 2',
  },

  {
    id: 'data-types-room-3',
    topic: 'Data Types',
    roomNumber: 3,
    title: 'Boolean Logic',
    learningGoal: 'Evaluate expressions that produce True or False.',
    conceptSummary: 'Booleans represent truth values: True or False. Comparison operators like ==, !=, >, and < produce boolean results. You can also combine them with and, or, and not.',
    difficulty: 'beginner',
    estimatedMinutes: 12,
    starterCode: `score = 85
passing_mark = 50

# Print whether the student passed (True or False)
# Print whether the score is above 90 (True or False)
# Print whether the student passed AND scored above 90
`,
    expectedOutputHint: 'True\nFalse\nFalse',
    successCriteria: [
      'All three print statements use boolean expressions.',
      'No if statements used — only print with comparison operators.',
      'Output is True, False, False.',
    ],
    starterGuidance: [
      'Use print(score >= passing_mark) for the first line.',
      'Use print(score > 90) for the second.',
      'Combine with and for the third.',
    ],
    bannedConcepts: ['loops', 'functions', 'if statements', 'lists'],
    phaseLabel: 'Data Types // Room 3',
  },

  {
    id: 'data-types-room-4',
    topic: 'Data Types',
    roomNumber: 4,
    title: 'Introduction to Lists',
    learningGoal: 'Create a list and access its elements using index numbers.',
    conceptSummary: 'A list is an ordered collection of items. You can store different types together and access them using their position (index), starting from zero.',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    starterCode: `fruits = ["apple", "banana", "cherry"]

# Print the first fruit in the list
# Print the last fruit in the list
# Change "banana" to "blueberries" and print the whole list
`,
    expectedOutputHint: 'apple\ncherry\n[\'apple\', \'blueberries\', \'cherry\']',
    successCriteria: [
      'Access the first item using index 0.',
      'Access the last item using name or index.',
      'Successfully modify an item in the list.',
    ],
    starterGuidance: [
      'Use fruits[0] for the first item.',
      'To change an item, use fruits[1] = "blueberries".',
      'Python lists use square brackets [].',
    ],
    bannedConcepts: ['loops', 'functions', 'if statements', 'dictionaries', 'tuples'],
    phaseLabel: 'Data Types // Room 4',
  },

  // ─── TOPIC 3: CONTROL FLOW (3 rooms) ────────────────────────

  {
    id: 'control-flow-room-1',
    topic: 'Control Flow',
    roomNumber: 1,
    title: 'Pass or Fail',
    learningGoal: 'Use an if/else block to decide between two outcomes.',
    conceptSummary: 'Control flow lets your program make decisions. An if statement runs a block of code only when a condition is True. An else block runs when the condition is False.',
    difficulty: 'beginner',
    estimatedMinutes: 12,
    starterCode: `score = 73

# Print "Pass" if score is 50 or above
# Print "Fail" otherwise
`,
    expectedOutputHint: 'Pass',
    successCriteria: [
      'Uses if and else correctly.',
      'Prints Pass for score >= 50.',
      'Prints Fail for score < 50.',
    ],
    starterGuidance: [
      'Start with: if score >= 50:',
      'Indent your print statement inside the if block.',
      'Add else: and the Fail print below.',
    ],
    bannedConcepts: ['loops', 'functions', 'elif', 'lists', 'match statements'],
    phaseLabel: 'Control Flow // Room 1',
  },

  {
    id: 'control-flow-room-2',
    topic: 'Control Flow',
    roomNumber: 2,
    title: 'Grade Ladder',
    learningGoal: 'Use if/elif/else to assign one of multiple labels.',
    conceptSummary: 'When you need more than two outcomes, use elif (else if) to chain multiple conditions. Python checks each condition in order and runs the first block that matches.',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    starterCode: `score = 82

# Assign a grade label:
# 90 and above  → "A"
# 75 to 89      → "B"
# 50 to 74      → "C"
# Below 50      → "Fail"

# Print: "Grade: B"
`,
    expectedOutputHint: 'Grade: B',
    successCriteria: [
      'Uses if, elif, and else.',
      'All four grade ranges are covered.',
      'Prints the correct grade for the given score.',
    ],
    starterGuidance: [
      'Start with the highest range first: if score >= 90.',
      'Use elif for each lower range.',
      'End with else for anything below 50.',
    ],
    bannedConcepts: ['loops', 'functions', 'lists', 'dictionaries', 'match statements'],
    phaseLabel: 'Control Flow // Room 2',
  },

  {
    id: 'control-flow-room-3',
    topic: 'Control Flow',
    roomNumber: 3,
    title: 'Loop Through Scores',
    learningGoal: 'Use a for loop to apply a condition to every item in a list.',
    conceptSummary: 'A for loop repeats a block of code for each item in a sequence. Combined with if/else inside the loop, you can process every item and make decisions about each one.',
    difficulty: 'beginner',
    estimatedMinutes: 18,
    starterCode: `scores = [88, 45, 73, 92, 55]

# Loop through scores
# Print "Pass" for scores >= 50 and "Fail" for scores below 50
`,
    expectedOutputHint: 'Pass\nFail\nPass\nPass\nPass',
    successCriteria: [
      'Loop visits every score in the list.',
      'Correct label printed for each score.',
      'Five lines of output total.',
    ],
    starterGuidance: [
      'Use: for score in scores:',
      'Put the if/else block inside the loop with indentation.',
    ],
    bannedConcepts: ['functions', 'while loops', 'list comprehension', 'enumerate'],
    phaseLabel: 'Control Flow // Room 3',
  },

  {
    id: 'control-flow-room-4',
    topic: 'Control Flow',
    roomNumber: 4,
    title: 'The While Loop',
    learningGoal: 'Use a while loop to repeat code as long as a condition is True.',
    conceptSummary: 'A while loop continues to run its block of code until its condition becomes False. It is essential when you need to repeat an action an unknown number of times.',
    difficulty: 'beginner',
    estimatedMinutes: 18,
    starterCode: `count = 1

# Write a while loop that prints "Count is: X" 
# Keep looping while count is 5 or less
# Don't forget to increase count inside the loop!

`,
    expectedOutputHint: 'Count is: 1\nCount is: 2\nCount is: 3\nCount is: 4\nCount is: 5',
    successCriteria: [
      'The while loop has a clear condition.',
      'The loop body prints the count.',
      'The loop variable is incremented to avoid an infinite loop.',
    ],
    starterGuidance: [
      'Use while count <= 5: as your loop header.',
      'Add count = count + 1 at the end of your indented block.',
    ],
    bannedConcepts: ['functions', 'for loops', 'lists', 'break', 'continue'],
    phaseLabel: 'Control Flow // Room 4',
  },

  // ─── TOPIC 4: FUNCTIONS (3 rooms) ───────────────────────────

  {
    id: 'functions-room-1',
    topic: 'Functions',
    roomNumber: 1,
    title: 'Your First Function',
    learningGoal: 'Define and call a function that prints a greeting.',
    conceptSummary: 'A function is a reusable block of code you define once and call many times. Use the def keyword to define it, give it a name, and call it by writing its name followed by ().',
    difficulty: 'beginner',
    estimatedMinutes: 10,
    starterCode: `# Define a function called greet that prints "Hello, Yantra!"
# Then call the function

`,
    expectedOutputHint: 'Hello, Yantra!',
    successCriteria: [
      'Function is defined using def.',
      'Function is called after it is defined.',
      'Output matches exactly.',
    ],
    starterGuidance: [
      'Start with: def greet():',
      'Indent the print statement inside the function.',
      'Call it by writing greet() on a new line after the definition.',
    ],
    bannedConcepts: ['parameters', 'return', 'loops', 'if statements', 'arguments'],
    phaseLabel: 'Functions // Room 1',
  },

  {
    id: 'functions-room-2',
    topic: 'Functions',
    roomNumber: 2,
    title: 'Function with Parameters',
    learningGoal: 'Write a function that accepts input and uses it in output.',
    conceptSummary: 'Parameters let you pass values into a function when you call it. Inside the function, the parameter works like a variable. This makes functions flexible and reusable for different inputs.',
    difficulty: 'beginner',
    estimatedMinutes: 14,
    starterCode: `# Define a function called greet that takes a name parameter
# It should print: "Hello, Asha!" when called with "Asha"

# Call it with three different names
`,
    expectedOutputHint: 'Hello, Asha!\nHello, Dev!\nHello, Ira!',
    successCriteria: [
      'Function accepts a name parameter.',
      'Output uses the parameter value.',
      'Function is called three times with different names.',
    ],
    starterGuidance: [
      'Define as: def greet(name):',
      'Use print() with the name variable inside.',
      'Call greet("Asha"), greet("Dev"), greet("Ira") separately.',
    ],
    bannedConcepts: ['return', 'loops', 'if statements', 'default parameters', '*args'],
    phaseLabel: 'Functions // Room 2',
  },

  {
    id: 'functions-room-3',
    topic: 'Functions',
    roomNumber: 3,
    title: 'Return a Value',
    learningGoal: 'Write a function that calculates and returns a result.',
    conceptSummary: 'The return statement sends a value back from a function to the code that called it. This lets you store the result in a variable or use it in another expression.',
    difficulty: 'beginner',
    estimatedMinutes: 16,
    starterCode: `# Define a function called add that takes two numbers and returns their sum
# Store the result in a variable and print it

`,
    expectedOutputHint: '15',
    successCriteria: [
      'Function uses return to send back the sum.',
      'Result is stored in a variable.',
      'Correct sum is printed.',
    ],
    starterGuidance: [
      'Define as: def add(a, b):',
      'Use return a + b inside.',
      'Call it: result = add(7, 8) then print(result).',
    ],
    bannedConcepts: ['loops', 'if statements', 'default parameters', 'multiple return values'],
    phaseLabel: 'Functions // Room 3',
  },

  {
    id: 'functions-room-4',
    topic: 'Functions',
    roomNumber: 4,
    title: 'Default Parameters',
    learningGoal: 'Create a function with a default parameter value.',
    conceptSummary: 'Default parameters allow you to call a function without providing all the arguments. If an argument is missing, Python uses the predefined default value.',
    difficulty: 'beginner',
    estimatedMinutes: 16,
    starterCode: `# Define a function "greet" with a parameter "name"
# Set the default value of "name" to "Guest"
# The function should print "Welcome, [name]!"

# Call greet() with no name
# Call greet() with "Asha"
`,
    expectedOutputHint: 'Welcome, Guest!\nWelcome, Asha!',
    successCriteria: [
      'Function definition includes a default value (name="Guest").',
      'The first call prints the default greeting.',
      'The second call overrides the default with "Asha".',
    ],
    starterGuidance: [
      'Define as: def greet(name="Guest"):',
      'Call simply as greet() then greet("Asha").',
    ],
    bannedConcepts: ['loops', 'if statements', '*args', '**kwargs', 'return'],
    phaseLabel: 'Functions // Room 4',
  },

];
