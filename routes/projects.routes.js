var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), // mongo connection
    bodyParser = require('body-parser'), // parses information from POST
    methodOverride = require('method-override'); // used to manipulate POST

// Any requests to this controller must pass through this 'use' function
// Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}));

// Build the REST operations at the base for projects
// This will be accessible from http://127.0.0.1:3000/projects if the default route for / is left unchanged
router.route('/')
    // GET all projects
    .get(async function(req, res, next) {
        try {
            // retrieve all projects from MongoDB using promises
            var projects = await mongoose.model('Project').find({})
            projects = projects.map(p=>Object.assign(p,{startDate: p.finishDate?.toISOString().substring(0, p.finishDate.toISOString().indexOf('T'))}));
            res.format({
                // HTML response will render the index.jade file in the views/projects folder.
                // We are also setting "projects" to be an accessible variable in our jade view
                html: function(){
                    res.render('projects/index', {
                        title: 'All my projects',
                        "projects" : projects
                    });
                },
                // JSON response will show all projects in JSON format
                json: function(){
                    res.json(projects);
                }
            });
        } catch (err) {
            next(err);
        }
    })
    // POST a new project
    .post(async function(req, res) {
        try {
            var project = req.body;
            console.log(project)
            // call the create function for our database using promises
            project.isDone = false;
            var createdproject = await mongoose.model('Project').create(project);
            res.format({
                // HTML response will redirect back to the home page
                html: function(){
                    res.location("projects");
                    res.redirect("/projects");
                },
                // JSON response will show the newly created project
                json: function(){
                    res.json(createdproject);
                }
            });
        } catch (err) {
            res.send({ msg: 'error: ' + err });
        }
    });

/* GET New project page. */
router.get('/new', function(req, res) {
    res.render('projects/new', { title: 'Add New project' });
});

// Route middleware to validate :id
router.param('id', async function(req, res, next, id) {
    try {
        // find the ID in the Database using promises
        var project = await mongoose.model('Project').findById(id);
        if (!project) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        } else {
            // save the new item in the req
            req.id = id;
            next(); 
        }
    } catch (err) {
        next(err);
    }
});

router.route('/:id')
    .get(async function(req, res, next) {
        try {
            var project = await mongoose.model('Project').findById(req.id);
            if (!project) {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
            } else {
                var projectStartDate = project.startDate?.toISOString().substring(0, project.startDate.toISOString().indexOf('T'));
                var projectFinishDate = project.finishDate?.toISOString().substring(0, project.finishDate.toISOString().indexOf('T'));
                res.format({
                    html: function(){
                        res.render('projects/show', {
                            "startDate" : projectStartDate,
                            "finishDate" : projectFinishDate,
                            "project" : project
                        });
                    },
                    json: function(){
                        res.json(project);
                    }
                });
            }
        } catch (err) {
            next(err);
        }
    });

router.route('/:id/edit')
    .get(async function(req, res, next) {
        try {
            var project = await mongoose.model('Project').findById(req.id);
            if (!project) {
                var err = new Error('Not Found');
                err.status = 404;
                next(err);
            } else {
                var projectStartDate = project.startDate?.toISOString().substring(0, project.startDate.toISOString().indexOf('T'));
                var projectFinishDate = project.finishDate?.toISOString().substring(0, project.finishDate.toISOString().indexOf('T'));
                res.format({
                    html: function(){
                        res.render('projects/edit', {
                            title: 'project' + project._id,
                            "project" : project,
                            "startDate" : projectStartDate,
                            "finishDate" : projectFinishDate
                        });
                    },
                    json: function(){
                        res.json(project);
                    }
                });
            }
        } catch (err) {
            next(err);
        }
    })
    .put(async function(req, res, next) {
		try {
			var updateData = req.body;
			if (updateData.isDone === 'on') {
				updateData.isDone = true;
			} else if (updateData.isDone === 'off') {
				updateData.isDone = false;
			}
			var updatedproject = await mongoose.model('Project').findByIdAndUpdate(req.id, updateData, { new: true });
			res.format({
				html: function(){
					res.redirect("/projects/" + updatedproject._id);
				},
				json: function(){
					res.json(updatedproject);
				}
			});
		} catch (err) {
			res.send("There was a problem updating the information to the database: " + err);
		}
	})
    .delete(async function (req, res) {
		try {
			var deletedproject = await mongoose.model('Project').findOneAndDelete({ _id: req.id });
			if (!deletedproject) {
				return res.status(404).send({ message: 'project not found' });
			}
			console.log('DELETE removing ID: ' + deletedproject._id);
			res.format({
				html: function () {
					res.redirect("/projects");
				},
				json: function () {
					res.json({ message: 'deleted', item: deletedproject });
				}
			});
		} catch (err) {
			res.status(500).send("Error deleting project: " + err);
		}
	});


module.exports = router;
