import express from "express";
import Announcement from "../models/Announcement.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public: list announcements with search, tag filter, pagination
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

// Admin: list all (published + drafts) with search
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

// Admin: get by id (including drafts)
router.get("/admin/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const item = await Announcement.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Announcement not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Error fetching announcement", error: err.message });
  }
});

// Public: single announcement by id
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

// Admin: create
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

// Admin: update
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

// Admin: delete
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