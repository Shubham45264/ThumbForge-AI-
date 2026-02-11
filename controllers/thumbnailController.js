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
    const thumbnail = await Thumbnail.findOneAndDelete({
      _id: request.params.id,
      user: request.user.id,
    });
    if (!thumbnail) {
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
      } catch (err) {
        request.log.error(`Failed to delete file: ${filepath}`, err);
      }
    }

    reply.send({ message: "Thumbnail deleted successfully" });
  } catch (error) {
    reply.send(error);
  }
};

exports.deleteAllThumbnails = async (request, reply) => {
  try {
    const { ids } = request.body || {};
    let query = { user: request.user.id };

    if (ids && Array.isArray(ids) && ids.length > 0) {
      query._id = { $in: ids };
    }

    const thumbnails = await Thumbnail.find(query);
    await Thumbnail.deleteMany(query);

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
          request.log.error(`Failed to delete file: ${filepath}`, err);
        }
      }
    }
    reply.send({ message: "Thumbnails deleted successfully" });
  } catch (error) {
    reply.send(error);
  }
};
