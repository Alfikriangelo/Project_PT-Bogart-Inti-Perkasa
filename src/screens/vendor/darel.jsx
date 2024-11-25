// import React, { useState } from "react";
// import { Toaster, toast } from "sonner";
// import { getFirestore, addDoc, collection } from "firebase/firestore";
// import "../firebaseConfig";

// const Form = () => {
//   const [formData, setFormData] = useState({
//     sppg: "",
//     antrian: "",
//     no_so: "",
//     no_kontrak: "",
//     nama: "",
//     no_do: "",
//     kuanta_10: "",
//     tgl_ambil: "",
//     berlaku: "",
//     no_urut: ""
//   });

//   const handleDateChange = (date, name) => {
//     setFormData({ ...formData, [name]: date });
//   };

//   const handleInputChange = (event) => {
//     const { name, value } = event.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const resetForm = () => {
//     setFormData({
//       sppg: "",
//       antrian: "",
//       no_so: "",
//       no_kontrak: "",
//       nama: "",
//       no_do: "",
//       kuanta_10: "",
//       tgl_ambil: "",
//       berlaku: "",
//       no_urut: ""
//     });
//   };

//   const db = getFirestore();

//   const saveData = async (event) => {
//     event.preventDefault();
//     try {
//       await addDoc(collection(db, "do_10"), {
//         sppg: formData.sppg,
//         antrian: formData.antrian,
//         no_so: formData.no_so,
//         no_kontrak: formData.no_kontrak,
//         nama: formData.nama,
//         no_do: formData.no_do,
//         kuanta_10: formData.kuanta_10,
//         tgl_ambil: formData.tgl_ambil,
//         berlaku: formData.berlaku,
//         no_urut: formData.no_urut,

//       });
//       toast.success("Data Berhasil Ditambahkan!");
//       resetForm();
//     } catch (e) {
//       toast.error(Gagal menambahkan data: ${e.message});
//       console.error("Error adding document: ", e);
//     }
//   };

//   return (
//     <>
//       <div className="text-container font-inter font-medium text-3xl ml-72 mb-4">
//         <p>Form DO 10%</p>
//         <p className="font-normal text-lg text-[#757575]">
//           Silahkan isi form dibawah
//         </p>
//       </div>
//       <div className="container w-[1200px] mx-auto p-4 pt-6 md:p-6 lg:p-12 border-2 border-gray-200 rounded-2xl">
//         <form onSubmit={saveData}>
//           <div className="flex flex-wrap -mx-3 mb-2">
//             <div className="flex flex-col mb-4">
//               <label
//                 className="text-inter font-normal text-sm mb-2"
//                 htmlFor="sppg"
//               >
//                 Nomor SPPG
//               </label>
//               <input
//                 className="bg-white h-10 w-60 border border-gray-300 rounded-lg p-4 pl-5 text-sm mr-5"
//                 name="sppg"
//                 type="text"
//                 value={formData.sppg}
//                 onChange={handleInputChange}
//                 placeholder="Value"
//               />
//             </div>
//             <div className="flex flex-col mb-4">
//               <label
//                 className="text-inter font-normal text-sm mb-2"
//                 htmlFor="antrian"
//               >
//                 Nomor Antrian
//               </label>
//               <input
//                 className="bg-white h-10 w-60 border border-gray-300 rounded-lg p-4 pl-5 text-sm mr-5"
//                 name="antrian"
//                 type="text"
//                 value={formData.antrian}
//                 onChange={handleInputChange}
//                 placeholder="Value"
//               />
//             </div>
//             <div className="flex flex-col mb-4">
//               <label
//                 className="text-inter font-normal text-sm mb-2"
//                 htmlFor="no_so"
//               >
//                 Nomor SO
//               </label>
//               <input
//                 className="bg-white h-10 w-60 border border-gray-300 rounded-lg p-4 pl-5 text-sm mr-5"
//                 name="no_so"
//                 type="text"
//                 value={formData.no_so}
//                 onChange={handleInputChange}
//                 placeholder="Value"
//               />
//             </div>
//             <div className="flex flex-col mb-4">
//               <label
//                 className="text-inter font-normal text-sm mb-2"
//                 htmlFor="no_kontrak"
//               >
//                 Nomor Urut
//               </label>
//               <input
//                 className="bg-white h-10 w-60 border border-gray-300 rounded-lg p-4 pl-5 text-sm mr-5"
//                 name="no_urut"
//                 type="text"
//                 value={formData.no_urut}
//                 onChange={handleInputChange}
//                 placeholder="Value"
//               />
//             </div>
//           </div>
//           <div className="flex flex-wrap -mx-3 mb-2">
//             <div className="flex flex-col mb-4">
//               <label
//                 className="text-inter font-normal text-sm mb-2"
//                 htmlFor="nama"
//               >
//                 Atas Nama
//               </label>
//               <input
//                 className="bg-white h-10 w-[500px] border border-gray-300 rounded-lg p-4 pl-5 text-sm mr-5"
//                 name="nama"
//                 type="text"
//                 value={formData.nama}
//                 onChange={handleInputChange}
//                 placeholder="Value"
//               />
//             </div>
//             <div className="flex flex-col mb-4">
//               <label
//                 className="text-inter font-normal text-sm mb-2"
//                 htmlFor="no_do"
//               >
//                 Nomor DO
//               </label>
//               <input
//                 className="bg-white h-10 w-60 border border-gray-300 rounded-lg p-4 pl-5 text-sm mr-5"
//                 name="no_do"
//                 type="text"
//                 value={formData.no_do}
//                 onChange={handleInputChange}
//                 placeholder="Value"
//               />
//             </div>
//             <div className="flex flex-col mb-4">
//               <label
//                 className="text-inter font-normal text-sm mb-2"
//                 htmlFor="kuanta_10"
//               >
//                 Nomor Kontrak
//               </label>
//               <input
//                 className="bg-white h-10 w-60 border border-gray-300 rounded-lg p-4 pl-5 text-sm mr-5"
//                 name="no_kontrak"
//                 type="text"
//                 value={formData.no_kontrak}
//                 onChange={handleInputChange}
//                 placeholder="Value"
//               />
//             </div>
//           </div>
//           <div className="flex flex-wrap -mx-3 mb-2">
//             <div className="flex flex-col mb-4">
//               <label
//                 className="text-inter font-normal text-sm mb-2"
//                 htmlFor="kuanta_10"
//               >
//                 Kuanta Ambil
//               </label>
//               <input
//                 className="bg-white h-10 w-60 border border-gray-300 rounded-lg p-4 pl-5 text-sm mr-5"
//                 name="kuanta_10"
//                 type="text"
//                 value={formData.kuanta_10}
//                 onChange={handleInputChange}
//                 placeholder="Value"
//               />
//             </div>
//             <div className="flex flex-col mb-4">
//               <label
//                 className="text-inter font-normal text-sm mb-2"
//                 htmlFor="tgl_ambil"
//               >
//                 Tanggal Ambil
//               </label>
//               <input
//                 className="bg-white h-10 w-60 border border-gray-300 rounded-lg p-4 pl-5 text-sm mr-5"
//                 name="tgl_ambil"
//                 type="date"
//                 value={formData.tgl_ambil}
//                 onChange={(event) =>
//                   handleDateChange(event.target.value, "tgl_ambil")
//                 }
//               />
//             </div>
//             <div className="flex flex-col mb-4">
//               <label
//                 className="text-inter font-normal text-sm mb-2"
//                 htmlFor="berlaku"
//               >
//                 Masa Berlaku
//               </label>
//               <input
//                 className="bg-white h-10 w-60 border border-gray-300 rounded-lg p-4 pl-5 text-sm mr-5"
//                 name="berlaku"
//                 type="date"
//                 value={formData.berlaku}
//                 onChange={(event) =>
//                   handleDateChange(event.target.value, "berlaku")
//                 }
//               />
//             </div>
//           </div>

//           <button
//             type="submit"
//             className="bg-[#2C2C2C] text-white hover:bg-gray-700 font-inter hover:text-white font-normal py-2 px-4 -ml-3 mt-6 rounded text-sm"
//           >
//             Kirim
//           </button>
//         </form>
//         <Toaster richColors position="top-right" closeButton={true} />
//       </div>
//     </>
//   );
// };

// export default Form;
