require("dotenv").config();
const Ticket = require("../models/ticket");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ticket = require("../models/ticket");

router.use(express.json());

const users = [];

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

async function getTicket(req, res, next) {
  try {
    let ticket = await Ticket.findById(req.params.id);
    if (ticket == null) {
      return res.status(404).json({ message: "Cannot find Ticket" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.ticket = ticket;
  next();
}

//Getting all the tickets
router.get("/ticket/all", authenticateToken, async (req, res) => {
  try {
    const ticket = await Ticket.find(this.all);
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/ticket", async (req, res) => {
  var title2 = req.query.title;
  var status2 = req.query.sttus;
  let test_ticket = req.ticket;
  if (status2 != null) {
    try {
      var x = Ticket.find(function(test_ticket) {
        return test_ticket.sttus == status2;
      });
      res.json(x);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  if (title2 != null) {
    try {
      var x = Ticket.find(function(test_ticket) {
        return test_ticket.title == title2;
      });
      res.json(x);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
});

//Generating a new ticket
router.post("/ticket/new", async (req, res) => {
  const tickets = new Ticket({
    title: req.body.title,
    assTo: req.body.assTo,
    sttus: req.body.sttus,
  });
  try {
    const newTicket = await tickets.save();
    res.status(201).json(newTicket);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//Deleting the specified ticket
router.delete("/ticket/delete/:id", getTicket, async (req, res) => {
  try {
    await res.ticket.deleteOne();
    res.json({ message: "Deleted Ticket" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Getting a new user
router.post("/users", async (req, res) => {
  try {
    const hashedrole = await bcrypt.hash(req.body.role, 10);
    const user = { name: req.body.name, role: hashedrole };
    users.push(user);
    res.status(201).send();
  } catch {
    res.status(500).send();
  }
});

//Authentication of new user
router.post("/users/login", async (req, res) => {
  const user = users.find((user) => (user.name = req.body.name));
  if (user == null) {
    return res.status(400).send("Cannot find user");
  }
  try {
    if (await bcrypt.compare(req.body.role, user.role)) {
      const username = req.body.username;
      const user = { name: username };
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      res.json({ accessToken: accessToken });
      res.send("Success");
    } else {
      res.send("Not Allowed");
    }
  } catch {
    res.status(500).send();
  }
});

module.exports = router;
