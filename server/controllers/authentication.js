const jwt = require('jwt-simple');
const User = require('../models/user');
require('dotenv').config()

function tokenForUser(user) {
	const timestamp = new Date().getTime();
	return jwt.encode({ sub: user.id, iat: timestamp }, process.env.SECRET);
}

exports.signin = function(req, res, next) {
	// User has already had their email and password auth'd
	// We just need to give them a token
	res.send({ token: tokenForUser(req.user), id: req.user.id });
}

exports.signup = function(req, res, next) {
	const email = req.body.email;
	const password = req.body.password;

	if (!email || !password) {
		return res.status(422).send({ error: 'You must provide username and password' });
	}

	// See if a user with a given email exists
	User.findOne({ email: email }, function(err, existingUser) {
		if (err) { return next(err); }

		// If a user with email does exist, return an Error
		if (existingUser) {
			return res.status(422).send({ error: 'Username is in use' });
		}

		// If a user with email does NOT exist, create and save user record
		const name = 'Enter your name';
		const bio = 'Update your bio';
		const location = 'Update your location';
		const user = new User({
			email: email,
			label: email,
			password: password,
			about: { name, bio, location, image: '' },
			tracks: []
		});

		user.save(function(err) {
			if (err) { return next(err); }

			// Respond to request indicating the user was created
			res.json({ token: tokenForUser(user), id: user.id });
		});
	});
}
