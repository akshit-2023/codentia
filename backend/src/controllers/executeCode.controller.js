import {
  getLanguageName,
  pollBatchResults,
  submitBatch,
} from "../libs/judge0.lib.js";
import { db } from "../libs/db.js";

export const executeCode = async (req, res) => {
  try {
    const { source_code, language_id, stdin, expected_outputs, problemID } =
      req.body;

    const userId = req.user.id;

    //validate testcases

    if (
      !Array.isArray(stdin) ||
      stdin.length === 0 ||
      !Array.isArray(expected_outputs) ||
      expected_outputs.length !== stdin.length
    ) {
      return res.status(400).json({
        error: "Invalid or missing test cases",
      });
    }

    //Prepare each testcase for judge0 batch submission
    const submissions = stdin.map((input) => ({
      source_code,
      language_id,
      stdin: input,
    }));

    //send batch of submissions to judge0

    const submitResponse = await submitBatch(submissions);

    //We now have the tokens as array of objects

    const tokens = submitResponse.map((res) => res.token); //tokens as array of strings

    //poll judge0 for results of all submitted test cases
    const results = await pollBatchResults(tokens);

    console.log(`Results-----`, results);

    //Analyze test case results

    let allPassed = true;
    const detailedResults = results.map((result, i) => {
      const stdout = result.stdout?.trim();
      const expected_output = expected_outputs[i]?.trim();
      const passed = stdout === expected_output;

      if (!passed) {
        allPassed = false;
      }
      // console.log(`Testcase ${i + 1}`);
      // console.log(`Input-${stdin[i]}`);
      // console.log(`Expected output-${expected_outputs[i]}`);
      // console.log(`output from judge0-${stdout}`);
      // console.log(`Matched?:${passed}`);

      return {
        testCase: i + 1,
        passed: passed,
        stdout: stdout,
        expected: expected_output,
        stderr: result.stderr || null,
        compileOutput: result.compile_output || null,
        status: result.status.description,
        memory: result.memory ? `${result.memory} KB` : undefined,
        time: result.time ? `${result.time} s` : undefined,
      };
    });

    console.log(detailedResults);

    //Store this result in the database
    const submission = await db.submission.create({
      data: {
        userID: userId,
        problemID: problemID,
        sourceCode: source_code,
        language: getLanguageName(language_id),
        stdin: stdin.join("\n"),
        stdout: JSON.stringify(detailedResults.map((r) => r.stdout)),
        stderr: detailedResults.some((r) => r.stderr)
          ? JSON.stringify(detailedResults.map((r) => r.stderr))
          : null,
        compileOutput: detailedResults.some((r) => r.compileOutput)
          ? JSON.stringify(detailedResults.map((r) => r.compileOutput))
          : null,
        status: allPassed ? "Accepted" : "Wrong Answer",
        memory: detailedResults.some((r) => r.memory)
          ? JSON.stringify(detailedResults.map((r) => r.memory))
          : null,
        time: detailedResults.some((r) => r.time)
          ? JSON.stringify(detailedResults.map((r) => r.time))
          : null,
      },
    });

    //if all testcases are passed then mark problem as done for current user
    if (allPassed) {
      //if record exists then update it else create it
      await db.problemSolved.upsert({
        where: {
          userID_problemID: {
            userID: userId,
            problemID,
          },
        },
        update: {},
        create: {
          userID: userId,
          problemID,
        },
      });
    }

    //Save individual test case results using detailedResults

    const testCaseResults = detailedResults.map((result) => ({
      submissionID: submission.id,
      testCase: result.testCase,
      passed: result.passed,
      stdout: result.stdout,
      expected: result.expected,
      stderr: result.stderr,
      compileOutput: result.compileOutput,
      status: result.status,
      memory: result.memory,
      time: result.time,
    }));

    await db.testCaseResult.createMany({
      data: testCaseResults,
    });

    const submissionWithTestCase = await db.submission.findUnique({
      where: {
        id: submission.id,
      },
      include: {
        testCases: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Code executed successfully",
      submission: submissionWithTestCase,
    });
  } catch (error) {
    console.log(`Error while executing code: ${error.message}`);
    return res.status(500).json({
      error: "Failed to execute code",
    });
  }
};
