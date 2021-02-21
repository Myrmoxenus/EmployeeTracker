/* Seeds the SQL Table for Easier Development*/

INSERT INTO department (name)
VALUES 
("Department 1"),
("Department A"),
("Department I"),
("Department 0"),
("Another Department");

INSERT INTO roles (title, salary, department_id)
VALUES 
("Bard", 20, 1),
("Darth", 3000, 1),
("Soup", 200000, 2),
("Soup Warrior", 2000, 2),
("Orangutan Wrangler", 50000, 3),
("Deadbeat", 10000, 4),
("Fake Phone Number Composer", 555, 5),
("Orc", 70000, 5),
("Webcomic Copy Editor", 200, 5);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
("Chicken", "Andnoodle", 3, 1),
("Vurbag", "Eagungad", 8, 1),
("Snakha", "Umhra", 8, 1),
("Sarfu", "Azuk", 8, 1),
("Ulumpha", "Mor", 8, 1),
("Lash", "Bula", 8, 1),
("Bulfim", "Budurash", 8, 1),
("Grazob", "Hrolkug", 8, 1);
