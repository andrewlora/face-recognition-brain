-- Seed data with a fake user for testing!

insert into users (name, email, entries, joined) values ('sally', 'sally@gmail.com', 5, '2018-01-01');
insert into login (hash, email) values ('$2a$08$XoIGU6yKl0.ChGNsgMfpuOwwyodhQ5nw/TNG.KBrj0A.4MX4o3FGi', 'sally@gmail.com');


