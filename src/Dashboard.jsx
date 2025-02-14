import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Schedules from "./Schedules";
import Notifications from "./Notifications";
import StudentTable from "./StudentTable";

const Dashboard = () => {
  const [activePage, setActivePage] = useState("students");

  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <Sidebar setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="flex-1 p-6 bg-gray-100">
        {activePage === "schedules" && <Schedules />}
        {activePage === "notifications" && <Notifications />}
        {activePage === "students" && <StudentTable />}
      </div>
    </div>
  );
};

export default Dashboard;
