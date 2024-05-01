import { IncomingForm } from "formidable";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = new IncomingForm({ keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing the form:", err);
      return res
        .status(500)
        .json({ error: "There was an error parsing the files" });
    }

    const file = files.file[0];

    if (!file || !file.filepath) {
      return res
        .status(400)
        .json({ error: "No file uploaded or file path is missing." });
    }

    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    try {
      const fileStream = fs.createReadStream(file.filepath);
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${file.originalFilename || "default_name"}`,
        Body: fileStream,
      };

      const command = new PutObjectCommand(uploadParams);
      const result = await s3Client.send(command);
      res.status(200).json({
        message: "File uploaded successfully",
        textInput: fields.text, // Send text input back for confirmation
      });
      const apiEndpoint =
        "https://8jse5pnfcl.execute-api.us-east-2.amazonaws.com/stageOne/fovus";

      const fileKey = file.originalFilename || "default_name"; // Ensure there's a default or fetched filename.
      const dataToSend = {
        text_input: fields.text.toString(), // Make sure 'fields.text' exists and is correct.
        file_path: `s3://fovuschallengebuck/${fileKey}`,
        id: "1234", // Ensure the ID is correctly provided.
      };
      console.log(
        "Sending to Lambda:",
        JSON.stringify({ body: JSON.stringify(dataToSend) })
      );

      fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: JSON.stringify(dataToSend) }), // Double stringify as per your Lambda setup.
      })
        .then((response) => response.json())
        .then((data) => console.log("Success:", data))
        .catch((error) => console.error("Error:", error));

      // fetch(
      //   "https://8jse5pnfcl.execute-api.us-east-2.amazonaws.com/stageOne/storeData",
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       text_input: fields.text,
      //       file_path: "s3://fovuschallengebuck/" + file.originalFilename,
      //       id: "1", // This should be generated or passed appropriately
      //     }),
      //   }
      // )
      //   .then((response) => response.json())
      //   .then((data) => console.log(data))
      //   .catch((error) => console.error("Error:", error));
    } catch (s3Err) {
      console.error("S3 upload error:", s3Err);
      res.status(500).json({ error: "Upload to S3 failed", detail: s3Err });
    }
  });
}
