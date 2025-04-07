// async function main() {
//   const fetch = (await import("node-fetch")).default;
//   const VAPI_TOKEN = "e009eade-80be-4308-a5cb-ce7543eb6744"; // Your VAPI token
//   const callIds = [
//     "7e807336-704e-4f77-aece-14b597f9ce07",
//     "9ecc4c58-e988-4f1c-9795-022d2a19a861",
//     "9e8c861e-dc1b-4555-81e0-aa017a6cc5da",
//     "37fa34d9-5798-4139-afc9-c50b02eb3a73",
//     "bca9102f-d76e-4946-974b-2fcb9252953b",
//     "bca2c12f-0b7a-457d-a539-5295a85701c0",
//     "cd791c71-9e51-422c-b58a-e93484c39fad",
//     "0f95f457-36f3-4d81-af53-e2a78122f9c5",
//     "ac7d8272-e871-4e18-a722-0ac4227b5f62",
//     "b43fd558-592f-4fd4-a315-e4e93de0fd71",
//     "2466c62e-448e-4ca9-a0e6-e13717696a42",
//     "33ae1057-d043-4c60-b40a-2ebbde356971",
//     "852a85f6-3b60-4886-8ccf-d25fb0fa28d4",
//     "e76a4878-9947-4308-b39d-7c1666d64231",
//     "fcfd40f5-f493-469a-b893-4d88bb810b1f",
//     "3d9e2572-9039-4700-9a90-eb453c82959e",
//     "f591b59a-4f5a-4e8b-976a-313911928512",
//     "1fece8de-1c6c-4132-af68-f62b139c608e",
//     "5f690926-3340-4060-8b51-283309a64f27",
//     "13b444b7-c904-48e7-9049-9d67a3b5ced2",
//     "9f1877bf-3c81-484e-9f75-7d5c851d0cf9",
//     "9f377b6f-8e2f-4c9d-a617-d7df914126a0",
//     "805a513b-120d-42cc-83ff-16c6dcd9d7fa",
//     "24f5917d-933d-4fc7-9589-75bfbf4a478f",
//     "faa26a41-8563-45f3-a157-b7507512ad84",
//     "5b4abfcd-91f1-4d00-ada1-5b6ca9c7bb81",
//     "918229bd-1195-466d-b6f4-e528308cd45a",
//     "dd1ecde4-07b9-47fe-9519-e0406cfb3e36",
//     "97aab2d1-911b-4522-b69c-b5cc241b04ec",
//     "64cd36bc-ca55-4d08-ac8d-c006e26caf74",
//     "bb018d5a-4cd5-47fa-8ec1-a6c252311173",
//     "1d9921be-fe6b-4e17-a39a-4df07cf5d685",
//     "6df13d5b-5ef3-48ee-b563-9191b0580858",
//     "86513f47-c6bb-43c4-8001-43d99b7faac1",
//     "e595f5c1-ecc1-4326-86af-48d5a63f0bd6",
//     "679c6025-cabf-4830-9b56-5c2baaa2714a",
//     "149d214c-2236-4401-a810-8c7bbdfb6a23",
//     "da72bb49-5ca2-4a68-b0bc-88fdda6c79c2",
//     "ceba7f83-ba34-49ce-8ac7-5f9f2cf2212b",
//     "66c8a43d-bcee-44ee-9e7e-865a997a74a0",
//     "8b630b67-e892-4855-81c6-d2bdaa5cc1c6",
//     "55944d08-4baa-4177-90e1-67c55b798e38",
//     "03f9cc2d-cfdb-4778-8ebc-d2e81ae921d5",
//     "c629a371-ab89-4dcf-be38-c1271928ad86",
//     "319b252e-752d-491d-9bba-0a3fd00d2a1a",
//     "e8163e72-a4da-4ddf-8d23-5d44b951ff02",
//     "bfa91b73-d7d1-4023-b504-ab1a5754f9e0",
//     "e1ebb5ed-2779-4c3c-b65c-344c9a9d0455",
//     "6a32a24f-dfb6-4a53-93a4-6e2f6dba4ba4",
//     "287c54c6-60ba-4da9-a5d3-40015e0e678a",
//     "6387273b-b3b5-4717-b77a-e5519305e27a",
//     "4c61ff12-7039-4a27-bc15-06e58c40c120",
//     "02a1effd-c943-420a-bfde-8bb7567ca5c8",
//   ];

//   async function deleteCall(callId) {
//     try {
//       const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${VAPI_TOKEN}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.ok) {
//         console.log(`Successfully deleted call: ${callId}`);
//       } else {
//         const errorData = await response.json();
//         console.error(`Failed to delete call ${callId}:`, errorData);
//       }
//     } catch (error) {
//       console.error(`Error deleting call ${callId}:`, error.message);
//     }
//   }

//   async function deleteAllCalls() {
//     for (const callId of callIds) {
//       await deleteCall(callId);
//       // Optional: Add a small delay to avoid rate limiting
//       await new Promise((resolve) => setTimeout(resolve, 500));
//     }
//     console.log("Finished deleting all calls.");
//   }

//   await deleteAllCalls();
// }

// main().catch(console.error);
