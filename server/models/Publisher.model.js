import mongoose from "mongoose";

const publisherSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  publishingHouse: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
});

const Publisher = mongoose.model("Publisher", publisherSchema);
export default Publisher;