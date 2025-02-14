import React from "react";

const Notifications = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      <ul className="space-y-3">
        <li className="bg-gray-100 p-3 rounded shadow">📌 New student registered</li>
        <li className="bg-gray-100 p-3 rounded shadow">📌 System update scheduled</li>
        <li className="bg-gray-100 p-3 rounded shadow">📌 Reminder: Meeting at 3 PM</li>
      </ul>
    </div>
  );
};

export default Notifications;
