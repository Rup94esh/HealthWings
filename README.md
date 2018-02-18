# HealthWings

we set our port to 3000;
use localhost:3000 to open the login page,
I uses mongoDB database as a nosql database and nodejs.
I already set the email and hashed password.
I use the 'bcryptjs' to hash the password.
I set the email=rupesh.1513075@kiet.edu & password=1234;
on submitting the login form goto url app.post('/login'), 
where we first check the email and if find then compare the hashed password using bcrypt.compare.
After successfully login i generate the token using jsonwebtoken and assign user email and ID to jwt 
and we add that token in express session so we can use that token further later.
and redirect to /dashboard where user has to fill some form
then post it to /submitform where is check email and number validation if (true) then submit the form else throw error.
