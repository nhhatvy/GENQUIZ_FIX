-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "bio" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "banned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "avatarUrl" TEXT
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "teacherId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "classId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Enrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'Medium',
    "timeLimit" INTEGER NOT NULL DEFAULT 15,
    "passingScore" INTEGER NOT NULL DEFAULT 70,
    "visibility" TEXT NOT NULL DEFAULT 'Private',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "creationMethod" TEXT NOT NULL DEFAULT 'MANUAL',
    "creatorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quiz_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "points" INTEGER NOT NULL DEFAULT 10,
    "order" INTEGER NOT NULL DEFAULT 0,
    "quizId" TEXT NOT NULL,
    CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "questionId" TEXT NOT NULL,
    CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "pin" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Upcoming',
    "scheduledAt" DATETIME,
    "durationMinutes" INTEGER NOT NULL DEFAULT 45,
    "targetClass" TEXT,
    "classId" TEXT,
    "invitedEmails" TEXT,
    "studentCreatorId" TEXT,
    "quizId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" DATETIME,
    CONSTRAINT "Session_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Session_studentCreatorId_fkey" FOREIGN KEY ("studentCreatorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Session_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nickname" TEXT NOT NULL,
    "totalScore" REAL NOT NULL DEFAULT 0,
    "maxScore" REAL NOT NULL DEFAULT 0,
    "timeTakenSeconds" INTEGER NOT NULL DEFAULT 0,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Submission_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "quizId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Answer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "selectedOptionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "submissionId" TEXT NOT NULL,
    CONSTRAINT "Answer_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionBank" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceFile" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QuestionBank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BankQuestion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "difficulty" TEXT NOT NULL DEFAULT 'Medium',
    "points" INTEGER NOT NULL DEFAULT 10,
    "order" INTEGER NOT NULL DEFAULT 0,
    "bankId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BankQuestion_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "QuestionBank" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BankOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "questionId" TEXT NOT NULL,
    CONSTRAINT "BankOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "BankQuestion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Class_teacherId_idx" ON "Class"("teacherId");

-- CreateIndex
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_classId_userId_key" ON "Enrollment"("classId", "userId");

-- CreateIndex
CREATE INDEX "Quiz_creatorId_idx" ON "Quiz"("creatorId");

-- CreateIndex
CREATE INDEX "Quiz_category_idx" ON "Quiz"("category");

-- CreateIndex
CREATE INDEX "Question_quizId_idx" ON "Question"("quizId");

-- CreateIndex
CREATE INDEX "Option_questionId_idx" ON "Option"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_pin_key" ON "Session"("pin");

-- CreateIndex
CREATE INDEX "Session_quizId_idx" ON "Session"("quizId");

-- CreateIndex
CREATE INDEX "Session_studentCreatorId_idx" ON "Session"("studentCreatorId");

-- CreateIndex
CREATE INDEX "Submission_sessionId_idx" ON "Submission"("sessionId");

-- CreateIndex
CREATE INDEX "Submission_userId_idx" ON "Submission"("userId");

-- CreateIndex
CREATE INDEX "Report_quizId_idx" ON "Report"("quizId");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE UNIQUE INDEX "Report_quizId_reporterId_key" ON "Report"("quizId", "reporterId");

-- CreateIndex
CREATE INDEX "Answer_submissionId_idx" ON "Answer"("submissionId");

-- CreateIndex
CREATE INDEX "Answer_questionId_idx" ON "Answer"("questionId");

-- CreateIndex
CREATE INDEX "QuestionBank_userId_idx" ON "QuestionBank"("userId");

-- CreateIndex
CREATE INDEX "BankQuestion_bankId_idx" ON "BankQuestion"("bankId");

-- CreateIndex
CREATE INDEX "BankOption_questionId_idx" ON "BankOption"("questionId");
