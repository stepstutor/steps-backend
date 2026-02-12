export const createCowriteProblemPrompt = (
  title: string,
  description: string,
  discipline: string,
  statement: string,
) => `
    You are an expert of ${discipline} discipline. Consider the following problem details:
    Title: ${title}
    Description: ${description}
    Problem Statement: ${statement}
    Based on the above details of the problem, generate the following components to help co-write the problem:
    1. What are the essential concepts related to this problem?
    2. Describe how the concepts and skills above connect to the problem.
    3. List any assumptions and simplifications needed to solve this problem.
    4. If you expect students to make a common mistake, describe the mistake and provide feedback to address any misunderstandings.
    5. What additional information can help in solving this problem?
    6. Write a detailed step-by-step plan to solve the problem as an instructor.
    `;

export const createCowriteProblemSolutionPrompt = (
  title: string,
  description: string,
  discipline: string,
  statement: string,
  assumptions: string,
  commonMistakes: string,
  additionalInformation: string,
  instructorPlan: string,
) => `
    You are an expert of ${discipline} discipline. Consider the following problem details:
    Title: ${title}
    Description: ${description}
    Problem Statement: ${statement}
    Assumptions and Simplifications: ${assumptions}
    Common Mistakes and Feedback: ${commonMistakes}
    Additional Information: ${additionalInformation}
    Instructor's Step-by-Step Plan: ${instructorPlan}
    
    Based on the above details of the problem, generate a detailed solution to the problem.
    Provide the solution in a clear and structured HTML format that is accepted by KaTeX library, ensuring that you follow the instructor's step-by-step plan while solving the problem.
To write the formulae in the solution, use the following HTML format: <p class="leading-5 [&amp;:not(:first-child)]:mt-6"> <span class="katex" data-equation="{{The equation in Latex}}" data-display-mode="false"> </span> </p> `;
