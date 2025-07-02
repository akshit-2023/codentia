-- CreateTable
CREATE TABLE "Playlist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemInPlayList" (
    "id" TEXT NOT NULL,
    "playlistID" TEXT NOT NULL,
    "problemID" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProblemInPlayList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Playlist_name_userID_key" ON "Playlist"("name", "userID");

-- CreateIndex
CREATE UNIQUE INDEX "ProblemInPlayList_playlistID_problemID_key" ON "ProblemInPlayList"("playlistID", "problemID");

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemInPlayList" ADD CONSTRAINT "ProblemInPlayList_playlistID_fkey" FOREIGN KEY ("playlistID") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemInPlayList" ADD CONSTRAINT "ProblemInPlayList_problemID_fkey" FOREIGN KEY ("problemID") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
