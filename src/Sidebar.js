import React from "react";
import { AiOutlineSchedule, AiOutlineBell, AiOutlineLogout, AiOutlineDashboard } from "react-icons/ai";

const Sidebar = ({ setActivePage }) => {
  return (
    <div className="h-screen w-64 bg-blue-900 text-white flex flex-col py-6 px-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Panel</h2>
      <ul className="space-y-4">
        <li 
          className="flex items-center space-x-3 p-3 hover:bg-blue-700 cursor-pointer transition"
          onClick={() => setActivePage("students")}
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
          <span>Notifications</span>
          <span className="bg-red-500 text-xs text-white rounded-full px-2 py-0.5 ml-auto">3</span>
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
