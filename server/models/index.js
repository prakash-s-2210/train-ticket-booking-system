import mongoose from "mongoose";

// Define a schema for the user
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
});

// Define a schema for the seat
const seatSchema = new mongoose.Schema({
  section: { type: String, enum: ["A", "B"], required: true },
  seatNumber: { type: Number, required: true },
  bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the user who booked the seat
});

// Define a schema for the ticket
const ticketSchema = new mongoose.Schema({
  from: { type: String, required: true, default: "London" },
  to: { type: String, required: true, default: "France" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  seat: { type: mongoose.Schema.Types.ObjectId, ref: "Seat" },
  pricePaid: { type: Number, default: 20 }, // Assuming a fixed price for the ticket
});

// Define models based on the schemas
export const User = mongoose.model("User", userSchema);
export const Seat = mongoose.model("Seat", seatSchema);
export const Ticket = mongoose.model("Ticket", ticketSchema);
