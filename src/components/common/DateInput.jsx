import React from "react";
import { useCalendar } from "../../context/CalendarContext";
import { DatePicker } from "hamro-nepali-patro";
import "hamro-nepali-patro/dist/styles.css";
import { Calendar } from "lucide-react";

const DateInput = ({ value, onChange }) => {
    const { calendarSystem } = useCalendar();

    // 🌍 INTERNATIONAL (AD)
    if (calendarSystem === "international") {
        return (
            // <div className="relative">
            //     <input
            //         type="date"
            //         value={value || ""}
            //         onChange={(e) =>
            //             onChange({
            //                 date: e.target.value,
            //                 calendarType: "international",
            //             })
            //         }
            //         //onFocus={(e) => e.target.showPicker && e.target.showPicker()}
            //         // onClick={(e) => e.target.showPicker && e.target.showPicker()}
            //         className="w-full px-4 py-2 rounded-xl border bg-white text-black appearance-none"
            //     />

            //     <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-500 pointer-events-none" />
            // </div>
            <div className="relative w-full">

                <input
                    type="date"
                    value={value || ""}
                    onChange={(e) =>
                        onChange({
                            date: e.target.value,
                            calendarType: "international",
                        })
                    }
                    className="w-full pl-10 pr-10 py-3 rounded-xl border bg-gray-800 text-white appearance-none"
                />

                {/* LEFT ICON */}
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

            </div>
        );
    }

    // 🟣 BIKRAM SAMBAT (BS using library)
    return (
        <div className="relative w-full">

            <DatePicker
                value={typeof value === "string" ? value : ""}
                onChange={(date, adDate, bsDate, dateString) => {
                    onChange({
                        date: dateString || "",
                        calendarType: "bikram-sambat",
                    });
                }}
                calendarType="BS"
                dateFormat="yyyy-mm-dd"
                placeholder="Select BS Date"

                showMonthDropdown="full"
                showYearDropdown
                hideOnSelect

                // ✅ SAME DESIGN AS AD
                inputClassName="w-full pl-10 pr-10 py-3 rounded-xl border bg-gray-800 text-white"
            />

            {/* LEFT ICON */}
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

        </div>
    );
    // return (
    //     // <DatePicker
    //     //     value={value || ""}
    //     <DatePicker
    //         value={typeof value === "string" ? value : ""}
    //         onChange={(date, adDate, bsDate, dateString) => {
    //             onChange({
    //                 //date: dateString,
    //                 date: dateString || "",
    //                 calendarType: "bikram-sambat",
    //                 //adDate,
    //                 //bsDate,
    //             });
    //         }}
    //         calendarType="BS"
    //         dateFormat="yyyy-mm-dd"
    //         placeholder="Select BS Date"

    //         showMonthDropdown="full"
    //         showYearDropdown
    //         hideOnSelect

    //         //   // 🔥 DARK MODE UI
    //         inputClassName="w-full px-4 py-2 rounded-xl border bg-gray-800 text-white"

    //   calendarStyle={{
    //     backgroundColor: "#1c1f26",
    //     borderRadius: "12px",
    //     color: "white",
    //   }}

    //   theme={{
    //     "cl-primary": "#3b82f6",
    //     "cl-danger": "#ef4444",
    //   }}
    ///>

    //);
};

export default DateInput;