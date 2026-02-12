export default async function handler(req, res) {

  if (req.method !== "POST")
    return res.status(405).json({msg:"Method not allowed"});

  const {title, body, topic} = req.body;

  const response = await fetch(
    "https://fcm.googleapis.com/v1/projects/ganaza-0/messages:send",
    {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + process.env.FCM_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message:{
          topic: topic || "all",
          notification:{
            title: title,
            body: body
          }
        }
      })
    }
  );

  const data = await response.json();
  res.status(200).json(data);
}
