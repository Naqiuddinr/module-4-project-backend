const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require("dotenv").config();

// mailgun additional
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const { MAILGUN_API_KEY } = process.env;

const mg = mailgun.client({
    username: "api",
    key: MAILGUN_API_KEY,
});
// mailgun additional

const { DATABASE_URL } = process.env;

const app = express()
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});

async function getPostgresVersion() {
    const client = await pool.connect();

    try {

        const response = await client.query("SELECT version()");
        console.log(response.rows)

    } catch (err) {

        console.error(err.message)

    } finally {

        client.release();

    }
}

getPostgresVersion();

//////////////BEGINNING//////////////

//////////////USER ENDPOINT//////////////

//END POINT FOR USER SIGNUP

app.post("/users", async (req, res) => {
    const client = await pool.connect();
    const { firebase_uid, email, username } = req.body;

    try {
        await client.query(
            `INSERT INTO users (firebase_uid, email, username, profile_pic) VALUES ($1,$2, 
        CASE 
              WHEN $3 = '' THEN CONCAT('username', substring(md5(random()::text), 1, 8))
              ELSE $3
        END,
        'https://firebasestorage.googleapis.com/v0/b/tadel-app.appspot.com/o/tasks%2Fdepositphotos_137014128-stock-illustration-user-profile-icon.jpg?alt=media&token=f0c021cc-33b8-437f-a624-49eb486788b8')
  RETURNING *`,
            [firebase_uid, email, username],
        );

        await client.query(
            `
        INSERT INTO 
          tasks (title, content, status, start_date, end_date, urgent, assignee, originator, color_tag, fileurl, originator_id, assignee_id)
        SELECT
  'Click Me!',
  'Thank you for signing up with Tadel and Congratulation for viewing your first task! 
                          
  You can click anywhere outside of the box to dismiss and we suggest you to view our "User Guide" if you are a first timer.
  We hope you enjoy using Tadel!',
  'pending',
  null,
  CURRENT_DATE,
  true,
  $1,
  $1,
  '#cdd873',
  null,
  u1.firebase_uid AS originator_id,
  u2.firebase_uid AS assignee_id
        FROM
  users u1
        JOIN
  users u2 ON u1.email = $1 AND u2.email = $1
        RETURNING *;`,
            [email],
        );

        await client.query(
            `
        INSERT INTO 
          tasks (title, content, status, start_date, end_date, urgent, assignee, originator, color_tag, fileurl, originator_id, assignee_id)
        SELECT
  'User Guide #1',
  'Now that you know how to view task, lets add a new task! 
  
  From your dashboard, you should be able to add new task by clicking the "Add Task" button at the bottom of your screen. Go ahead and try it!',
  'progress',
  null,
  CURRENT_DATE,
  true,
  $1,
  $1,
  '#6ba1bc',
  null,
  u1.firebase_uid AS originator_id,
  u2.firebase_uid AS assignee_id
        FROM
  users u1
        JOIN
  users u2 ON u1.email = $1 AND u2.email = $1
        RETURNING *;`,
            [email],
        );

        await client.query(
            `
        INSERT INTO 
          tasks (title, content, status, start_date, end_date, urgent, assignee, originator, color_tag, fileurl, originator_id, assignee_id)
        SELECT
  'User Guide #2',
  'If you notice, within this task box there are two buttons! One for Edit and another for delete. 
  
  Go ahead and try it out!',
  'progress',
  null,
  CURRENT_DATE,
  true,
  $1,
  $1,
  '#f6b26b',
  null,
  u1.firebase_uid AS originator_id,
  u2.firebase_uid AS assignee_id
        FROM
  users u1
        JOIN
  users u2 ON u1.email = $1 AND u2.email = $1
        RETURNING *;`,
            [email],
        );

        await client.query(
            `
        INSERT INTO 
          tasks (title, content, status, start_date, end_date, urgent, assignee, originator, color_tag, fileurl, originator_id, assignee_id)
        SELECT
  'User Guide #3',
  'Tadel is specifically designed for you to interact with other user. 
  
  Head over to your profile section by clicking profile(on your top right) and add some team member!',
  'progress',
  null,
  CURRENT_DATE,
  true,
  $1,
  $1,
  '#ff9898',
  null,
  u1.firebase_uid AS originator_id,
  u2.firebase_uid AS assignee_id
        FROM
  users u1
        JOIN
  users u2 ON u1.email = $1 AND u2.email = $1
        RETURNING *;`,
            [email],
        );

        await client.query(
            `
        INSERT INTO 
          tasks (title, content, status, start_date, end_date, urgent, assignee, originator, color_tag, fileurl, originator_id, assignee_id)
        SELECT
  'Final Note!',
  'Great! Now that you know how to use Tadel, feel free to delete any of the existing cards and create new ones of your own!. 
  
  Again, thank you for signing up and enjoy delegating your task away!',
  'completed',
  null,
  CURRENT_DATE,
  true,
  $1,
  $1,
  '#ffff88',
  null,
  u1.firebase_uid AS originator_id,
  u2.firebase_uid AS assignee_id
        FROM
  users u1
        JOIN
  users u2 ON u1.email = $1 AND u2.email = $1
        RETURNING *;`,
            [email],
        );


        res.status(200).json({ message: "User successfully registered" });
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).json({ Error: err.message });
    } finally {
        client.release();
    }
});

//END POINT TO CHECK USER EXIST IN USERS TABLE

app.get("/users", async (req, res) => {
    const client = await pool.connect();
    const { email } = req.query;

    try {
        const response = await client.query(
            "SELECT email FROM users WHERE email = $1",
            [email],
        );

        if (response.rowCount == 0) {
            return res.status(200).json({ email: false });
        }

        res.status(200).json({ email: true });
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

//END POINT TO FETCH ALL TEAM MEMBERS BY USER

app.get("/team", async (req, res) => {
    const client = await pool.connect();
    const { originator } = req.query;

    try {
        const response = await client.query(
            `SELECT * FROM team WHERE originator = $1`,
            [originator],
        );
        res.status(200).json(response.rows);
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

//ENDPOINT TO ADD TEAM MEMBERS BY USER

app.post("/team", async (req, res) => {
    const client = await pool.connect();
    const { originator, team_member } = req.body;

    try {
        const response = await client.query(
            `
      INSERT INTO team (originator, team_member)
      VALUES ( $1, $2 )
      RETURNING *`,
            [originator, team_member],
        );

        res.status(200).json(response.rows);
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

//ENDPOINT TO DELETE A TEAM MEMBER BY MEMBER ID

app.delete("/team/:member_id", async (req, res) => {
    const client = await pool.connect();
    const { member_id } = req.params;

    try {
        const response = await client.query(
            "DELETE FROM team WHERE member_id = $1 RETURNING *",
            [member_id],
        );

        res.status(200).json({
            message: `User ${response.rows[0].team_member} successfully deleted`,
        });
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

//ENDPOINT TO SEND INVITATION EMAIL TO NEW USER

app.post("/team/invite", async (req, res) => {
    const client = await pool.connect();
    const { email, originator } = req.body;

    try {
        mg.messages.create("sandbox75434ee137b34cfead883ab09d46cb86.mailgun.org", {
            from: `<Tadel-Support@tadel.com>`,
            to: [email],
            subject: "You Have Been Invited to Join Tadel!",
            html: `
          <h4>You have been invited to join Tadel by ${originator}</h4>
          <p>Please click on this <a href="https://module-4-project-naqiuddinr.vercel.app/login">link</a> to sign up and start using Tadel!</p>
          `,
        });

        res.status(200).json({ message: "Inivitation successful" });
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

//////////////TASK ENDPOINT//////////////

//END POINT TO FETCH TASKS POSTED BY USER

app.get("/tasks/:firebase_uid", async (req, res) => {
    const client = await pool.connect();
    const { firebase_uid } = req.params;

    try {
        const response = await client.query(
            `SELECT * FROM tasks WHERE originator_id = $1 OR assignee_id = $1`,
            [firebase_uid],
        );

        res.status(200).json(response.rows);
    } catch (err) {
        console.error("Error :", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

//END POINT TO ADD TASK FROM ORIGINATOR

app.post("/tasks", async (req, res) => {
    const client = await pool.connect();
    const {
        title,
        content,
        status,
        start_date,
        end_date,
        urgent,
        assignee,
        originator,
        color_tag,
        fileurl,
    } = req.body;

    try {
        const response = await client.query(
            `
        INSERT INTO 
          tasks (title, content, status, start_date, end_date, urgent, assignee, originator, color_tag, fileurl, originator_id, assignee_id)
        SELECT
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          u1.firebase_uid AS originator_id,
          u2.firebase_uid AS assignee_id
        FROM
          users u1
        JOIN
          users u2 ON u1.email = $8 AND u2.email = $7
        RETURNING *;`,
            [
                title,
                content,
                status,
                start_date,
                end_date,
                urgent,
                assignee,
                originator,
                color_tag,
                fileurl,
            ],
        );

        mg.messages.create("sandbox75434ee137b34cfead883ab09d46cb86.mailgun.org", {
            from: `<${originator}>`,
            to: [assignee],
            subject: title,
            html: `
          <p><strong>Dealine:</strong> ${end_date}</p>
          <h3>${title}</h3>
          ${content}
          `,
        });

        res.json(response.rows[0]);
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

//ENDPOINT TO DELETE A TASK BY TASK ID

app.delete("/tasks/:task_id", async (req, res) => {
    const client = await pool.connect();
    const { task_id } = req.params;

    try {
        const response = await client.query(
            "DELETE FROM tasks WHERE task_id = $1",
            [task_id],
        );

        res.json({ message: `Task ${task_id} successfully deleted` });
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

//ENDPOINT TO EDIT A TASK BY TASK ID

app.put("/tasks/:task_id", async (req, res) => {
    const client = await pool.connect();
    const { task_id } = req.params;
    const {
        title,
        content,
        status,
        start_date,
        end_date,
        urgent,
        assignee,
        originator,
        color_tag,
        fileurl,
    } = req.body;

    try {
        const response = await client.query(
            `
  UPDATE tasks AS t
  SET
      title = COALESCE($1, t.title),
      content = COALESCE($2, t.content),
      status = COALESCE($3, t.status),
      start_date = COALESCE($4, t.start_date),
      end_date = COALESCE($5, t.end_date),
      urgent = COALESCE($6, t.urgent),
      assignee = COALESCE($7, t.assignee),
      originator = COALESCE($8, t.originator),
      color_tag = COALESCE($9, t.color_tag),
      fileurl = COALESCE($10, t.fileurl),
      originator_id = COALESCE((SELECT firebase_uid FROM users WHERE email = $8), t.originator_id),
      assignee_id = COALESCE((SELECT firebase_uid FROM users WHERE email = $7), t.assignee_id)
  WHERE
      task_id = $11
  RETURNING *;`,
            [
                title,
                content,
                status,
                start_date,
                end_date,
                urgent,
                assignee,
                originator,
                color_tag,
                fileurl,
                task_id,
            ],
        );

        res.json(response.rows);
    } catch (err) {
        console.error("Error :", err.message);
        res.status(500).json({ Error: err.message });
    } finally {
        client.release();
    }
});

//////////////END//////////////


app.get("/", async (req, res) => {
    res.status(200).json({ message: "TADEL API is running" });
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

module.exports = app;