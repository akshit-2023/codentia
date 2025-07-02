import { db } from "../libs/db.js";

export const createPlaylist = async (req, res) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.id;

    const playlist = await db.playlist.create({
      data: {
        name,
        description,
        userID: userId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Playlist created successfully",
      playlist,
    });
  } catch (error) {
    console.error("Error creating new playlist");
    return res.status(500).json({ error: "Failed to create new playlist" });
  }
};

export const getAllListDetails = async (req, res) => {
  try {
    const playlists = await db.playlist.findMany({
      where: {
        userID: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playlists,
    });
  } catch (error) {
    console.error("Error in fetching playlist");
    return res.status(500).json({ error: "Failed to fetch playlist" });
  }
};

export const getPlayListDetails = async (req, res) => {
  const { playlistId } = req.params;

  try {
    //Change to findFirst if this does not work(************IMPORTANT************)
    const playlist = await db.playlist.findUnique({
      where: {
        id: playlistId,
        userID: req.user.id,
      },
      include: {
        problems: {
          include: {
            problem: true,
          },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playlist,
    });
  } catch (error) {
    console.error("Error in fetching playlist");
    return res.status(500).json({ error: "Failed to fetch playlist" });
  }
};

export const addProblemToPlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemsId" });
    }

    //create records for each problems in the playlist

    const problemsInPlaylist = await db.problemInPlayList.createMany({
      data: problemIds.map((problemId) => ({
        playlistID: playlistId,
        problemID: problemId,
      })),
    });

    return res.status(201).json({
      success: true,
      message: "Problems added to playlist successfully",
      problemsInPlaylist,
    });
  } catch (error) {
    console.error("Error in adding problem in playlist", error);
    return res.status(500).json({ error: "Failed to add problem to playlist" });
  }
};

export const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const deletedPlaylist = await db.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
      deletedPlaylist,
    });
  } catch (error) {
    console.error("Error deleting playlist");
    return res.status(500).json({ error: "Failed to delete playlist" });
  }
};

export const removeProblemFromPlayList = async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  try {
    if (!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({ error: "Invalid or missing problemsId" });
    }

    const deletedProblem = await db.problemInPlayList.deleteMany({
      where: {
        playlistID: playlistId,
        problemID: {
          in: problemIds,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Problem in playlist deleted successfully",
      deletedProblem,
    });
  } catch (error) {
    console.error("Error deleting problem in playlist");
    return res
      .status(500)
      .json({ error: "Failed to delete problem in playlist" });
  }
};
