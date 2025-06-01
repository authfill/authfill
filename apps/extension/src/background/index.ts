/// <reference types="chrome"/>

// interface GmailMessage {
//   id: string;
//   threadId: string;
// }

// interface GmailMessagesResponse {
//   messages: GmailMessage[];
//   nextPageToken?: string;
// }

// interface UserInfoResponse {
//   email: string;
// }

// async function getUserId(token: string): Promise<string> {
//   const response = await fetch(
//     "https://www.googleapis.com/oauth2/v2/userinfo",
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
//   const data: UserInfoResponse = await response.json();
//   return data.email;
// }

// async function getLatestMessages(token: string, userId: string) {
//   const response = await fetch(
//     `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages?maxResults=10`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
//   const data: GmailMessagesResponse = await response.json();
//   return data.messages;
// }

// async function getMessageDetails(
//   token: string,
//   userId: string,
//   messageId: string
// ) {
//   const response = await fetch(
//     `https://gmail.googleapis.com/gmail/v1/users/${userId}/messages/${messageId}`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
//   const data: GmailMessageResponse = await response.json();
//   return data;
// }

// chrome.identity.getAuthToken(
//   {
//     interactive: true,
//     scopes: [
//       "https://www.googleapis.com/auth/userinfo.email",
//       "https://www.googleapis.com/auth/gmail.readonly",
//     ],
//   },
//   async (token: string | undefined) => {
//     if (chrome.runtime.lastError || !token) {
//       console.error("Failed to get auth token:", chrome.runtime.lastError);
//       return;
//     }

//     try {
//       const userId = await getUserId(token);
//       const messages = await getLatestMessages(token, userId);
//       const message = await getMessageDetails(token, userId, messages[0].id);
//       console.log("Latest message:", message);
//     } catch (error) {
//       console.error("Error fetching Gmail data:", error);
//     }
//   }
// );
