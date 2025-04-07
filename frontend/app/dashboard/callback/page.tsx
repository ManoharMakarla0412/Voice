// "use client";
// import { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { BASE_URL } from "../../utils/constants";
// import {
//   AlertCircle,
//   Home,
//   ArrowLeft,
//   CheckCircle2,
//   Calendar,
//   Loader2,
//   Info,
// } from "lucide-react";
// import Link from "next/link";

// export default function OAuthCallback() {
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [success, setSuccess] = useState(false);
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   useEffect(() => {
//     const handleOAuthCallback = async () => {
//       const code = searchParams.get("code"); // Extract the `code` parameter from the URL

//       if (!code) {
//         setError("Authorization code not found in URL.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await fetch(`${BASE_URL}/api/auth/calendly`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ code }),
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.error || "Failed to handle OAuth callback");
//         }

//         const data = await response.json();

//         if (data.token) {
//           setSuccess(true);
//           // Add a small delay to show success before redirect
//           setTimeout(() => {
//             router.push("/dashboard/calendly"); // Redirect on success
//           }, 1500);
//         } else {
//           throw new Error(data.message || "Unknown error occurred");
//         }
//       } catch (err: any) {
//         setError(err.message || "Something went wrong");
//         setLoading(false);
//       }
//     };

//     handleOAuthCallback();
//   }, [searchParams, router]);

//   return (
//     <div className="p-4 md:p-8 min-h-screen flex items-center justify-center">
//       <div className="max-w-md w-full">
//         {/* Main Card */}
//         <div className="card bg-base-300/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg">
//           <div className="card-body">
//             <h2 className="card-title justify-center text-xl font-bold mb-6 flex items-center gap-2">
//               <Calendar className="text-primary" />
//               Calendly Integration
//             </h2>

//             {error ? (
//               <div className="space-y-4">
//                 <div className="flex flex-col items-center gap-3">
//                   <div className="avatar avatar-placeholder">
//                     <div className="bg-error/20 text-error rounded-full w-16 h-16 flex items-center justify-center">
//                       <AlertCircle size={32} />
//                     </div>
//                   </div>
//                   <h3 className="font-bold text-lg">Authorization Failed</h3>
//                 </div>

//                 <div className="alert alert-error shadow-md border border-error/30">
//                   <AlertCircle size={18} />
//                   <span>{error}</span>
//                 </div>
//               </div>
//             ) : success ? (
//               <div className="space-y-4">
//                 <div className="flex flex-col items-center gap-3">
//                   <div className="avatar avatar-placeholder">
//                     <div className="bg-success/20 text-success rounded-full w-16 h-16 flex items-center justify-center">
//                       <CheckCircle2 size={32} />
//                     </div>
//                   </div>
//                   <h3 className="font-bold text-lg">
//                     Authorization Successful
//                   </h3>
//                 </div>

//                 <div className="alert alert-success shadow-md border border-success/30">
//                   <CheckCircle2 size={18} />
//                   <span>Calendly has been successfully connected!</span>
//                 </div>

//                 <div className="flex items-center justify-center">
//                   <span className="loading loading-dots loading-md text-primary"></span>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-5">
//                 <div className="flex flex-col items-center gap-3">
//                   <div className="avatar avatar-placeholder">
//                     <div className="bg-primary/20 text-primary rounded-full w-16 h-16 flex items-center justify-center">
//                       <Loader2 size={32} className="animate-spin" />
//                     </div>
//                   </div>
//                   <h3 className="font-bold text-lg">
//                     Processing Authorization
//                   </h3>
//                 </div>

//                 <div className="alert alert-info shadow-md border border-info/30">
//                   <Info size={18} />
//                   <span>Connecting to your Calendly account...</span>
//                 </div>

//                 <div className="w-full bg-base-200/50 rounded-full h-2.5 shadow-inner">
//                   <div className="bg-primary h-2.5 rounded-full loading-progress"></div>
//                 </div>
//               </div>
//             )}

//             <div className="card-actions justify-center mt-6">
//               <Link
//                 href="/dashboard"
//                 className="btn  btn-primary rounded-lg btn-outline btn-sm shadow-sm"
//               >
//                 <ArrowLeft size={16} /> Return to Dashboard
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Information Card */}
//         <div className="card bg-base-300/80 backdrop-blur-xl border-2 border-primary/30 shadow-lg mt-6">
//           <div className="card-body p-4">
//             <div className="flex items-start gap-2">
//               <Info size={16} className="shrink-0 mt-0.5 text-info" />
//               <p className="text-sm text-base-content/80">
//                 This page handles the OAuth authorization flow with Calendly.
//                 You'll be redirected automatically when the process completes.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
