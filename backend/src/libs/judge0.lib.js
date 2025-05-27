import axios from "axios";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getJudge0LanguageId = (language) => {
  const languageMap = {
    PYTHON: 71,
    JAVA: 62,
    JAVASCRIPT: 63,
  };
  return languageMap[language.toUpperCase()];
};

export const submitBatch = async (submissions) => {
  const options = {
    method: "POST",
    url: "https://judge0-ce.p.sulu.sh/submissions/batch",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${process.env.SULU_JUDGE_SECRET}`,
    },
    data: {
      submissions: submissions,
    },
  };

  try {
    const { data } = await axios.request(options);
    console.log("Submission Results:", data);
    return data;
  } catch (error) {
    console.error("Submission error:", error);
    throw error; // Optionally rethrow the error
  }
};
export const pollBatchResults = async (tokens) => {
  const options = {
    method: "GET",
    url: "https://judge0-ce.p.sulu.sh/submissions/batch",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${process.env.SULU_JUDGE_SECRET}`,
    },
    params: {
      tokens: tokens.join(","),
      base64_encoded: false,
    },
  };

  while (true) {
    try {
      const { data } = await axios.request(options);
      const results = data.submissions;
      console.log(results.length);
      console.log(results);

      const isAllDone = results.every(
        (r) => r.status.id !== 1 && r.status.id !== 2
      );

      if (isAllDone) {
        return results;
      }

      // Wait for 1 second
      await sleep(1000);
    } catch (error) {
      console.error("Polling error:", error);
      throw error; // Optionally rethrow if you want the caller to handle it
    }
  }
};
