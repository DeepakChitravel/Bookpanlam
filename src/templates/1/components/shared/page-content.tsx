// "use client";

// import { useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import { getWebsitePageBySlug } from "@/lib/api/website-pages";
// import { Loader2 } from "lucide-react";

// interface Page {
//   id: number;
//   pageId: string;
//   name: string;
//   slug: string;
//   content: string;
//   createdAt?: string;
// }

// interface PageContentProps {
//   page?: Page;
//   site: string;
// }

// const PageContent = ({ page: initialPage, site }: PageContentProps) => {
//   const params = useParams();
//   const slug = params.slug as string;
  
//   const [page, setPage] = useState<Page | null>(initialPage || null);
//   const [loading, setLoading] = useState(!initialPage);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     // If we don't have initial page data, fetch it
//     if (!initialPage && slug) {
//       const fetchPage = async () => {
//         try {
//           setLoading(true);
//           const response = await getWebsitePageBySlug(site, slug);
          
//           if (response.success && response.data) {
//             setPage(response.data);
//           } else {
//             setError(response.message || "Page not found");
//           }
//         } catch (err) {
//           setError("Failed to load page");
//           console.error("Error fetching page:", err);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchPage();
//     }
//   }, [initialPage, site, slug]);

//   if (loading) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
//           <p className="text-gray-500">Loading page...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !page) {
//     return (
//       <div className="min-h-[60vh] flex items-center justify-center">
//         <div className="text-center max-w-md mx-auto px-4">
//           <h1 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h1>
//           <p className="text-gray-600 mb-8">
//             {error || "The page you're looking for doesn't exist or has been moved."}
//           </p>
//           <a
//             href={`/${site}`}
//             className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors"
//           >
//             Go to Homepage
//           </a>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <main className="min-h-screen bg-gray-50 py-12">
//       <div className="container max-w-4xl mx-auto px-4">
//         {/* Page Header */}
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">{page.name}</h1>
//           {page.createdAt && (
//             <p className="text-sm text-gray-500">
//               Last updated: {new Date(page.createdAt).toLocaleDateString()}
//             </p>
//           )}
//         </div>

//         {/* Page Content */}
//         <div className="bg-white rounded-lg shadow-sm p-8">
//           {page.content ? (
//             <div 
//               className="prose prose-lg max-w-none"
//               dangerouslySetInnerHTML={{ __html: page.content }}
//             />
//           ) : (
//             <p className="text-gray-500 text-center py-12">
//               This page has no content yet.
//             </p>
//           )}
//         </div>
//       </div>
//     </main>
//   );
// };

// export default PageContent;