// import axios from "axios";
// import { useState, ChangeEvent, FormEvent } from "react";
// import { Notification } from "./notifier";

// interface FormData {
//   forecasted: string;
//   produced: string;
// }

// interface DialogProps {
//     openDialog: boolean;
//     setOpenDoalog: React.Dispatch<React.SetStateAction<boolean>>;
// }

// export default function SingleDataFormDialog({ openDialog, setOpenDoalog }: DialogProps) {
//   const [formData, setFormData] = useState<FormData>({
//     forecasted: "",
//     produced: "",
//   });

//   const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
//     const { name, value } = e.target;
//     if(parseInt(value) <= 0){

//     }
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async(e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     console.log("Forecasted Electricity:", formData.forecasted);
//     console.log("Produced Electricity:", formData.produced);
//     setOpenDoalog(false);
//     const currentDate = Date.now();
//     const csvData = `${localStorage.getItem('email')},${currentDate},${formData.forecasted},${formData.produced}`;
    
//     // Handle form submission logic here
//     console.log("Result String:", csvData);
    
//     try {
//         const response = await axios.post("/api/agent/file-upload", {
//           agentEndpoint: localStorage.getItem("agentEndpoint"),
//           csvData,
//           connectionId: localStorage.getItem("id"),
//           email: localStorage.getItem("selectedOrg"),
//         });
  
//         console.log(response);
  
//         Notification({
//           type: "success",
//           title: "This data has been sent successfully.",
//         });
//       } catch (error) {
//         if (axios.isAxiosError(error)) {
//           if (error.response) {
           
//               Notification({
//                 type: "error",
//                 title: "Failed to send file",
//                 text:
//                   error.response.data?.message ||
//                   "An unexpected error occurred while sending the file.",
//               });
            
//           } else if (error.request) {
//             Notification({
//               type: "error",
//               title: "Network Error",
//               text: "Unable to reach the server. Please check your internet connection.",
//             });
//           } 
//         } else {
//           Notification({
//             type: "error",
//             title: "Failed to send file",
//             text: "An unexpected error occurred while sending the file.",
//           });
//         }
//       }
//   };

//   return (
//     <div>
//       {openDialog && (
//         <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
//           <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
//             <h2 className="text-xl font-bold mb-4 text-center">
//               Electricity Data
//             </h2>

//             <form
//               onSubmit={handleSubmit}
//               className="rounded px-8 pt-6 pb-8 mb-4"
//             >
//               <div className="mb-4">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="forecasted"
//                 >
//                   Forecasted Electricity (kWh)
//                 </label>
//                 <input
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                   id="forecasted"
//                   type="number"
//                   name="forecasted"
//                   placeholder="Enter forecasted electricity"
//                   value={formData.forecasted}
//                   onChange={handleInputChange}
//                   required
//                   min="0"
//                 />
//               </div>

//               <div className="mb-4">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="produced"
//                 >
//                   Produced Electricity (kWh)
//                 </label>
//                 <input
//                   className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                   id="produced"
//                   type="number"
//                   name="produced"
//                   placeholder="Enter produced electricity"
//                   value={formData.produced}
//                   onChange={handleInputChange}
//                   required
//                   min="0"
//                 />
//               </div>

//               <div className="flex items-center justify-between">
//                 <button
//                   className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//                   onClick={() => setOpenDoalog(false)}
//                   type="button"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//                   type="submit"
//                 >
//                   Submit
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
