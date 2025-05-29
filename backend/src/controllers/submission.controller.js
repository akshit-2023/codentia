import { db } from "../libs/db.js";

export const getAllSubmission = async (req, res) => {
  try {
    const userId = req.user.id;
    const submissions = await db.submission.findMany({
      where: {
        userID: userId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      count: submissions,
    });
  } catch (error) {
    console.error("Fetch submissions error:", error);
    res.status(500).json({
      message: "Failed to fetch submissions",
    });
  }
};

export const getSubmissionsForProblem = async (req, res) => {
  try {
    const userId = req.user.id;
    const problemId = req.params.problemID;
    const submissions = await db.submission.findMany({
      where: {
        userID: userId,
        problemID: problemId,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      submissions,
    });
  } catch (error) {
    console.error("Fetch submissions error:", error);
    res.status(500).json({
      message: "Failed to fetch submissions",
    });
  }
};

export const getAllTheSubmissionsForProblem = async (req, res) => {
  try {
    const problemId = req.params.problemID;
    const submissions = await db.submission.count({
      where: {
        problemID: problemId,
      },
    });
    res.status(200).json({
      success: true,
      message: "Submissions fetched successfully",
      submissions,
    });
  } catch (error) {
    console.error("Fetch submissions error:", error);
    res.status(500).json({
      message: "Failed to fetch submissions",
    });
  }
};
