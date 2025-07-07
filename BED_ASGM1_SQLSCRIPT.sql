-- Create AccountPassword table
create database BED_ASGM1



CREATE TABLE AccountPassword (
    id INT PRIMARY KEY IDENTITY(1,1),
    phone_number VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Insert users into AccountPassword
INSERT INTO AccountPassword (phone_number, password) VALUES
('11111111', 'pass123'),
('22222222', 'pass123'),
('33333333', 'pass123'),
('44444444', 'pass123!'),
('90001111', 'test@123');

-- Create AccountProfile table
CREATE TABLE AccountProfile (
    id INT PRIMARY KEY,  -- references AccountPassword.id
    name VARCHAR(100) NOT NULL,
    account_type CHAR(1) NOT NULL CHECK (account_type IN ('e', 'c', 'o')),
    email VARCHAR(100) NULL,
    gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F', 'O')),
    date_of_birth DATE NOT NULL,
    preferred_language VARCHAR(30) NOT NULL,
    pfp_link VARCHAR(300) NULL,
    FOREIGN KEY (id) REFERENCES AccountPassword(id)
);

-- Insert profiles into AccountProfile
INSERT INTO AccountProfile (id, name, account_type, email, gender, date_of_birth, preferred_language, pfp_link) VALUES
(1, 'Marcus Ong', 'e', 'marcusong@gmail.com', 'M', '2007-09-02', 'English', 'https://res.cloudinary.com/dmnipl0gl/image/upload/v1751283571/IMG20250601231047_mvcbjb.jpg'),
(2, 'Belle Chong', 'c', 'bellechong@gmail.com', 'F', '2007-05-14', 'Mandarin', 'https://res.cloudinary.com/dmnipl0gl/image/upload/v1751284201/IMG-20250630-WA0006_jpmbkv.jpg'),
(3, 'ActiveSG.ORG', 'o', 'activeSG@connect.sg', 'O', '2014-04-01', 'English', NULL),
(4, 'Dylan Lee', 'o', 'dylan.lee@email.com', 'M', '1990-01-15', 'English', NULL),
(5, 'Grace Koh', 'c', 'grace.koh@email.com', 'F', '1985-11-05', 'Tamil', NULL);

-- Create MedicationList table
CREATE TABLE MedicationList (
    med_id INT PRIMARY KEY IDENTITY(1,1),
    account_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(200) NULL,
    dosage VARCHAR(50) NOT NULL,
    time TIME NULL,
    frequency VARCHAR(2) NOT NULL CHECK (frequency IN ('D', 'W', 'M', 'WR')),
    start_date DATE NOT NULL,
    FOREIGN KEY (account_id) REFERENCES AccountPassword(id)
);

-- Insert medications for account_id = 1
INSERT INTO MedicationList (account_id, name, description, dosage, time, frequency, start_date) VALUES
(1, 'Lisinopril', 'Used to treat high blood pressure', '2 pills', '08:00', 'D', '2025-06-01'),
(1, 'Paracetamol', 'Take only if fever exceeds 38°C', '1 tablet', NULL, 'WR', '2025-06-01'),
(1, 'Alendronate', 'Bone strength supplement, once every Monday', '1 tablet', '07:00', 'W', '2025-06-01'),
(1, 'Metformin', 'Blood sugar control', '1 pill', '20:00', 'D', '2025-06-01');

-- Create EventList table
CREATE TABLE EventList (
    id INT PRIMARY KEY IDENTITY(1,1),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(100) NOT NULL,
    org_id INT NOT NULL,
    weekly BIT NOT NULL,
    equipment_required VARCHAR(300) NULL,
    FOREIGN KEY (org_id) REFERENCES AccountProfile(id)
);

-- Insert events by org_id = 3 (ActiveSG.ORG)
INSERT INTO EventList (name, description, date, time, location, org_id, weekly, equipment_required) VALUES
('Morning Tai Chi', 
 'Join us for a refreshing Tai Chi session in the park to improve flexibility and balance.', 
 '2025-07-01', '07:30', 
 'Marymount Community Centre Garden', 3, 1, NULL),

('Health Talk: Managing Blood Pressure', 
 'A short seminar led by a certified nurse about controlling high blood pressure through lifestyle.', 
 '2025-07-10', '10:00', 
 'Community Hall A, Marymount CC', 3, 0, 
 'Pen & Paper (for taking notes and simple activities)'),

('Creative Art Class', 
 'Weekly creative workshop with painting, drawing, and crafts. Materials provided.', 
 '2025-07-03', '14:00', 
 'Studio Room, Marymount CC', 3, 1, 
 'Art materials (eg. brushes, crayons, paint (if you have))'),

('Bingo Night', 
 'Fun evening event with prizes, snacks, and socializing. All seniors welcome!', 
 '2025-07-15', '18:00', 
 'Event Hall, Marymount CC', 3, 0, NULL),

('Chair Yoga for Seniors', 
 'Gentle seated yoga exercises to promote mobility and calm the mind. Led by a certified instructor.', 
 '2025-07-05', '09:00', 
 'Activity Room B, Marymount CC', 3, 1, 
 'Comfortable clothing and water bottle');

-- Create RegisteredList table
CREATE TABLE RegisteredList (
    reg_id INT PRIMARY KEY IDENTITY(1,1),
    account_id INT NOT NULL,
    event_id INT NOT NULL,
    FOREIGN KEY (event_id) REFERENCES EventList(id),
    FOREIGN KEY (account_id) REFERENCES AccountPassword(id)
);

-- Insert registrations for account_id = 1
INSERT INTO RegisteredList (account_id, event_id) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 5);

Create table MonthlyExpenseGoal(
	id INT PRIMARY KEY,
	monthly_goal DECIMAL(10, 2)

	FOREIGN KEY (id) REFERENCES AccountPassword(id)
)

Insert INTO MonthlyExpenseGoal(id, monthly_goal)
VALUES
(1, 5000)


Create table ExpensesList(
	entry_id INT PRIMARY KEY IDENTITY(1,1),
	name VARCHAR(50) NOT NULL,
	description VARCHAR(500) NULL,
	amount DECIMAL(10,2) NOT NULL,
	acc_id INT NOT NULL,

	FOREIGN KEY (acc_id) REFERENCES AccountPassword(id)
)

INSERT INTO ExpensesList (name, description, amount, acc_id)
VALUES 
('Groceries', 'Weekly grocery shopping at Tesco', 120.50, 1),
('Electric Bill', 'June 2025 TNB bill', 75.20, 1),
('Fuel', 'Petrol for commuting', 60.00, 1),
('Dining', 'Dinner at a local restaurant', 45.90, 1),
('Internet', 'Unifi monthly plan', 89.99, 1),
('Gym', 'Monthly membership fee', 110.00, 1),
('Stationery', 'Office supplies from Popular', 25.30, 1),
('Streaming', 'Netflix monthly subscription', 55.00, 1);


select * from MedicationList;