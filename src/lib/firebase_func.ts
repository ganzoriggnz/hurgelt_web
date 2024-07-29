import UserModel from "@/models/users.model";
import axios from "axios";

export async function sendNotificationfirebase({
  device_id,
  users_id,
  title,
  body,
  isNotif,
  datafile,
}: {
  device_id?: string[];
  users_id?: string[];
  title: string;
  body: string;
  isNotif: string;
  datafile: object;
}) {
  try {
    if (
      (device_id == null || device_id.length == 0) &&
      users_id != null &&
      users_id.length > 0
    ) {
      const device_token = await UserModel.find(
        { username: { $in: users_id }, device_token: { $ne: null } },
        { device_token: 1, _id: 0 }
      );
      device_id = device_token.map((item) => item?.device_token);
    }
    if (device_id != null && device_id.length > 0) {
      const perPage = 400;
      const totalPages = Math.ceil(device_id.length / perPage);
      if (totalPages != null && totalPages > 0) {
        for (let pageSent = 0; pageSent < totalPages; pageSent++) {
          const offset = perPage * pageSent;
          const paginatedItems = device_id.slice(
            offset,
            perPage * (pageSent + 1)
          );
          if (paginatedItems.length <= 400) {
            const data = {
              registration_ids: paginatedItems,
              data: { type: isNotif ?? "alert", data: datafile },
              notification: {
                title: title,
                body: body,
                android_channel_id: "silent",
                channel_id: "silent",
              },
              android: {
                priority: "high",
                notification: {
                  channelId: "silent",
                  title: title,
                  body: body,
                },
                android_channel_id: "silent",
                channel_id: "silent",
                fcmOptions: {},
                data: { type: isNotif ?? "alert", data: datafile },
              },
              content_available: true,
              priority: "high",

              apns: {
                alert: {
                  body: body,
                  title: title,
                },
                payload: {
                  aps: {
                    sound: "default",
                    "content-content": 1,
                  },
                },
              },
              aps: {
                sound: "default",
                "content-content": 1,
              },
            };
            await sendNotifcationFirebase(data);
          }
        }
      }
    }
  } catch (e) {
    console.log("[2] sendNotificationfirebase ::: ERROR :::: ", e);
  }
}
export async function sendNotificationfirebaseLevel({
  level,
  title,
  body,
  isNotif,
  datafile,
}: {
  level: number[];
  title: string;
  body: string;
  isNotif: string;
  datafile: object;
}) {
  try {
    let device_ids = [];
    if (level.length > 0) {
      const device_token = await UserModel.find(
        { level: { $in: level }, device_token: { $ne: null } },
        { device_token: 1, _id: 0 }
      );
      device_ids = device_token.map((item) => item?.device_token);
    }
    if (device_ids != null && device_ids.length > 0) {
      const perPage = 400;
      const totalPages = Math.ceil(device_ids.length / perPage);
      if (totalPages != null && totalPages > 0) {
        for (let pageSent = 0; pageSent < totalPages; pageSent++) {
          const offset = perPage * pageSent;
          const paginatedItems = device_ids.slice(
            offset,
            perPage * (pageSent + 1)
          );
          if (paginatedItems.length <= 400) {
            const data = {
              registration_ids: paginatedItems,
              data: { type: isNotif ?? "alert", data: datafile },
              notification: {
                title: title,
                body: body,
                android_channel_id: "silent",
                channel_id: "silent",
              },
              android: {
                priority: "high",
                notification: {
                  channelId: "silent",
                  title: title,
                  body: body,
                },
                android_channel_id: "silent",
                channel_id: "silent",
                fcmOptions: {},
                data: { type: isNotif ?? "alert", data: datafile },
              },
              content_available: true,
              priority: "high",

              apns: {
                alert: {
                  body: body,
                  title: title,
                },
                payload: {
                  aps: {
                    sound: "default",
                    "content-content": 1,
                  },
                },
              },
              aps: {
                sound: "default",
                "content-content": 1,
              },
            };
            await sendNotifcationFirebase(data);
          }
        }
      }
    }
  } catch (e) {
    console.log("[2] sendNotificationfirebase ::: ERROR :::: ", e);
  }
}

export async function sendNotifcationFirebase(data: object) {
  try {
    const headers = {
      Authorization: `key=${process.env.NOTIFICATIONKEY}`,
      "Content-type": "application/json; charset=utf-8",
    };
    axios
      .post("https://fcm.googleapis.com/fcm/send", data, {
        headers: headers,
      })
      .then((res) => {
        console.info("SUCCESS NOTIFICATION :: ", res.data);
      })
      .catch((err) => console.error("[1]", err));
  } catch (e) {
    console.log("sendNotifcation [3]", e);
  }
}
