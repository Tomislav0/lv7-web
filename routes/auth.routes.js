var express = require('express'),
  router = express.Router(),
  mongoose = require('mongoose'), // mongo connection
  bodyParser = require('body-parser'), // parses information from POST
  methodOverride = require('method-override'); // used to manipulate POST

// Any requests to this controller must pass through this 'use' function
// Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method
  }
}));

const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
router.route('/signup')
  // GET all projects
  .get(async function (req, res, next) {
    try {
      res.format({
        html: function () {
          res.render('auth/signup', {
            "title": "Register"
          });
        },
      });
    } catch (err) {
      next(err);
    }
  })
  // POST a new project
  .post(
    controller.signup
  );
  router.route('/signin')
  // GET all projects
  .get(async function (req, res, next) {
    try {
      res.format({
        html: function () {
          res.render('auth/signin', {
            "title": "Log in"
          });
        },
      });
    } catch (err) {
      next(err);
    }
  })
  // POST a new project
  .post(
    controller.signin
  );


// module.exports = function (app) {
//   app.use(function (req, res, next) {
//     res.header(
//       "Access-Control-Allow-Headers",
//       "x-access-token, Origin, Content-Type, Accept"
//     );
//     next();
//   });

//   app.post(
//     "/api/auth/signup",
//     [
//       verifySignUp.checkDuplicateUsernameOrEmail,
//       verifySignUp.checkRolesExisted
//     ],
//     controller.signup
//   );

//   app.post("/api/auth/signin", controller.signin);


//   app.get("/signup", async function (req, res, next) {
//     try {
//       // retrieve all projects from MongoDB using promises
//       var projects = await mongoose.model('Project').find({})
//       projects = projects.map(p => Object.assign(p, { startDate: p.finishDate?.toISOString().substring(0, p.finishDate.toISOString().indexOf('T')) }));
//       res.format({
//         // HTML response will render the index.jade file in the views/projects folder.
//         // We are also setting "projects" to be an accessible variable in our jade view
//         html: function () {
//           res.render('projects/index', {
//             title: 'All my projects',
//             "projects": projects
//           });
//         },
//         // JSON response will show all projects in JSON format
//         json: function () {
//           res.json(projects);
//         }
//       });
//     } catch (err) {
//       next(err);
//     }
//   });
// };



module.exports = router;
