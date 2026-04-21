-- Migration script: Add complaint_attachments table
-- Run this script after deploying the updated code with the ComplaintAttachment model

CREATE TABLE IF NOT EXISTS complaint_attachments (
    attachment_id SERIAL PRIMARY KEY,
    complaint_id INTEGER NOT NULL REFERENCES complaints(complaint_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(32) NOT NULL,
    mime_type VARCHAR(64) NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_complaint_attachments_complaint_id FOREIGN KEY (complaint_id) REFERENCES complaints(complaint_id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_complaint_attachments_complaint_id ON complaint_attachments(complaint_id);
