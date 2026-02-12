import { google } from "googleapis";
import fs from "fs";

// توليد Access Token من Service Account
async function getAccessToken() {
  const serviceAccount = JSON.parse(fs.readFileSync("serviceAccount.json"));
  const jwtClient = new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    ['https://www.googleapis.com/auth/firebase.messaging']
  );
  const { access_token } = await jwtClient.authorize();
  return access_token;
}

// الدالة الرئيسية
export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(405).json({ msg: "Method Not Allowed" });

  const { title, body, target } = req.body;

  if (!title || !body || !target)
    return res.status(400).json({ msg: "Missing title, body, or target" });

  const accessToken = await getAccessToken();
  const projectId = "ganaza-0"; // ضع Project ID الخاص بك

  const message = {
    message: {
      topic: target, // "admin" أو "all"
      notification: { title, body },
      android: { priority: "high" },
      apns: { headers: { "apns-priority": "10" } }
    }
  };

  try {
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
      }
    );

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
