const favicon = require("serve-favicon");
const express = require("express");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const expressLayout = require("express-ejs-layouts");
const compression = require("compression");
const passport = require("passport");
const flash = require("connect-flash");
const Limiter = require("express-rate-limit");
const fileUpload = require("express-fileupload");
const cron = require("node-cron");
const time = require("moment-timezone");

const { hitCounter, getRoute } = require("./library/functions");
const { profilePath, user } = require("./library/settings");
const { connectMongoDb } = require("./database/connect");
const { isAuthenticated } = require('./library/authorized');
const { User } = require("./database/model");
const { getTotalUser, getTotalRequest, getRequestDay } = require("./database/premium");
const apirouter = require("./routing/api");
const userRouters = require("./routing/users");
const premiumRouters = require('./routing/premium');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(Limiter({
	windowMs: 1 * 60 * 1000,
	max: 1000,
	message: "Oops too many requests #Greats Kimzz"
}));

connectMongoDb();

app.enable("trust proxy", 1);
app.set("json spaces", 2);
app.set("view engine", "ejs");
app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");

res.on("finish", () => {
		if (!getRoute(req)) {

		} else {
			hitCounter(1);
		}
	});
	next();
});	

app.use(expressLayout);
app.use(fileUpload());
app.use(compression());
app.use(favicon("./views/favicon.ico"));
app.use(express.static("assets"));
app.use(session({
	secret: "secret",
	resave: true,
	saveUninitialized: true,
	cookie: {
		maxAge: 86400000
	},
	store: new MemoryStore({
		checkPeriod: 86400000
	}),
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
require("./library/config")(passport);
app.use(flash());
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.warning_msg = req.flash("warning_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	res.locals.user = req.user || null;
	next();
});

app.get("/", async (req, res) => {
	 let userjid = await getTotalUser();
         let userreq = await getTotalRequest();
	 res.render('index', {
         user: userjid,
         kimzz: userreq,
         layout: 'index'
  })
});

app.get('/dashboard', isAuthenticated, async (req, res) => { 
  let userjid = await getTotalUser();
  let kimzz = await getTotalRequest();
  let reqday = await getRequestDay();
  let { apikey, username, email } = req.user
  res.render('dashboard', {
    username: username,
    apikey: apikey,
    email,
    user: userjid,
    kimzz,
    reqday,
    layout: 'dashboard'
  });
});

app.get('/tools', isAuthenticated, async (req, res) => { 
  let userjid = await getTotalUser();
  let kimzz = await getTotalRequest();
  let reqday = await getRequestDay();
  let { apikey, username, email } = req.user
  res.render('tools', {
    username: username,
    apikey: apikey,
    email,
    user: userjid,
    kimzz,
    reqday,
    layout: 'tools'
  });
});

app.get('/announcement', isAuthenticated, async (req, res) => { 
  let userjid = await getTotalUser();
  let kimzz = await getTotalRequest();
  let reqday = await getRequestDay();
  let { apikey, username, email } = req.user
  res.render('tools', {
    username: username,
    apikey: apikey,
    email,
    user: userjid,
    kimzz,
    reqday,
    layout: 'announcement'
  });
});

app.get('/pricing', isAuthenticated, async (req, res) => { 
  let userjid = await getTotalUser();
  let kimzz = await getTotalRequest();
  let reqday = await getRequestDay();
  let { apikey, username, email } = req.user
  res.render('pricing', {
    username: username,
    apikey: apikey,
    email,
    user: userjid,
    kimzz,
    reqday,
    layout: 'pricing'
  });
});

app.get("/profile", isAuthenticated, async (req, res) => {
  const Users = req.user;
  const premium = Users.premium;
  const reqday = Users.RequestToday;
  const totalreq = Users.totalreq;
  const expired = premium ? time(premium).tz('Asia/Kuala_Lumpur').format('DD/MM/YYYY HH:mm:ss') : 'Free';
  const statusPremium = premium ? 'Premium' : 'Free';

  res.render('profile', {
    username: Users.username,
    email: Users.email,
    apikey: Users.apikey,
    reqday,
    totalreq,
    limit: Users.limit,
    expired,
    since: Users.since,
    premium: statusPremium,
    layout: 'profile'
  });
});

app.get('/download', isAuthenticated, async (req, res) => { 
  let userjid = await getTotalUser();
  let kimzz = await getTotalRequest();
  let reqday = await getRequestDay();
  let { apikey, username, email } = req.user
  res.render('downloader', {
    username: username,
    apikey: apikey,
    email,
    user: userjid,
    kimzz,
    reqday,
    layout: 'downloader'
  });
});

app.get('/searching', isAuthenticated, async (req, res) => { 
  let userjid = await getTotalUser();
  let kimzz = await getTotalRequest();
  let reqday = await getRequestDay();
  let { apikey, username, email } = req.user
  res.render('searching', {
    username: username,
    apikey: apikey,
    email,
    user: userjid,
    kimzz,
    reqday,
    layout: 'searching'
  });
});

app.get('/religion', isAuthenticated, async (req, res) => { 
  let userjid = await getTotalUser();
  let kimzz = await getTotalRequest();
  let reqday = await getRequestDay();
  let { apikey, username, email } = req.user
  res.render('religion', {
    username: username,
    apikey: apikey,
    email,
    user: userjid,
    kimzz,
    reqday,
    layout: 'religion'
  });
});

app.get('/random', isAuthenticated, async (req, res) => { 
  let userjid = await getTotalUser();
  let kimzz = await getTotalRequest();
  let reqday = await getRequestDay();
  let { apikey, username, email } = req.user
  res.render('random', {
    username: username,
    apikey: apikey,
    email,
    user: userjid,
    kimzz,
    reqday,
    layout: 'random'
  });
});

app.get('/game', isAuthenticated, async (req, res) => { 
  let userjid = await getTotalUser();
  let kimzz = await getTotalRequest();
  let reqday = await getRequestDay();
  let { apikey, username, email } = req.user
  res.render('game', {
    username: username,
    apikey: apikey,
    email,
    user: userjid,
    kimzz,
    reqday,
    layout: 'game'
  });
});

app.use("/api", apirouter);
app.use("/users", userRouters);
app.use('/premium', premiumRouters);

app.listen(PORT, function () {
	console.log("Server is running on port" + PORT);
});
