const authService = require('../services/auth.service');

exports.register = async (req, res) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const user = await authService.login(req.body);
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.loginWithGoogle = async (req, res) => {
    try {
        console.log("!23");
        const user = await authService.loginWithGoogle(req.body.idToken);
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
