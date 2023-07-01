const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./models/index");
const { Op } = require("sequelize");

app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");

var csrf = require("tiny-csrf");
var cookieParser = require("cookie-parser");
app.use(cookieParser("ssh! some secret string"));
app.use(csrf("WuL7phhdlsGqFbBDDGNrTZPEDa4B5G19", ["POST", "PUT", "DELETE"]));
/* Final User Authentication and Session */

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const localStrategy = require("passport-local");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const flash = require("connect-flash");

app.use(
  session({
    secret: "my-super-secret-key-21762849894349",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    (username, password, done) => {
      db.User.findOne({ where: { email: username } })
        .then(async (user) => {
          if (!user)
            return done(null, false, {
              message: "No user found with given email address",
            });
          const result = await bcrypt.compare(password, user.password);
          if (result) {
            return done(null, user);
          } else {
            return done(null, false, { message: "Invalid password" });
          }
        })
        .catch((error) => {
          return error;
        });
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("serialiing user in session", user.id);
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  db.User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      done(error, null);
    });
});

app.use(flash());
app.use(function (request, response, next) {
  response.locals.messages = request.flash();
  next();
});

function requireAdmin(req, res, next) {
  if (
    req.user &&
    (req.user.role === "admin" || req.user.role === "superadmin")
  ) {
    return next();
  } else {
    res.status(401).json({ message: "Unauthorized user." });
  }
}

app.get("/report", async (request, response) => {
  console.log(new Date(request.query.fromdate));

  let sports = await db.sports.findAll();

  let data = await Promise.all(
    sports.map(async (sport) => {
      sessionData = await db.Session.count({
        where: {
          sportId: sport.dataValues.id,
          createdAt: {
            [Op.between]: request.query.fromdate
              ? [
                  new Date(request.query.fromdate),
                  request.query.todate
                    ? new Date(request.query.todate)
                    : new Date(),
                ]
              : [Number(null), new Date()],
          },
        },
      });
      const obj = {
        language: sport.dataValues.name,
        value: sessionData,
      };
      return obj;
    })
  );
  data = JSON.stringify(data);
  // console.log(data);
  response.render("report", { data, csrfToken: request.csrfToken() });
});

app.get("/", async (request, response) => {
  const sports = await db.sports.findAll();
  const user = await db.User.findByPk(request.user ? request.user.id : 1);

  let sessions = await db.Session.findAll({
    where: {
      schedule: { [Op.gte]: new Date() },
      players: { [Op.contains]: [JSON.stringify(user?.dataValues)] },
    },
  });
  sessions = sessions.map((session) => session.dataValues);
  // console.log(await db.sports.count());
  response.render("index", {
    title: "HomePage",
    sports: sports,
    sessions,
    user: request.user,
  });
});

app.get("/login", (request, response) => {
  response.render("login", { title: "Login", csrfToken: request.csrfToken() });
});

app.post(
  "/session",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  async (request, response) => {
    response.redirect("/");
  }
);

app.get("/signup", (request, response) => {
  if (request.user) {
    return response.redirect("/");
  }
  response.render("signup", {
    title: "Signup",
    csrfToken: request.csrfToken(),
  });
});

app.get("/users", async (request, response) => {
  const users = await db.User.findAll();
  response.render("user_list", {
    title: "Users List",
    users,
    user: request.user,
  });
});

app.get("/users/new", async (request, response) => {
  response.render("user_form", {
    title: "User Creation Form",
    csrfToken: request.csrfToken(),
    user: request.user,
  });
});

app.post("/users", async (request, response) => {
  if (
    !request.body.firstname ||
    !request.body.email ||
    !request.body.password
  ) {
    ["firstname", "email", "password"].map((param) => {
      !request.body[param]
        ? request.flash("error", `${param} cannot be empty`)
        : null;
      console.log(request.body[param]);
    });
    if (request.user) return response.redirect("/users");
    else return response.redirect("/signup");
  }

  const hashedPwd = await bcrypt.hash(request.body.password, saltRounds);
  try {
    const user = await db.User.create({
      firstname: request.body.firstname,
      lastname: request.body.lastname,
      email: request.body.email,
      password: hashedPwd,
      role: request.body.role ? request.body.role : "player",
    });
    if (request.user) return response.redirect("/users");
    else
      request.login(user, (err) => {
        if (err) console.log(err);
        else return response.redirect("/");
      });
  } catch (error) {
    console.log(error);
    if (error.name === "SequelizeUniqueConstraintError")
      request.flash("error", error.errors[0].message);
    if (request.user) return response.redirect("/users");
    else response.redirect("/signup");
  }
});

app.get("/signout", (request, response, next) => {
  request.logout((err) => {
    if (err) return next(err);
    response.redirect("/login");
  });
});

app.get(
  "/sports",

  async (request, response) => {
    const sports = await db.sports.findAll();
    response.render("sports", {
      title: "Sports",
      sports: sports,
      sport: "",
      csrfToken: request.csrfToken(),
      user: request.user,
    });
  }
);

app.post(
  "/sports",

  async (request, response) => {
    console.log(request.body);
    const sport = await db.sports.create({
      name: request.body.name,
      numberOfPlayers: request.body.nop,
      userId: request.user?.id,
    });

    response.redirect("/");
  }
);

app.get(
  "/sports/:id",

  async (request, response) => {
    const sport = await db.sports.findByPk(request.params.id);
    const sessions = await db.Session.findAll({ where: { sportId: sport.id } });

    const upcomingSessions = sessions.filter(
      (session) => session.schedule >= new Date()
    );
    const previousSessions = sessions.filter(
      (session) => session.schedule < new Date()
    );
    response.render("sport", {
      title: sport.name,
      sport: sport,
      sessions,
      previousSessions,
      upcomingSessions,
      csrfToken: request.csrfToken(),
      user: request.user,
    });
  }
);

app.get(
  "/sports/:id/edit",

  async (request, response) => {
    const sport = await db.sports.findByPk(request.params.id);
    response.render("sports", {
      title: `Editing ${sport.name}`,
      sport: sport,
      csrfToken: request.csrfToken(),
      user: request.user,
    });
  }
);

app.put(
  "/sports/:id",

  async (request, response) => {
    const sport = await db.sports.findByPk(request.params.id);
    console.log(request.body, request.params.id);
    const updatedSport = await sport.update({
      name: request.body.name,
      numberOfPlayers: request.body.numberOfPlayers,
    });
    if (request.accepts("html")) return response.json(updatedSport);
    else return response.redirect("/");
  }
);

app.delete(
  "/sports/:id",

  async (request, response) => {
    const sport = await db.sports.findByPk(request.params.id);
    if (sport)
      try {
        await db.sports.destroy({ where: { id: request.params.id } });
        return response.json(true);
      } catch (error) {
        console.log(error);
      }
    else response.redirect("/");
  }
);

app.get(
  "/sports/:sportId/session",

  async (request, response) => {
    const users = await db.User.findAll();
    const sport = await db.sports.findByPk(request.params.sportId);
    const session = null;
    console.log(new Date()); // UTC Time

    response.render("session", {
      sport,
      session,
      users,
      csrfToken: request.csrfToken(),
      user: request.user,
    });
  }
);

app.post(
  "/sports/:sportId/session",

  async (request, response) => {
    const players = JSON.parse(request.body.players)["players"];
    console.log(players, typeof players);
    const sport = await db.sports.findByPk(request.params.sportId);
    const session = await db.Session.create({
      schedule: request.body.schedule,
      venue: request.body.venue,
      players: players,
      extraPlayercount: Number(request.body.extraPlayercount),
      sportId: sport.id,
      userId: request.user?.id,
    });
    response.redirect(`/sports/${sport.id}`);
  }
);

app.get(
  "/sports/:sportId/session/:sessionId",

  async (request, response) => {
    const sport = await db.sports.findByPk(request.params.sportId);
    const session = await db.Session.findByPk(request.params.sessionId);

    const currentUserInSportSession = request.user
      ? session.players.includes(JSON.stringify(request.user.dataValues))
      : false;
    console.log(currentUserInSportSession);
    response.render("session_view", {
      title: sport.name,
      sport,
      session,
      currentUserInSportSession,
      csrfToken: request.csrfToken(),
      user: request.user,
    });
  }
);

app.delete("/sports/:sportId/session/:sessionId", async (request, response) => {
  const session = await db.Session.findByPk(request.params.sessionId);
  if (session)
    try {
      await db.Session.destroy({ where: { id: request.params.sessionId } });
      return response.json(true);
    } catch (error) {
      console.log(error);
    }
  else response.redirect("/");
});

app.get(
  "/sports/:sportId/session/:sessionId/edit",

  async (request, response) => {
    const users = await db.User.findAll();
    const sport = await db.sports.findByPk(request.params.sportId);
    const session = await db.Session.findByPk(request.params.sessionId);
    let sessionPlayers = session.players.map((pl) => JSON.parse(pl));
    sessionPlayers = JSON.stringify({ players: sessionPlayers });

    response.render("session", {
      title: sport.name,
      users,
      sport,
      sessionPlayers,
      session,
      csrfToken: request.csrfToken(),
      user: request.user,
    });
  }
);

app.put(
  "/sports/:sportId/session/:sessionId",

  // requireAdmin,
  async (request, response) => {
    const sport = await db.sports.findByPk(request.params.sportId);
    const players = request.body.players.players.map((e) => JSON.stringify(e));
    const updatedSession = await db.Session.update(
      {
        schedule: request.body.schedule,
        venue: request.body.venue,
        players: players,
        extraPlayercount: request.body.epc,
      },
      { where: { id: request.params.sessionId } }
    );
    if (request.accepts("html")) return response.json(updatedSession);
    else response.redirect(`/sports/${sport.id}`);
  }
);

app.put(
  "/sports/:sportId/session/:sessionId/associate",
  async (request, response) => {
    const session = await db.Session.findByPk(request.params.sessionId);
    console.log(request.body.associate);
    let players = session.players;

    request.body.associate === "join"
      ? players.push(JSON.stringify(request.user.dataValues))
      : (players = players.filter(
          (player) => player !== JSON.stringify(request.user.dataValues)
        ));

    const updatedSession = await db.Session.update(
      { players: players },
      { where: { id: request.params.sessionId } }
    );
    if (request.accepts("html")) return response.json(updatedSession);
    else return response.redirect("/");
  }
);

app.get("/my_sessions", async (request, response) => {
  const user = await db.User.findByPk(1);
  let sessions = await db.Session.findAll({
    where: {
      players: { [Op.contains]: [JSON.stringify(user.dataValues)] },
    },
  });
  sessions = sessions.map((session) => session.dataValues);
  const sports = await Promise.all(
    sessions.map(async (session) => {
      const s = await db.sports.findByPk(session.sportId);
      return s.dataValues;
    })
  );
  response.render("my_sessions", {
    user: request.user,
    sports,
    sessions,
    csrfToken: request.csrfToken(),
  });
});

app.listen(3000, () => {
  console.group("Server started at port: 3000");
});
