const router = require("express").Router();
const { User } = require("../../models");

// route to add user
router.post("/", async (req, res) => {
  try {
    const newUser = await User.create(req.body);

    req.session.save(() => {
        req.session.user_id = newUser.id;
        req.session.userName = newUser.userName;
        req.session.logged_in = true;

        req.ststus(200).json(newUser);
    })
  } catch (err) {
    res.status(400).json(err);
  }
});

// route to login existing user
router.post("/login", async (req, res) => {
  try {
    const userData = await User.findOne({
      where: {
        userName: req.body.userName,
      },
    });

    if (!userData) {
      res
        .status(400)
        .json({ message: "Incorrect Username or Password. Please try again." });
      return;
    }

    const validatePassword = await userData.checkPassword(req.body.password);

    if (!validatePassword) {
      res
        .status(400)
        .json({ message: "Incorrect Username or Password. Please try again" });
      return;
    }

    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.userName = userData.userName
      req.session.logged_in = true;

      res.json({ user: userData, message: "Your are logged in" });
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

// route to logout
router.post('/logout', (req,res) => {
    if (req.session.logged_in) {
        res.session.destroy(() => {
            res.status(204).end();
        })
    } else {
        res.status(404).end();
    }
})

module.exports = router;