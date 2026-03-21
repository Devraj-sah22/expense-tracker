// import React, { useState } from "react";
// import NepaliDate from "nepali-date-converter";

// const NepaliCalendar = ({ onSelect }) => {
//   const today = new NepaliDate();

//   const [year, setYear] = useState(today.getYear());
//   const [month, setMonth] = useState(today.getMonth());
//   const [selected, setSelected] = useState(today.getDate());

//   const monthNames = [
//     "बैशाख", "जेठ", "असार", "श्रावण", "भाद्र",
//     "आश्विन", "कार्तिक", "मंसिर", "पौष",
//     "माघ", "फाल्गुन", "चैत्र"
//   ];

//   const weekDays = ["आ", "सो", "मं", "बु", "बि", "शु", "श"];

//   // 🔥 Generate calendar grid dynamically
//   const days = [];
//   const firstDay = new NepaliDate(year, month, 1).getDay();

//   // Empty slots
//   for (let i = 0; i < firstDay; i++) {
//     days.push(null);
//   }

//   // Days loop (safe max 32)
//   for (let d = 1; d <= 32; d++) {
//     try {
//       const bsDate = new NepaliDate(year, month, d);
//       const ad = bsDate.toJsDate();

//       days.push({
//         bs: d,
//         ad: ad.getDate(),
//       });
//     } catch {
//       break;
//     }
//   }

//   const handleSelect = (day) => {
//     setSelected(day.bs);

//     const formatted = `${year}-${String(month + 1).padStart(2, "0")}-${String(day.bs).padStart(2, "0")}`;

//     onSelect({
//       date: formatted,
//       calendarType: "bikram-sambat",
//     });
//   };

//   return (
//     <div className="bg-[#1c1f26] text-white p-4 rounded-xl shadow-xl w-80">

//       {/* 🔥 HEADER WITH YEAR + MONTH CONTROL */}
//       <div className="flex justify-between items-center mb-3">

//         {/* LEFT CONTROLS */}
//         <div className="flex items-center gap-1">
//           {/* Year back */}
//           <button
//             onClick={() => setYear((y) => y - 1)}
//             className="px-2 py-1 hover:bg-gray-700 rounded"
//           >
//             ⏪
//           </button>

//           {/* Month back */}
//           <button
//             onClick={() =>
//               setMonth((m) => {
//                 if (m === 0) {
//                   setYear((y) => y - 1);
//                   return 11;
//                 }
//                 return m - 1;
//               })
//             }
//             className="px-2 py-1 hover:bg-gray-700 rounded"
//           >
//             ◀
//           </button>
//         </div>

//         {/* CENTER TITLE */}
//         <div className="text-center">
//           <div className="font-semibold text-lg">
//             {monthNames[month]} {year}
//           </div>

//           <div className="text-xs text-gray-400">
//             {new Date().toLocaleString("en-US", {
//               month: "short",
//               year: "numeric",
//             })}
//           </div>
//         </div>

//         {/* RIGHT CONTROLS */}
//         <div className="flex items-center gap-1">
//           {/* Month forward */}
//           <button
//             onClick={() =>
//               setMonth((m) => {
//                 if (m === 11) {
//                   setYear((y) => y + 1);
//                   return 0;
//                 }
//                 return m + 1;
//               })
//             }
//             className="px-2 py-1 hover:bg-gray-700 rounded"
//           >
//             ▶
//           </button>

//           {/* Year forward */}
//           <button
//             onClick={() => setYear((y) => y + 1)}
//             className="px-2 py-1 hover:bg-gray-700 rounded"
//           >
//             ⏩
//           </button>
//         </div>
//       </div>

//       {/* 🔥 WEEK HEADER */}
//       <div className="grid grid-cols-7 text-center text-sm mb-2">
//         {weekDays.map((d, i) => (
//           <div key={i} className={i === 6 ? "text-red-500" : ""}>
//             {d}
//           </div>
//         ))}
//       </div>

//       {/* 🔥 DAYS GRID */}
//       <div className="grid grid-cols-7 gap-1 text-center">
//         {days.map((day, i) =>
//           day ? (
//             <div
//               key={i}
//               onClick={() => handleSelect(day)}
//               className={`
//                 p-2 rounded-lg cursor-pointer
//                 ${day.bs === selected ? "bg-blue-500" : "hover:bg-gray-700"}
//               `}
//             >
//               <div className="text-sm">{day.bs}</div>
//               <div className="text-[10px] text-gray-400">{day.ad}</div>
//             </div>
//           ) : (
//             <div key={i}></div>
//           )
//         )}
//       </div>
//     </div>
//   );
// };

// export default NepaliCalendar;