import { User, Seat, Ticket } from "../models/index.js";
/* BOOK TICKET */
/**
 * create a new ticket in the database.
 * Returns the created ticket object in the response.
 */
export const bookTicket = async (req, res) => {
  try {
    const { from, to, firstName, lastName, email } = req.body;
    let user;

    // Step 1: Find the user's ID using their email
    user = await User.findOne({ email: email });

    if (!user) {
      user = new User({
        firstName,
        lastName,
        email,
      });

      await user.save();
    }

    // Step 2: Count the number of booked seats in section A
    const seatsBookedInA = await Seat.countDocuments({
      section: "A",
    });

    // Step 3: Count the number of booked seats in section B
    const seatsBookedInB = await Seat.countDocuments({
      section: "B",
    });

    // Step 4: Determine the section to book the ticket based on seat counts
    let sectionToBook;
    let seatNumberToBook;

    // Finding missing seat numbers;
    const findMissingNumbers = (arr, start, end) => {
      const allNumbers = new Set(
        Array.from({ length: end - start + 1 }, (_, i) => i + start)
      );
      const existingNumbers = new Set(arr);

      const missingNumbers = [...allNumbers].filter(
        (num) => !existingNumbers.has(num)
      );

      return missingNumbers;
    };

    if (seatsBookedInA < 50) {
      sectionToBook = "A";
      let seatNumbersInAscendingOrder = await Seat.find({
        section: "A",
      })
        .sort({ seatNumber: 1 }) // Sort in ascending order based on seatNumber
        .select("seatNumber");

      seatNumbersInAscendingOrder = seatNumbersInAscendingOrder.map(
        (seat) => seat.seatNumber
      );

      seatNumberToBook = findMissingNumbers(seatNumbersInAscendingOrder, 1, 50);
    } else if (seatsBookedInB < 50) {
      sectionToBook = "B";
      let seatNumbersInAscendingOrder = await Seat.find({
        section: "B",
      })
        .sort({ seatNumber: 1 }) // Sort in ascending order based on seatNumber
        .select("seatNumber");

      seatNumbersInAscendingOrder = seatNumbersInAscendingOrder.map(
        (seat) => seat.seatNumber
      );

      seatNumberToBook = findMissingNumbers(seatNumbersInAscendingOrder, 1, 50);
    } else {
      res
        .status(400)
        .json({ error: "No available seats in both section A and B" });
      return;
    }

    // Step 5: Find an available seat in the determined section and book the seat for the user
    const newSeat = new Seat({
      section: sectionToBook,
      seatNumber:
        seatNumberToBook[Math.floor(Math.random(seatNumberToBook.length))],
      bookedBy: user._id,
    });

    await newSeat.save();

    // Step 6: Create a new ticket using the user and seat IDs
    const newTicket = new Ticket({
      user: user._id,
      seat: newSeat._id,
      pricePaid: 20, // You can adjust the price based on your logic
    });

    await newTicket.save();

    // Step 7: Return the section and seat details in the API response
    res.status(201).json({
      message: "Ticket created successfully",
      section: sectionToBook,
      seatNumber: seatNumberToBook,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* GET USER TICKET RECEIPT */
/**
 * get a user ticket from the database.
 * Returns all the ticket receipts booked by the user.
 */

export const getUserReceipt = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: "Invalid Email" });
      return;
    }
    const ticketReceipts = await Ticket.find({ user: user._id })
      .populate({
        path: "user",
        model: User,
      })
      .populate({
        path: "seat",
        model: Seat,
      });

    res.status(200).json(ticketReceipts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET AVAILABLE SEATS */
/**
 * get a available seat numbers for section A and B from the database.
 * Returns all the seat numbers for section A and B.
 */

export const getAvailableSeats = async (req, res) => {
  try {
    const findMissingNumbers = (arr, start, end) => {
      const allNumbers = new Set(
        Array.from({ length: end - start + 1 }, (_, i) => i + start)
      );
      const existingNumbers = new Set(arr);

      const missingNumbers = [...allNumbers].filter(
        (num) => !existingNumbers.has(num)
      );

      return missingNumbers;
    };

    let seatNumbersSectionA = await Seat.find({
      section: "A",
    })
      .sort({ seatNumber: 1 }) // Sort in ascending order based on seatNumber
      .select("seatNumber");

    seatNumbersSectionA = seatNumbersSectionA.map((seat) => seat.seatNumber);

    seatNumbersSectionA = findMissingNumbers(seatNumbersSectionA, 1, 50);
    let seatNumbersSectionB = await Seat.find({
      section: "B",
    })
      .sort({ seatNumber: 1 }) // Sort in ascending order based on seatNumber
      .select("seatNumber");

    seatNumbersSectionB = seatNumbersSectionB.map((seat) => seat.seatNumber);

    seatNumbersSectionB = findMissingNumbers(seatNumbersSectionB, 1, 50);

    res
      .status(200)
      .json({ sectionA: seatNumbersSectionA, sectionB: seatNumbersSectionB });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* GET TICKET LIST */
/**
 * get all ticket from the database.
 * Returns all the tickets.
 */

export const getTicketList = async (req, res) => {
  try {
    const ticketList = await Ticket.find({})
      .populate({
        path: "user",
        model: User,
      })
      .populate({
        path: "seat",
        model: Seat,
      });

    // Initialize an object to store tickets for each section
    const sectionViewTickets = {
      sectionA: [],
      sectionB: [],
    };

    // Group tickets based on the section
    ticketList.forEach((ticket) => {
      if (ticket.seat.section === "A") {
        sectionViewTickets.sectionA.push(ticket);
      } else {
        sectionViewTickets.sectionB.push(ticket);
      }
    });
    res.status(200).json(sectionViewTickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* UPDATE TICKET */
/**
 * update a user ticket from the database.
 **/

export const udpateTicket = async (req, res) => {
  try {
    const { currentSection, newSection, currentSeatNo, newSeatNo } = req.body;

    const seat = await Seat.findOne({
      section: currentSection,
      seatNumber: currentSeatNo,
    });

    const ticket = await Ticket.findOne({
      seat: seat._id
    });

    const newSeat = new Seat({
      section: newSection,
      seatNumber: newSeatNo,
      bookedBy: ticket.user,
    });

    await newSeat.save();

    const newTicket = new Ticket({
      user: ticket.user,
      seat: newSeat._id,
      pricePaid: 20, 
    });

    await newTicket.save();

    const deletedSeat = await Seat.findOneAndDelete({
      _id: seat._id,
    });

    const deletedTicket = await Ticket.findOneAndDelete({
      _id: ticket._id,
    });
    
    res.status(200).json("Ticket updated successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* DELETE TICKET */
/**
 * delete a user ticket from the database.
 **/

export const deleteTicket = async (req, res) => {
  try {
    let { id } = req.params;

    const ticket = await Ticket.findOne({
      _id: id,
    });

    const deletedSeat = await Seat.findOneAndDelete({
      _id: ticket.seat._id,
    });

    const deletedTicket = await Ticket.findOneAndDelete({
      _id: id,
    });
    res.status(200).json("Ticket deleted successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
