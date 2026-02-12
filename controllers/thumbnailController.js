const Thumbnail = require('../models/thumbnail');
const path = require('path');
const fs = require('fs');
const { pipeline } = require('stream');
const util = require("util");

const pipelineAsync = util.promisify(pipeline);

exports.createThumbnail = async (request, reply) => {
  try {
    const parts = request.parts();
    let fields = {};
    let savedFilename;

    for await (const part of parts) {
      if (part.file) {
        savedFilename = `${Date.now()}-${part.filename}`;
        const saveTo = path.join(
          __dirname,
          '..',
          "uploads",
          "Thumbnails",
          savedFilename
        );

        // Ensure directory exists
        const dir = path.dirname(saveTo);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        await pipelineAsync(part.file, fs.createWriteStream(saveTo));
      } else {
        fields[part.fieldname] = part.value;
      }
    }

    if (!savedFilename) {
      return reply.badRequest("Image file is required");
    }

    const thumbnail = new Thumbnail({
      user: request.user.id,
      videoName: fields.videoName,
      version: fields.version,
      image: `/uploads/Thumbnails/${savedFilename}`,
      paid: fields.paid === "true"
    });

    await thumbnail.save();
    reply.code(201).send(thumbnail);
  } catch (error) {
    request.log.error(error);
    reply.send(error);
  }
};

exports.getThumbnails = async (request, reply) => {
  try {
    const thumbnails = await Thumbnail.find({ user: request.user.id });
    reply.send(thumbnails);
  } catch (error) {
    reply.send(error);
  }
};

exports.getThumbnail = async (request, reply) => {
  try {
    const thumbnail = await Thumbnail.findOne({
      _id: request.params.id,
      user: request.user.id
    });
    if (!thumbnail) {
      return reply.notFound("Thumbnail not found");
    }
    reply.send(thumbnail);
  } catch (error) {
    reply.send(error);
  }
};

exports.updateThumbnail = async (request, reply) => {
  try {
    const updatedData = request.body;
    const thumbnail = await Thumbnail.findOneAndUpdate(
      {
        _id: request.params.id,
        user: request.user.id,
      },
      updatedData,
      { new: true }
    );
    if (!thumbnail) {
      return reply.notFound("Thumbnail not found");
    }
    reply.send(thumbnail);
  } catch (error) {
    reply.send(error);
  }
};

exports.deleteThumbnail = async (request, reply) => {
  try {
    const { id } = request.params;
    request.log.info({ id, user: request.user.id }, "Attempting to delete thumbnail");

    const thumbnail = await Thumbnail.findOneAndDelete({
      _id: id,
      user: request.user.id,
    });

    if (!thumbnail) {
      request.log.warn({ id }, "Thumbnail not found for deletion");
      return reply.notFound("Thumbnail not found");
    }

    const filepath = path.join(
      __dirname,
      "..",
      "uploads",
      "Thumbnails",
      path.basename(thumbnail.image)
    );

    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
        request.log.info({ filepath }, "Deleted associated file");
      } catch (err) {
        request.log.error({ filepath, err }, "Failed to delete file");
      }
    }

    reply.send({ message: "Thumbnail deleted successfully" });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: "Delete failed", message: error.message });
  }
};

exports.deleteAllThumbnails = async (request, reply) => {
  try {
    const { ids } = request.body || {};
    request.log.info({ ids, user: request.user.id }, "Bulk delete request received");

    let query = { user: request.user.id };

    if (ids && Array.isArray(ids) && ids.length > 0) {
      query._id = { $in: ids };
    } else if (!ids) {
      // If no body provided, delete all for user (optional behavior, maybe safer to return error)
      // For now, let's keep it but log it
      request.log.warn("Deleting ALL thumbnails for user as no ids provided");
    } else {
      return reply.badRequest("Invalid ids provided");
    }

    const thumbnails = await Thumbnail.find(query);
    const result = await Thumbnail.deleteMany(query);

    request.log.info({ deletedCount: result.deletedCount }, "Thumbnails deleted from DB");

    for (const thumbnail of thumbnails) {
      const filepath = path.join(
        __dirname,
        "..",
        "uploads",
        "Thumbnails",
        path.basename(thumbnail.image)
      );

      if (fs.existsSync(filepath)) {
        try {
          fs.unlinkSync(filepath);
        } catch (err) {
          request.log.error({ filepath, err }, "Failed to delete file in bulk delete");
        }
      }
    }
    reply.send({
      message: "Thumbnails deleted successfully",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    request.log.error(error);
    reply.code(500).send({ error: "Bulk delete failed", message: error.message });
  }
};
