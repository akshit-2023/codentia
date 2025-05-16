import { db } from "../libs/db.js";
import { getJudge0LanguageId } from "../libs/judge0.lib.js";
import { submitBatch, pollBatchResults } from "../libs/judge0.lib.js";

export const createProblem = async (req, res) => {
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

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "You are not allowed to create a problem",
    });
  }

  let newProblem; // 🔧 declare it here so it's available after the loop

  try {
    for (const [language, solutionCode] of Object.entries(referenceSolution)) {
      const languageID = getJudge0LanguageId(language);
      if (!languageID) {
        return res.status(400).json({
          error: `Language ${language} is not supported`, // 🔧 fixed template string
        });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageID,
        stdin: input,
        expected_output: output,
      }));

      const submissionResult = await submitBatch(submissions);
      const tokens = submissionResult.map((res) => res.token);

      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Testcase-${i + 1} failed for language-${language}`, // 🔧 fixed template string
          });
        }
      }
    }
    // ✅ save the problem after passing all tests
    try {
      newProblem = await db.problem.create({
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
      console.log(newProblem);
    } catch (error) {
      console.log("DB Error:", error);
      return res.status(500).json({ error: "Failed to save problem to DB" });
    }

    // ✅ Send response using newProblem
    return res.status(201).json({
      success: true,
      message: "Problem created successfully",
      problem: newProblem,
    });
  } catch (error) {
    console.error("Error creating problem:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllProblems = async (req, res) => {};

export const getProblemById = async (req, res) => {};

export const updateProblem = async (req, res) => {};

export const deleteProblem = async (req, res) => {};

export const getAllProblemsSolvedByUser = async (req, res) => {};
