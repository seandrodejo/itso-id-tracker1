import { Schema, model } from "mongoose";

const AnnouncementSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" }, // markdown/plain text
    images: [{ type: String }], // array of image URLs
    links: [{ type: String }],  // external links
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date },
    authorId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

AnnouncementSchema.pre("save", function (next) {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export default model("Announcement", AnnouncementSchema);