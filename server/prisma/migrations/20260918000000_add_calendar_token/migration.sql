-- Store a private, revocable token for each user's iCalendar subscription.
ALTER TABLE "User" ADD COLUMN "calendarToken" TEXT;

CREATE UNIQUE INDEX "User_calendarToken_key" ON "User"("calendarToken");
