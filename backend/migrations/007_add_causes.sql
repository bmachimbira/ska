-- Create causes/projects table
CREATE TABLE IF NOT EXISTS cause (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  goal_amount DECIMAL(10, 2),
  raised_amount DECIMAL(10, 2) DEFAULT 0,
  thumbnail_asset UUID,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for active and featured causes
CREATE INDEX idx_cause_active ON cause(is_active);
CREATE INDEX idx_cause_featured ON cause(is_featured);
CREATE INDEX idx_cause_dates ON cause(start_date, end_date);
