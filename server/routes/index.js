// Import required modules and functions
import express from "express";
import { bookTicket, getUserReceipt, getTicketList, deleteTicket, getAvailableSeats, udpateTicket } from "../controllers/index.js";

// Create a new router instance
const router = express.Router();

/* CREATE */
/* POST Book train ticket */
router.post("/bookTicket", bookTicket);

/* READ */
/* GET User train ticket receipt */
router.get("/receipt/:email", getUserReceipt);

/* READ */
/* GET available seats */
router.get("/availableSeats", getAvailableSeats);


/* READ */
/* GET ticket list */
router.get("/tickets", getTicketList);

/* UPDATE */
/* UPDATE ticket */
router.put("/ticket", udpateTicket);

/* DELETE */
/* DELETE ticket  */
router.delete("/ticket/:id", deleteTicket);


// Export the router for use in other modules
export default router;