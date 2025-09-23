import express from "express";
import Announcement from "../models/Announcement.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

import multer from "multer";
import fs from "fs";
import path from "path";

const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + safeOriginal);
  },
});

const imageFilter = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files are allowed"));
};

const upload = multer({ storage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.post("/upload-image", authenticateToken, requireAdmin, upload.single("image"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    return res.json({ url, filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size });
  } catch (err) {
    return res.status(500).json({ message: "Error uploading image", error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { q, tag, page = 1, limit = 10 } = req.query;
    const query = { isPublished: true };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [items, total] = await Promise.all([
      Announcement.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Announcement.countDocuments(query),
    ]);

    res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Error fetching announcements", error: err.message });
  }
});

router.get("/all", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { q, tag, page = 1, limit = 10 } = req.query;
    const query = {};
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
        { tags: { $regex: q, $options: "i" } },
      ];
    }
    if (tag) {
      query.tags = { $in: [tag] };
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      Announcement.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Announcement.countDocuments(query),
    ]);
    res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: "Error fetching admin announcements", error: err.message });
  }
});

router.get("/admin/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const item = await Announcement.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Announcement not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Error fetching announcement", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await Announcement.findById(req.params.id);
    if (!item || !item.isPublished) {
      return res.status(404).json({ message: "Announcement not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Error fetching announcement", error: err.message });
  }
});

router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, content, images = [], links = [], tags = [], isPublished = true } = req.body;
    const doc = new Announcement({
      title,
      content,
      images,
      links,
      tags,
      isPublished,
      authorId: req.user.id,
      publishedAt: isPublished ? new Date() : undefined,
    });
    await doc.save();
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: "Error creating announcement", error: err.message });
  }
});

router.patch("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const updates = req.body;
    if (typeof updates.isPublished !== "undefined" && updates.isPublished && !updates.publishedAt) {
      updates.publishedAt = new Date();
    }
    const updated = await Announcement.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Announcement not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating announcement", error: err.message });
  }
});

router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const removed = await Announcement.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ message: "Announcement not found" });
    res.json({ message: "Announcement deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting announcement", error: err.message });
  }
});

export default router;
