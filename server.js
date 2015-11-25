// initialize default modules
var express = require("express");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var Forecast = require("forecast");
var path = require("path");
var Sequelize = require("sequelize");
var _ = require("underscore");
var session = require("express-session")
var SequelizeStore = require("connect-session-sequelize")(session.Store);
var encrypt = require("sha1");
var mailer = require("nodemailer");
var app = express();
var multer = require('multer')
var fs = require("fs");

var storage = multer.diskStorage({
	destination: './uploads/',
	filename: function(req, file, cb) {
		if (req.session.user) {
			cb(null, req.session.user.hashcode + "." + getFileExt(file.originalname));
		} else {
			cb(null, false);
		}
	}
});

var upload = multer({
	"storage": storage
});

// initialize custom modules;
var authentication = require("./modules/authentication.js");
var schedule = require("./modules/schedule.js");
var weather = require("./modules/weather.js");
var database = require("./modules/database.js");
var utility = require("./modules/utility.js");
var news = require("./modules/news.js");
var email = require("./modules/email.js");
var discussion = require("./modules/discussion.js");
var classes = require("./modules/class.js");

// initialize rootURL
var rootURL = "http://localhost";

// initialize port number
var portNumber = 80;

// initialize weather API
var forecast = new Forecast({
	service: "forecast.io",
	key: "55feee02585767fbba96817420ff5cd2",
	units: "fahrenheit",
	cache: true,
	ttl: {
		minutes: 27,
		seconds: 45
	}
});

// initialize database with SQLite
var sequelize = new Sequelize("database", "username", "password", {
	host: "localhost",
	dialect: "sqlite",
	pool: {
		max: 1,
		min: 0,
		idle: 10000
	},
	storage: "database/db.sqlite",
	logging: false
});

// use SMTP protocol to send Email
var smtpTransport = mailer.createTransport({
	service: "Gmail",
	auth: {
		user: "uwmnow.cs@gmail.com",
		pass: "uwmnow2015"
	}
});

// load schemas to the databse if there are not there already
var databaseModels = database.initialize(sequelize, Sequelize);

// use cookie parser in all requests
app.use(cookieParser());

// use body parser to parser all requests
app.use(bodyParser.urlencoded({
	extended: true
}));

// use body parser to parser all json requests
app.use(bodyParser.json());

// set template engine to jade.js
app.set("view engine", "jade");

// beautify generated HTML
app.locals.pretty = true;

// static folder /views
app.use(express.static(process.argv[2] || __dirname + "/views"));

app.locals.moment = require("moment");

//	Sequelize ORM (SQLite)
app.use(session({
	secret: "keyboard cat",
	store: new SequelizeStore({
		db: sequelize
	}),
	proxy: true,
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 60 * 60 * 1000
	}
}));


/*
 *	GET Requests:
 *		index
 *		register
 *		login
 *		account
 *		administrative
 *		administrative/:uid/:command
 *		postnews
 *		postnews/:uid/deletenews
 *		administrative/postnews/:uid/:command
 *		activate/:hashcode
 *		discussion
 */

// if user is logged-in, then render filled main, otherwise empty main
app.get("/", function(req, res) {
	if (req.session.user) {
		news.listApprovedNews(req, sequelize, databaseModels.newsModel,
			databaseModels.userModel,
			function(news) {
				discussion.getAllApprovedDiscussion(req, sequelize, databaseModels, function(discussions) {
					weather.getData(forecast, function(weather) {
						schedule.listClasses(req, sequelize, databaseModels, function(classes) {
							res.render("main", {
								"loggedIn": true,
								"user": req.session.user,
								"news": news,
								"weather": weather,
								"discussions": discussions,
								"classSchedules": classes
							});
						});
					});
				});
			});
	} else {
		res.render("main");
	}
});

// render about page
app.get("/about", function(req, res) {
	if (req.session.user) {
		res.render("about", {
			"standalone": true,
			"user": req.session.user
		});
	} else {
		res.render("main");
	}
});

// if user is logged-in, then redirect to index, otherwise render register
app.get("/register", function(req, res) {
	if (req.session.user) {
		res.redirect("/");
	} else {
		res.render("register");
	}
});

// if user is logged-in, then redirect to index, otherwise render login
app.get("/login", function(req, res) {
	if (req.session.user) {
		res.redirect("/");
	} else {
		res.render("login");
	}
});

// if user is logged-in, then render account information, otherwise redirect to login
app.get("/account", function(req, res) {
	if (req.session.user) {
		var user = JSON.parse(JSON.stringify(req.session.user));
		try {
			user.extendedProfile = JSON.parse(user.extendedProfile);
		} catch (e) {
			user.extendedProfile = JSON.parse(JSON.stringify(user.extendedProfile));
		}
		res.render("myaccount", {
			"user": user
		});
	} else {
		res.redirect("/login");
	}
});

// handle logout by clearing session from cookie and database
app.get("/logout", function(req, res) {
	req.session.destroy(function(err) {
		if (err) {
			console.log(err);
		} else {
			res.redirect("/");
		}
	});
});

// if user is administrator, then user can get the list of accounts, otherwise redirect to login
app.get("/administrative", function(req, res) {
	if (req.session.user && req.session.user.admin) {
		authentication.listAccounts(req, sequelize, databaseModels.userModel,
			function(users) {
				news.listUnapprovedNews(req, sequelize, databaseModels.newsModel,
					databaseModels.userModel,
					function(news) {
						discussion.getAllDiscussion(req, sequelize, databaseModels, function(discussions) {
							res.render("administrative", {
								"users": users,
								"user": req.session.user,
								"news": news,
								"discussions": discussions
							});
						});
					});
			});
	} else {
		res.redirect("/login");
	}
});

// if user is administrator, then user can update the other accounts, otherwise redirect to login
app.get("/administrative/:uid/:command", function(req, res) {
	if (req.session.user && req.session.user.admin) {
		authentication.updateAccountByAdmin(req, sequelize, databaseModels.userModel,
			function(user) {
				res.redirect("/administrative");
			});
	} else {
		res.redirect("/login");
	}
});

// if user is logged-in, then user can post a news, otherwise redirect to index
app.get("/postnews", function(req, res) {
	if (req.session.user) {
		news.listNewsByUser(req, sequelize, databaseModels.newsModel, function(news) {
			res.render("postnews", {
				"news": news,
				"user": req.session.user
			});
		});
	} else {
		res.redirect("/login");
	}
});

// if user is logged-in, then handle delete news, otherwise redirect to index
app.get("/postnews/:uid/:command", function(req, res) {
	if (req.session.user) {
		news.deletePostedNewsByUser(req, sequelize, databaseModels.newsModel,
			function(
				news) {
				res.redirect("/postnews");
			});
	} else {
		res.redirect("/login");
	}
});

// if user is logged-in, then handle command news, otherwise redirect to index
app.get("/administrative/postnews/:uid/:command", function(req, res) {
	if (req.session.user && req.session.user.admin) {
		news.updatePostedNewsByAdmin(req, sequelize, databaseModels.newsModel,
			function(news) {
				res.redirect("/administrative");
			});
	} else {
		res.redirect("/login");
	}
});

// if user is logged-in, redirect to index, otherwise active account
app.get("/activate/:hashcode", function(req, res) {
	if (req.session.user) {
		res.redirect("/");
	} else {
		authentication.activateUserByEmail(req, sequelize, databaseModels.userModel,
			function(user) {
				if (!_.isNull(user)) {
					res.render("verify", {
						"email": user.email,
						"activated": true
					});
				} else {
					res.redirect("/");
				}
			});
	}
});

// if user is logged-in, then discussions by user, otherwise active account
app.get("/discussion", function(req, res) {
	if (req.session.user) {
		discussion.getDiscussionByUser(req, sequelize, databaseModels, function(discussionsByYou) {
			res.render("discussion", {
				"listOfDepartment": discussion.getListOfDepartment(),
				"user": req.session.user,
				"discussionsByYou": discussionsByYou
			});
		});
	} else {
		res.redirect("/login");
	}
});

// if user is logged-in, the handle delete discussion, otherwise active account
app.get("/discussion/deletediscussion/:discussionUID", function(req, res) {
	if (req.session.user) {
		discussion.deleteDiscussionByUser(req, sequelize, databaseModels, function(discussionsByYou) {
			res.redirect("/discussion");
		});
	} else {
		res.redirect("/login");
	}
});


// if user is logged-in, then get discussions by class, otherwise active account
app.get("/discussion/:departmentCode/:classNumber", function(req, res) {
	if (req.session.user) {
		discussion.getDiscussionByClass(req, sequelize, databaseModels, function(discussionsByClass) {
			res.render("participate", {
				"user": req.session.user,
				"discussionsByClass": discussionsByClass,
				"className": req.params.departmentCode + "-" + req.params.classNumber,
				"departmentCode": req.params.departmentCode,
				"classNumber": req.params.classNumber
			});
		});
	} else {
		res.redirect("/login");
	}
});

// if user is logged-in, handle delete discussion, otherwise active account
app.get("/discussion/:departmentCode/:classNumber/deletediscussion/:discussionUID/", function(req, res) {
	if (req.session.user) {
		discussion.deleteDiscussionByUser(req, sequelize, databaseModels, function(discussionsByYou) {
			res.redirect("/discussion/" + req.params.departmentCode + "/" + req.params.classNumber);
		});
	} else {
		res.redirect("/login");
	}
});

// if user is loggedIn and is administrator, then handle administrative command
app.get("/administrative/discussion/:discussionUID/:command", function(req, res) {
	if (req.session.user && req.session.user.admin) {
		discussion.updateDiscussionByAdmin(req, sequelize, databaseModels,
			function(news) {
				res.redirect("/administrative");
			});
	} else {
		res.redirect("/login");
	}
});

// handle is loggedIn, the handle delete class, otherwise redirect to index
app.get("/schedule", function(req, res) {
	if (req.session.user) {
		schedule.listClasses(req, sequelize, databaseModels, function(myClassList) {
			res.render("schedule", {
				"listOfDepartment": discussion.getListOfDepartment(),
				"user": req.session.user,
				"classSchedules": myClassList
			});
		});
	} else {
		res.redirect("/login");
	}
});


// handle is loggedIn, the handle delete class, otherwise redirect to index
app.get("/schedule/check", function(req, res) {
	if (req.session.user) {
		schedule.listClasses(req, sequelize, databaseModels, function(myClassList) {
			classes.getAllClasses(req, sequelize, databaseModels, function(allClassList) {
				res.render("schedule", {
					"listOfDepartment": discussion.getListOfDepartment(),
					"user": req.session.user,
					"classSchedules": myClassList,
					"check": classes.classAnalyze(myClassList, allClassList)
				});
			});
		});
	} else {
		res.redirect("/login");
	}
});

// handle deleteclass class if user is loggedIn
app.get("/schedule/:departmentCode/:classNumber/deleteclass", function(req, res) {
	if (req.session.user) {
		schedule.deleteClass(req, sequelize, databaseModels, function(classes) {
			res.redirect("/schedule");
		});
	} else {
		res.redirect("/login");
	}
});

// handle user profile
app.get("/profile/:hashcode", function(req, res) {
	authentication.getUserByHashcode(req, sequelize, databaseModels.userModel, function(user) {
		var userItem = JSON.parse(JSON.stringify(user));
		try {
			userItem.extendedProfile = JSON.parse(user.extendedProfile);
		} catch (e) {
			userItem.extendedProfile = JSON.parse(JSON.stringify(user.extendedProfile));
		}

		news.listApprovedNewsByGivenUser(req, sequelize, databaseModels.newsModel, databaseModels.userModel, function(news) {
			discussion.getAllApprovedDiscussionByGivenUser(req, sequelize, databaseModels, function(discussions) {
				res.render("profile", {
					"user": req.session.user,
					"profile": userItem,
					"news": news,
					"discussions": discussions
				});
			});

		});
	});
});

// send image file
app.get("/profile_image/:filename", function(req, res) {
	if (req.session.user) {
		res.sendFile("/uploads/" + req.params.filename, {
			root: __dirname
		});
	} else {
		res.redirect("/login");
	}

});

// delete image file
app.get("/profile_image/:filename/delete", function(req, res) {
	if (req.session.user) {
		authentication.deletePhoto(req, sequelize, databaseModels.userModel, function(rows) {
			fs.unlinkSync("./uploads/" + req.params.filename);
			res.redirect("/logout");
		})
	} else {
		res.redirect("/login");
	}
});

app.get("/search", function(req, res) {
	if (req.session.user) {
		res.render("users", {
			"user": req.session.user
		});
	} else {
		res.redirect("/login");
	}
});

app.get("/rate", function(req, res) {
	if (req.session.user) {
		classes.getAllClasses(req, sequelize, databaseModels, function(classList) {
			res.render("rate", {
				"classList": classList,
				"user": req.session.user
			});
		});
	} else {
		res.redirect("/login");
	}
});

/*
 *	POST Requests:
 *		register
 *		login
 *		accountupdate
 *		submitnews
 */

app.post("/rate", function(req, res) {
	if (req.session.user) {
		classes.setClassRating(req, sequelize, databaseModels, function(classList) {
			res.sendStatus(200);
		});
	} else {
		res.redirect("/login");
	}
});

app.post("/search", function(req, res) {
	if (req.session.user) {
		authentication.listAccounts(req, sequelize, databaseModels.userModel, function(users) {
			var profiles = [];

			if (_.isNull(users) || _.isUndefined(users)) {
				res.render("users", {
					"user": req.session.user,
					"profiles": profiles
				});
			} else {
				_.map(users, function(userItem) {
					if (JSON.stringify(userItem).toLowerCase().indexOf(req.body.search_user.toLowerCase()) > -1) {
						profiles.push(userItem);
					}
				});

				res.render("users", {
					"user": req.session.user,
					"profiles": profiles
				});
			}
		});
	} else {
		res.redirect("/login");
	}
});

app.post("/addSchedule", function(req, res) {
	schedule.addClass(req, sequelize, databaseModels, function(classes) {
		res.redirect("/schedule");
	});
});

// if user is logged-in, then redirect to index, otherwise handle register user
app.post("/register", function(req, res) {
	if (req.session.user) {
		res.redirect("/");
	} else {
		authentication.registerAccount(req, sequelize, databaseModels.userModel,
			function(user) {
				if (!_.isNull(user) && user.already) {
					res.render("register", {
						"unauthorized": true,
						"message": "Email already exist in Database ! - Please Try Again !"
					});
				} else {
					email.sendEmail(smtpTransport, user.email, user.hashcode, rootURL,
						function(
							message) {
							if (_.isNull(message)) {
								res.render("verify", {
									"email": user.email
								});
							} else {
								res.render("register", {
									"unauthorized": true,
									"message": "Provided email is not valid ! - Please Try Again !"
								});
							}
						});
				}
			});
	}
});

// if user is logged-in, then redirect to index, otherwise handle login user
app.post("/login", function(req, res) {
	if (req.session.user) {
		res.redirect("/");
	} else {
		authentication.loginAccount(req, sequelize, databaseModels.userModel,
			function(user) {
				if (_.isUndefined(user) || _.isNull(user)) {
					res.render("login", {
						"unauthorized": true,
						"message": "Invalid Username / Password ! - Please Try Again !"
					});
				} else if (!user.active) {
					res.render("login", {
						"unauthorized": true,
						"message": "Your account is inactivate ! - Please Try Again !"
					});
				} else {
					req.session.user = user;
					req.session.save(function(err) {
						res.redirect("/");
					});
				}
			});
	}
});

// if user is logged-in, then handle update account, otherwise redirect to index
app.post("/accountupdate", upload.single('image'), function(req, res) {
	if (req.session.user) {
		authentication.updateAccount(req, sequelize, databaseModels.userModel,
			function(user) {
				res.redirect("/logout");
			});
	} else {
		res.redirect("/");
	}
});

// if user is logged-in, then handle posted news, otherwise redirect to index
app.post("/submitnews", function(req, res) {
	if (req.session.user) {
		news.addNews(req, sequelize, databaseModels.newsModel, function(news) {
			res.redirect("/postnews");
		});
	} else {
		res.redirect("/login");
	}
});


// if user is logged-in, then handle user's requests given departmentName and departmentCode, otherwise redirect to index
app.post("/discussion", function(req, res) {
	if (req.session.user) {
		res.redirect("/discussion/" + req.body.departmentCode + "/" + req.body.classNumber);
	} else {
		res.redirect("/login");
	}
});

// if user is logged-in, get the list of discussions by given class, otherwise redirect to index
app.post("/postdiscussion/:departmentCode/:classNumber", function(req, res) {
	if (req.session.user) {
		text = req.body.discussionText;
		var regex = /(<([^>]+)>)/ig;
		text = text.replace(regex, "");

		if (text.length >= 1000) {
			discussion.getDiscussionByClass(req, sequelize, databaseModels, function(discussionsByClass) {
				res.render("participate", {
					"user": req.session.user,
					"discussionsByClass": discussionsByClass,
					"className": req.params.departmentCode + "-" + req.params.classNumber,
					"departmentCode": req.params.departmentCode,
					"classNumber": req.params.classNumber,
					"countError": true,
					"defaultText": req.body.discussionText
				});
			});
		} else {
			discussion.addDiscussion(req, sequelize, databaseModels, function(discussionsByClass) {
				res.redirect("/discussion/" + req.params.departmentCode + "/" + req.params.classNumber);
			});
		}
	} else {
		res.redirect("/login");
	}
});


// prototypes
String.prototype.ucfirst = function() {
	return this.charAt(0).toUpperCase() + this.substr(1);
}

var getFileExt = function(fileName) {
	var fileExt = fileName.split(".");
	if (fileExt.length === 1 || (fileExt[0] === "" && fileExt.length === 2)) {
		return "";
	}
	return fileExt.pop();
}

console.log("UWMNow! started and it can be accessed at port :80");
console.log("Address: " + rootURL + ":80");

// port address
app.listen(portNumber);
