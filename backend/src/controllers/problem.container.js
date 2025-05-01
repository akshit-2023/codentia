import { db } from "../libs/db.js";
import { getJudge0LanguageId } from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
  //get all the data from request body
  const {
    title,
    description,
    difficulty,
    tags,
    examples,
    constraints,
    testcases,
    codeSnippet,
    referenceSolution,
  } = req.body;

  //check the role of the user once again(Admin or not?)

  if (req.user.role !== "ADMIN") {
    res.status(403).json({
      error: "You are not allowed to create a problem",
    });
  }

  //Loop through each reference solution for different languages

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolution)) {
      const languageID = getJudge0LanguageId(language); //get the languageID
      if (!languageID) {
        return res.status(400).json({
          error: `Language ${language} is not supported`,
        });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageID,
        stdin: input,
        expected_output: output,
      }));

      const submissionResult = await submitBatch(submissions);

      const tokens = submissionResult.map((res) => res.token); //{token:"db54881d-bcf5-4c7b-a2e3-d33fe7e25de7"}, we only want token so map is used

      //getting the results
      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.status_id !== 3) {
          return res.status(400).json({
            error: `error: Testcase-${i + 1} failed for language-${language}`,
          });
        }
      }

      //save the problem to the database

      const newProblem = await db.problem.create({
        data: {
          title,
          description,
          difficulty,
          tags,
          examples,
          constraints,
          testcases,
          codeSnippet,
          referenceSolution,
          userID: req.user.id,
        },
      });

      return res.status(201).json(newProblem);
    }
  } catch (error) {}
};

export const getAllProblems = async (req, res) => {};

export const getProblemById = async (req, res) => {};

export const updateProblem = async (req, res) => {};

export const deleteProblem = async (req, res) => {};

export const getAllProblemsSolvedByUser = async (req, res) => {};
