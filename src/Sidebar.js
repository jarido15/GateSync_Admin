import React, { useState, useEffect } from "react";
import { AiOutlineSchedule, AiOutlineBell, AiOutlineLogout, AiOutlineDashboard } from "react-icons/ai";
import { db } from "./firebase"; // Import your Firestore configuration
import { collection, query, where, onSnapshot } from "firebase/firestore"; // Correct Firestore imports

const Sidebar = ({ setActivePage }) => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Set up a real-time listener for updates to the "Emergency" collection where status is "Pending"
    const unsubscribe = onSnapshot(
      query(collection(db, "Emergency"), where("status", "==", "Pending")),
      (querySnapshot) => {
        // Update the pendingCount to the number of documents with "Pending" status
        setPendingCount(querySnapshot.size);
      },
      (error) => {
        console.error("Error fetching pending requests: ", error);
      }
    );

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="h-screen w-64 bg-blue-900 text-white flex flex-col py-6 px-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Panel</h2>
      <ul className="space-y-4">
        <li
          className="flex items-center space-x-3 p-3 hover:bg-blue-700 cursor-pointer transition"
          onClick={() => setActivePage("dashboard")}
        >
          <AiOutlineDashboard size={22} />
          <span>Dashboard</span>
        </li>
        <li
          className="flex items-center space-x-3 p-3 hover:bg-blue-700 cursor-pointer transition"
          onClick={() => setActivePage("schedules")}
        >
          <AiOutlineSchedule size={22} />
          <span>Schedules</span>
        </li>
        <li
          className="flex items-center space-x-3 p-3 hover:bg-blue-700 cursor-pointer transition"
          onClick={() => setActivePage("notifications")}
        >
          <AiOutlineBell size={22} />
          <span className="flex-1">Notifications</span>
          {pendingCount > 0 && (
            <span className="bg-red-500 text-xs text-white rounded-full px-2 py-0.5 ml-2">
              {pendingCount}
            </span>
          )}
        </li>
        <li
          className="flex items-center space-x-3 p-3 hover:bg-blue-700 cursor-pointer transition"
          onClick={() => alert("Logging out...")}
        >
          <AiOutlineLogout size={22} />
          <span>Logout</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
