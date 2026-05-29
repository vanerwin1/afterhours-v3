-- Add Lead model for capturing website form submissions
-- (contact forms, demo requests, ROI calculator finishes, etc.)

CREATE TABLE "Lead" (
    "id"         TEXT        NOT NULL,
    "name"       TEXT,
    "email"      TEXT        NOT NULL,
    "phone"      TEXT,
    "company"    TEXT,
    "industry"   TEXT,
    "message"    TEXT,
    "source"     TEXT        NOT NULL DEFAULT 'website',
    "utm"        JSONB,
    "referrer"   TEXT,
    "pagePath"   TEXT,
    "status"     TEXT        NOT NULL DEFAULT 'new',
    "assignedTo" TEXT,
    "notes"      TEXT,
    "ip"         TEXT,
    "userAgent"  TEXT,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Lead_email_idx"     ON "Lead"("email");
CREATE INDEX "Lead_status_idx"    ON "Lead"("status");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX "Lead_source_idx"    ON "Lead"("source");
