# Assignment 4 Submission

  **Name:** Yonas Melkie
  **Student ID:** 920771108
  **GitHub Repository:** https://github.com/yoni4848/CSC317/tree/main/assignments/4 
  **GitHub Pages URL:**  https://yoni4848.github.io/CSC317/assignments/4/index.html


## Project Overview

This project is a web-based calculator that works like a phone calculator app. Users can perform basic math operations through button clicks or keyboard input.

## Features

The calculator includes:
- Basic operations: addition, subtraction, multiplication, and division
- Percent calculation for finding percentages
- Clear button to reset the calculator
- Backspace to delete one digit at a time
- Sign toggle button to switch between positive and negative numbers
- Decimal point support for precise calculations

## Implementation

The calculator uses HTML for structure, CSS for styling, and JavaScript for functionality. The display shows input numbers and results. Event listeners capture both button clicks and keyboard presses, making the calculator easy to use.

Error handling prevents crashes from invalid operations like dividing by zero. The code separates each math operation into its own function for clarity. Variables track the current state, including the first number, second number, and selected operation.

## Keyboard Support

Users can type numbers and operators directly. The Enter key works as equals, Backspace deletes digits, and Escape resets the calculator completely.

## Challenges and Solutions

**Challenge 1: Managing Calculator State**
- Problem: Keeping track of when to clear the display and when to append digits was complex, especially after showing results.
- Solution: Implemented state flags (`waitingNum2` and `resultShown`) to track whether the calculator is waiting for the second number or has just displayed a result, allowing proper display behavior.

**Challenge 2: Handling Decimal Point Input**
- Problem: Needed to prevent multiple decimal points in a single number and handle decimal display properly.
- Solution: Used conditional logic to check display content before allowing decimal input, ensuring proper validation.

**Challenge 3: Keyboard and Click Event Synchronization**
- Problem: Had to ensure both keyboard and button clicks worked consistently and maintained the same state.
- Solution: Created separate event listeners for keyboard and click events, but used the same state variables and logic flow to maintain consistency.

**Challenge 4: Formatting Large Numbers and Decimals**
- Problem: Display needed to show appropriate formats for different number types (decimals, large numbers).
- Solution: Added conditional formatting using `toFixed(2)` for decimals and `toExponential(2)` for numbers >= 10000.

## Additional Features

Beyond the basic requirements, I implemented:
- **Keyboard support** including Escape key to clear calculator
- **Backspace functionality** to delete single digits
- **Result formatting** that automatically formats decimals to 2 places and converts large numbers to scientific notation
- **Error handling** for division by zero with "Err!" message

## Resources and Acknowledgments

- **MDN Web Docs**: Referenced for JavaScript event listener syntax and DOM manipulation methods
- **CSS Grid Layout**: Used MDN documentation for creating the calculator button grid
- **Claude Code**: Used for debugging assistance and code organization suggestions
- **Class lecture materials**: Used CSC 317 lecture examples for JavaScript fundamentals and DOM manipulation concepts
