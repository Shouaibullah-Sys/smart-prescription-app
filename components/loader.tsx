// // components/loader.tsx
// "use client";

// import { motion } from "motion/react";
// import { cn } from "@/lib/utils";
// import { Heart, Stethoscope, Shield, Activity } from "lucide-react";

// interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
//   title?: string;
//   subtitle?: string;
//   size?: "sm" | "md" | "lg";
//   variant?: "default" | "emergency" | "patient" | "medical";
//   showHospitalLogo?: boolean;
// }

// export default function Loader({
//   title = "Atlas Hospital",
//   subtitle = "Loading medical services... Please wait",
//   size = "md",
//   variant = "default",
//   showHospitalLogo = true,
//   className,
//   ...props
// }: LoaderProps) {
//   const sizeConfig = {
//     sm: {
//       container: "size-20",
//       titleClass: "text-sm/tight font-semibold",
//       subtitleClass: "text-xs/relaxed",
//       spacing: "space-y-2",
//       maxWidth: "max-w-48",
//       iconSize: 16,
//       logoSize: 20,
//     },
//     md: {
//       container: "size-32",
//       titleClass: "text-lg/snug font-bold",
//       subtitleClass: "text-sm/relaxed",
//       spacing: "space-y-3",
//       maxWidth: "max-w-64",
//       iconSize: 24,
//       logoSize: 32,
//     },
//     lg: {
//       container: "size-40",
//       titleClass: "text-xl/tight font-bold",
//       subtitleClass: "text-base/relaxed",
//       spacing: "space-y-4",
//       maxWidth: "max-w-80",
//       iconSize: 32,
//       logoSize: 40,
//     },
//   };

//   const variantConfig = {
//     default: {
//       color: "rgb(37, 99, 235)",
//       lightColor: "rgba(37, 99, 235, 0.5)",
//       icon: Heart,
//       iconColor: "text-blue-600",
//       bgGradient:
//         "from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900",
//     },
//     emergency: {
//       color: "rgb(220, 38, 38)",
//       lightColor: "rgba(220, 38, 38, 0.5)",
//       icon: Activity,
//       iconColor: "text-red-600",
//       bgGradient: "from-red-50 to-white dark:from-red-950/20 dark:to-gray-900",
//     },
//     patient: {
//       color: "rgb(5, 150, 105)",
//       lightColor: "rgba(5, 150, 105, 0.5)",
//       icon: Stethoscope,
//       iconColor: "text-emerald-600",
//       bgGradient:
//         "from-emerald-50 to-white dark:from-emerald-950/20 dark:to-gray-900",
//     },
//     medical: {
//       color: "rgb(139, 92, 246)",
//       lightColor: "rgba(139, 92, 246, 0.5)",
//       icon: Shield,
//       iconColor: "text-violet-600",
//       bgGradient:
//         "from-violet-50 to-white dark:from-violet-950/20 dark:to-gray-900",
//     },
//   };

//   const config = sizeConfig[size];
//   const variantStyle = variantConfig[variant];
//   const IconComponent = variantStyle.icon;

//   return (
//     <div
//       className={cn(
//         "flex flex-col items-center justify-center gap-8 p-8 rounded-xl",
//         "bg-gradient-to-br",
//         variantStyle.bgGradient,
//         className
//       )}
//       {...props}
//     >
//       {/* Hospital-themed loader with medical cross */}
//       <motion.div
//         className={cn("relative", config.container)}
//         animate={{
//           scale: [1, 1.02, 1],
//         }}
//         transition={{
//           duration: 4,
//           repeat: Number.POSITIVE_INFINITY,
//           ease: [0.4, 0, 0.6, 1],
//         }}
//       >
//         {/* Outer medical ring - pulse effect */}
//         <motion.div
//           className="absolute inset-0 rounded-full"
//           style={{
//             background: `conic-gradient(from 0deg, transparent 0deg, ${variantStyle.color} 120deg, transparent 240deg)`,
//             mask: `radial-gradient(circle at 50% 50%, transparent 30%, black 32%, black 35%, transparent 37%)`,
//             WebkitMask: `radial-gradient(circle at 50% 50%, transparent 30%, black 32%, black 35%, transparent 37%)`,
//           }}
//           animate={{
//             rotate: [0, 360],
//             opacity: [0.7, 0.9, 0.7],
//           }}
//           transition={{
//             duration: 3,
//             repeat: Number.POSITIVE_INFINITY,
//             ease: "linear",
//           }}
//         />

//         {/* Medical cross animation */}
//         <motion.div
//           className="absolute inset-0 flex items-center justify-center"
//           animate={{
//             rotate: [0, 180, 360],
//             scale: [1, 1.1, 1],
//           }}
//           transition={{
//             duration: 4,
//             repeat: Number.POSITIVE_INFINITY,
//             ease: "easeInOut",
//           }}
//         >
//           <div className="relative">
//             {/* Cross shape */}
//             <div className="absolute -inset-2">
//               <div className="absolute top-1/2 left-0 w-full h-2 -translate-y-1/2 bg-current rounded-full" />
//               <div className="absolute left-1/2 top-0 h-full w-2 -translate-x-1/2 bg-current rounded-full" />
//             </div>
//             {/* Animated rings around cross */}
//             <motion.div
//               className="absolute -inset-4 rounded-full border-2"
//               style={{ borderColor: variantStyle.color }}
//               animate={{
//                 scale: [1, 1.5, 1],
//                 opacity: [0.3, 0, 0.3],
//               }}
//               transition={{
//                 duration: 2,
//                 repeat: Number.POSITIVE_INFINITY,
//                 ease: "easeOut",
//               }}
//             />
//           </div>
//         </motion.div>

//         {/* Pulsing dots representing vital signs */}
//         {[0, 90, 180, 270].map((rotation, index) => (
//           <motion.div
//             key={index}
//             className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
//             style={{
//               backgroundColor: variantStyle.color,
//               transformOrigin: `0px ${
//                 config.container.includes("40") ? "80px" : "64px"
//               }`,
//             }}
//             initial={{ rotate: rotation }}
//             animate={{
//               scale: [1, 1.5, 1],
//               opacity: [0.5, 1, 0.5],
//             }}
//             transition={{
//               duration: 1.5,
//               repeat: Number.POSITIVE_INFINITY,
//               delay: index * 0.2,
//               ease: "easeInOut",
//             }}
//           />
//         ))}

//         {/* Inner rotating ring with heartbeat pattern */}
//         <motion.div
//           className="absolute inset-8 rounded-full"
//           style={{
//             background: `conic-gradient(from 0deg, transparent 0deg, ${variantStyle.color} 45deg, ${variantStyle.lightColor} 90deg, transparent 135deg)`,
//             mask: `radial-gradient(circle at 50% 50%, transparent 40%, black 42%, black 45%, transparent 47%)`,
//             WebkitMask: `radial-gradient(circle at 50% 50%, transparent 40%, black 42%, black 45%, transparent 47%)`,
//           }}
//           animate={{
//             rotate: [0, 360],
//           }}
//           transition={{
//             duration: 6,
//             repeat: Number.POSITIVE_INFINITY,
//             ease: "linear",
//           }}
//         />

//         {/* Central icon with heartbeat animation */}
//         <motion.div
//           className="absolute inset-0 flex items-center justify-center"
//           animate={{
//             scale: [1, 1.2, 1],
//           }}
//           transition={{
//             duration: 1.5,
//             repeat: Number.POSITIVE_INFINITY,
//             ease: "easeInOut",
//           }}
//         >
//           <IconComponent
//             size={config.iconSize}
//             className={cn(variantStyle.iconColor, "opacity-90")}
//           />
//         </motion.div>
//       </motion.div>

//       {/* Enhanced Typography with Hospital Branding */}
//       <motion.div
//         className={cn("text-center", config.spacing, config.maxWidth)}
//         initial={{ opacity: 0, y: 12 }}
//         animate={{
//           opacity: 1,
//           y: 0,
//         }}
//         transition={{
//           delay: 0.4,
//           duration: 1,
//           ease: [0.4, 0, 0.2, 1],
//         }}
//       >
//         {/* Hospital Logo and Name */}
//         {showHospitalLogo && (
//           <motion.div
//             className="flex items-center justify-center gap-3 mb-4"
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{
//               opacity: 1,
//               scale: 1,
//             }}
//             transition={{
//               delay: 0.6,
//               duration: 0.8,
//               ease: [0.4, 0, 0.2, 1],
//             }}
//           >
//             <div className="relative">
//               <motion.div
//                 className="w-8 h-8 rounded-full flex items-center justify-center"
//                 style={{ backgroundColor: variantStyle.color }}
//                 animate={{
//                   rotate: [0, 360],
//                 }}
//                 transition={{
//                   duration: 20,
//                   repeat: Number.POSITIVE_INFINITY,
//                   ease: "linear",
//                 }}
//               >
//                 <Heart className="w-5 h-5 text-white" fill="white" />
//               </motion.div>
//               <motion.div
//                 className="absolute -inset-2 border-2 rounded-full"
//                 style={{ borderColor: variantStyle.color }}
//                 animate={{
//                   scale: [1, 1.2, 1],
//                   opacity: [0.3, 0, 0.3],
//                 }}
//                 transition={{
//                   duration: 2,
//                   repeat: Number.POSITIVE_INFINITY,
//                   ease: "easeOut",
//                 }}
//               />
//             </div>
//             <div className="text-left">
//               <h2 className="text-sm font-bold text-gray-900 dark:text-white">
//                 ATLAS HOSPITAL
//               </h2>
//               <p className="text-xs text-gray-600 dark:text-gray-400">
//                 Excellence in Healthcare
//               </p>
//             </div>
//           </motion.div>
//         )}

//         {/* Animated status messages */}
//         <motion.div className="space-y-3">
//           <motion.h1
//             className={cn(
//               config.titleClass,
//               "text-gray-900 dark:text-white font-bold tracking-tight antialiased"
//             )}
//             initial={{ opacity: 0, y: 12 }}
//             animate={{
//               opacity: 1,
//               y: 0,
//             }}
//             transition={{
//               delay: 0.8,
//               duration: 0.8,
//               ease: [0.4, 0, 0.2, 1],
//             }}
//           >
//             <motion.span
//               animate={{
//                 opacity: [0.9, 1, 0.9],
//               }}
//               transition={{
//                 duration: 2,
//                 repeat: Number.POSITIVE_INFINITY,
//                 ease: "easeInOut",
//               }}
//             >
//               {title}
//             </motion.span>
//           </motion.h1>

//           <motion.p
//             className={cn(
//               config.subtitleClass,
//               "text-gray-600 dark:text-gray-300 font-medium antialiased"
//             )}
//             initial={{ opacity: 0, y: 8 }}
//             animate={{
//               opacity: 1,
//               y: 0,
//             }}
//             transition={{
//               delay: 1,
//               duration: 0.8,
//               ease: [0.4, 0, 0.2, 1],
//             }}
//           >
//             <motion.span
//               animate={{
//                 opacity: [0.7, 0.9, 0.7],
//               }}
//               transition={{
//                 duration: 3,
//                 repeat: Number.POSITIVE_INFINITY,
//                 ease: "easeInOut",
//               }}
//             >
//               {subtitle}
//             </motion.span>
//           </motion.p>

//           {/* Animated progress dots */}
//           <motion.div
//             className="flex items-center justify-center gap-2 pt-2"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 1.2 }}
//           >
//             {[0, 1, 2].map((i) => (
//               <motion.div
//                 key={i}
//                 className="w-2 h-2 rounded-full"
//                 style={{ backgroundColor: variantStyle.color }}
//                 animate={{
//                   scale: [1, 1.5, 1],
//                   opacity: [0.5, 1, 0.5],
//                 }}
//                 transition={{
//                   duration: 1.2,
//                   repeat: Number.POSITIVE_INFINITY,
//                   delay: i * 0.3,
//                   ease: "easeInOut",
//                 }}
//               />
//             ))}
//           </motion.div>
//         </motion.div>

//         {/* Optional loading status messages */}
//         <motion.div
//           className="pt-4 text-xs text-gray-500 dark:text-gray-400"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 1.4 }}
//         >
//           <motion.div
//             animate={{
//               opacity: [0.5, 1, 0.5],
//             }}
//             transition={{
//               duration: 4,
//               repeat: Number.POSITIVE_INFINITY,
//               ease: "easeInOut",
//             }}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <Activity className="w-3 h-3" />
//               <span>Initializing medical systems...</span>
//             </div>
//           </motion.div>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }

// // Example usage variants
// export function EmergencyLoader() {
//   return (
//     <Loader
//       title="Emergency Response System"
//       subtitle="Connecting to trauma team..."
//       variant="emergency"
//       className="bg-gradient-to-br from-red-50/50 to-white"
//     />
//   );
// }

// export function PatientPortalLoader() {
//   return (
//     <Loader
//       title="Accessing Patient Records"
//       subtitle="Loading your medical history securely..."
//       variant="patient"
//       showHospitalLogo={false}
//     />
//   );
// }

// export function MedicalRecordsLoader() {
//   return (
//     <Loader
//       title="Medical Database"
//       subtitle="Retrieving patient information..."
//       variant="medical"
//     />
//   );
// }
