import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const Schedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students first
        const studentsSnapshot = await getDocs(collection(db, "students"));
        const studentsData = {};

        studentsSnapshot.forEach((doc) => {
          const student = doc.data();
          studentsData[student.uid] = {
            username: student.username || "Unknown",
            course: student.course || "N/A",
            yearLevel: student.yearLevel || "N/A",
          };
        });

        setStudents(studentsData);

        // Fetch schedules
        const scheduleSnapshot = await getDocs(collection(db, "schedules"));
        const scheduleData = scheduleSnapshot.docs
          .map((doc) => ({
            id: doc.id, // Schedule document ID (assuming it's UID)
            ...doc.data(),
          }))
          .filter((schedule) => studentsData[schedule.id]); // Keep schedules that match a student UID

        setSchedules(scheduleData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">Schedules</h2>
      <table className="w-full border-collapse bg-white shadow-md rounded-lg">
        <thead className="bg-blue-600 text-white">
          <tr className="text-center">
            <th className="py-4 px-6">UID</th>
            <th className="py-4 px-6">Student Name</th>
            <th className="py-4 px-6">Course</th>
            <th className="py-4 px-6">Year Level</th>
            <th className="py-4 px-6">Date</th>
            <th className="py-4 px-6">Class Start</th>
            <th className="py-4 px-6">Class End</th>
          </tr>
        </thead>
        <tbody>
          {schedules.length > 0 ? (
            schedules.map((schedule, index) => (
              <tr key={schedule.id} className={`text-center border-b border-gray-300 ${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200 transition`}>
                <td className="py-4 px-6">{schedule.id}</td>
                <td className="py-4 px-6">{students[schedule.id]?.username || "Unknown Student"}</td>
                <td className="py-4 px-6">{students[schedule.id]?.course || "N/A"}</td>
                <td className="py-4 px-6">{students[schedule.id]?.yearLevel || "N/A"}</td>
                <td className="py-4 px-6">{schedule.date || "N/A"}</td>
                <td className="py-4 px-6">{schedule.timeIn || "N/A"}</td>
                <td className="py-4 px-6">{schedule.timeOut || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center py-6 text-gray-600">No schedules found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Schedules;
