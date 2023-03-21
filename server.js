import * as AWS from "@aws-sdk/client-rekognition";
import { CompareFacesCommand } from "@aws-sdk/client-rekognition";
import express, { json, urlencoded } from "express";
import {
  AWS_BUCKET_NAME,
  AWS_BUCKET_REGION,
  AWS_PUBLIC_KEY,
  AWS_SECRET_KEY,
} from "./config.js";

const app = express();
app.disable("X-Powered-By");
app.use(json());
app.use(urlencoded({ extended: false }));

const rekognitionClient = new AWS.RekognitionClient({
  region: AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: AWS_PUBLIC_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, token, x-access-token"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

app.listen(3000, () => {
  console.log("Escuchando por el puerto", 3000);
});

app.post("/server", async (req, res) => {
  const buffer = Buffer.from(req.body.base64Url, "base64");

  const params = {
    SourceImage: {
      Bytes: buffer,
    },
    TargetImage: {
      S3Object: {
        Bucket: AWS_BUCKET_NAME,
        Name: `${req.body.username}.jpg`,
      },
    },
    SimilarityThreshold: 70,
  };
  try {
    const command = new CompareFacesCommand(params);
    const data = await rekognitionClient.send(command);
    return res.status(200).json({
      message: "ok, 200",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      ok: false,
      error,
    });
  }
});
