INSERT INTO department (name) VALUES
('Sales'),
('Marketing'),
('Engineering'),
('HR'),
('Finance');

INSERT INTO role (title, salary, department_id) VALUES
('Sales Manager', 100000.00, 1),
('Sales Associate', 50000.00, 1),
('Marketing Manager', 95000.00, 2),
('Marketing Associate', 45000.00, 2),
('Software Engineer', 120000.00, 3),
('Senior Software Engineer', 150000.00, 3),
('HR Manager', 90000.00, 4),
('HR Assistant', 40000.00, 4),
('Financial Analyst', 80000.00, 5),
('Finance Manager', 110000.00, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('John', 'Doe', 1, NULL),  -- Sales Manager, no manager
('Jane', 'Smith', 2, 1),   -- Sales Associate, managed by John
('Emma', 'Johnson', 3, NULL),  -- Marketing Manager, no manager
('Olivia', 'Brown', 4, 3),    -- Marketing Associate, managed by Emma
('Liam', 'Davis', 5, NULL),    -- Software Engineer, no manager
('Noah', 'Wilson', 6, 5),    -- Senior Software Engineer, managed by Liam
('Sophia', 'Moore', 7, NULL),    -- HR Manager, no manager
('Isabella', 'Taylor', 8, 7),    -- HR Assistant, managed by Sophia
('Mason', 'Anderson', 9, NULL),    -- Financial Analyst, no manager
('Ava', 'Thomas', 10, 9);    -- Finance Manager, managed by Mason