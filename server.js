// require express
var express = require("express");
// path module -- try to figure out where and why we use this
var path = require("path");
//mongoose 
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/basic_mongoose');
// create the express app
var app = express();
var bodyParser = require('body-parser');
// use it!
app.use(bodyParser.urlencoded({ extended: true }));
// MiddleWare: Session and Flash 
var session = require('express-session');
app.use(session({
	secret: 'cam_god',
	resave: false,
	saveUninitialized: true,
	cookie: { maxAge: 60000 }
}))
const flash = require('express-flash');
app.use(flash());
// static content
app.use(express.static(path.join(__dirname, "./static")));
// setting up ejs and our views folder
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// // Get sockets
// const server = app.listen(8000);
// const io = require('socket.io')(server);
// var counter = 0;

// io.on('connection', function (socket) { //2
// 	  //Insert SOCKETS 
// });

// Mongoose Schema users 
// var UserSchema = new mongoose.Schema({
// 	name: {type: String, required: true, minlength: 2},
// 	age: {type:Number, required: true, min: 1, max: 150}
// }, {timestamps: true})
// mongoose.model('User', UserSchema); // We are setting this Schema in our Models as 'User'
// var User = mongoose.model('User') // We are retrieving this Schema from our Models, named 'User'
const CommentSchema = new mongoose.Schema({
	comment: {type: String, required: [true, "Comments must have content"],minlength: [3, "Comments must be longer than 3 characters"]},
	name: {type: String, required: [true, "Comments must have authors"]},
}, {timestamps: true})
const MessageSchema = new mongoose.Schema({
	message: {type: String, required: [true, "Messages must have content"],minlength: [3, "Messages must be longer than 3 characters"]},
	name: {type: String, required: [true, "Messages must have authors"]},
	comments: [CommentSchema]
}, {timestamps: true})
mongoose.model('Comment', CommentSchema)
mongoose.model('Message', MessageSchema)
var Comment = mongoose.model('Comment')
var Message = mongoose.model('Message')
// // ...delete all records of the User Model
// Message.deleteMany({}, function(err){
// 	// This code will run when the DB has attempted to remove all matching records to {}
//    })

// root route to render the index.ejs view
app.get('/', function(req, res) {
	Message.find({}, function(err, msg_array) {
		if (err) {
			console.log("Error finding messages")
			res.render("index", {'err': err})
		}else {
			console.log(msg_array)
			res.render("index", {messages: msg_array})
		}
	})
})
// post route for adding a user
app.post('/message_post', function(req, res) {
	console.log("POST DATA", req.body);
	Message.create(req.body, function(err, data) {
		if (err) {
			console.log("Error creating message")
			res.redirect("/")
		}else{
			console.log("Succesffuly added message")
			// const all_messages= Message.find({})
			// console.log(all_messages)
			res.redirect("/")
		}
	})
})
app.post('/comment_post', function(req, res) {
	// console.log("POST DATA", req.body);
	Comment.create({comment: req.body.comment, name: req.body.name}, function(err, data) {
		if (err) {
			console.log("Error creating Comment")
			
			res.redirect("/")
		}else{
			Message.findOneAndUpdate({_id: req.body.msg_id}, {$push: {comments: data}}, function(err, data){
				if(err){
					console.log("Error adding comment to message", err.message)
					res.redirect("/")
				}else {
					console.log("Successfully added comment to message")
					res.redirect("/")
				}
			})
		}
	})
})

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', function(request, response){
	response.send("404")
});

// tell the express app to listen on port 8000
app.listen(8000, function() {
 console.log("listening on port 8000");
});