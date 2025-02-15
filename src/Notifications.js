import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, doc, getDocs, updateDoc, onSnapshot } from "firebase/firestore";
import { FaExclamationTriangle } from "react-icons/fa";

const Notifications = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Step 1: Fetch all students and map { uid: username }
    const fetchStudents = async () => {
      try {
        const studentsRef = collection(db, "students");
        const studentSnapshot = await getDocs(studentsRef);
        const studentData = {};

        studentSnapshot.forEach((doc) => {
          const data = doc.data();
          studentData[data.uid] = data.username || "Unknown Student"; // Use data.uid as key
        });

        setStudentsMap(studentData);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    // Step 2: Listen to Emergency collection for real-time updates
    const emergencyQuery = collection(db, "Emergency");

    const unsubscribeEmergencies = onSnapshot(emergencyQuery, (querySnapshot) => {
      const emergencyList = querySnapshot.docs.map((doc) => ({
        id: doc.id, // This is the uid we need to match
        ...doc.data(),
        studentUsername: studentsMap[doc.id] || "Unknown Student", // Match doc.id (Emergency UID) with studentsMap[uid]
      }));

      setEmergencies(emergencyList);

      // Count only "Pending" emergencies for notification count
      setPendingCount(emergencyList.filter((e) => e.status === "Pending").length);
    });

    return () => unsubscribeEmergencies();
  }, [studentsMap]); // Re-run when studentsMap updates

  // Open modal with selected emergency details
  const handleOpenModal = (emergency) => {
    setSelectedEmergency(emergency);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmergency(null);
  };

  // Update Emergency Request Status (Approve/Deny)
  const handleUpdateStatus = async (status) => {
    if (selectedEmergency) {
      try {
        const emergencyRef = doc(db, "Emergency", selectedEmergency.id);
        await updateDoc(emergencyRef, { status });

        setEmergencies((prev) =>
          prev.map((emergency) =>
            emergency.id === selectedEmergency.id ? { ...emergency, status } : emergency
          )
        );

        handleCloseModal();
      } catch (error) {
        console.error(`Error updating emergency request to ${status}:`, error);
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">🚨 Emergency Requests</h2>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-700">
          Pending Emergencies: {pendingCount}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {emergencies.length > 0 ? (
          emergencies.map((emergency) => (
            <div
              key={emergency.id}
              className="bg-white shadow-lg rounded-lg p-5 transition transform hover:scale-105 cursor-pointer border-l-4 border-gray-500 hover:border-gray-700"
              onClick={() => handleOpenModal(emergency)}
            >
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-red-500 text-xl" />
                <h3 className="text-lg font-semibold">{emergency.reason}</h3>
              </div>
              <p className="text-gray-600 mt-2">
                <strong>Student Name:</strong> {emergency.studentUsername}
              </p>

              <p className="text-sm text-gray-500">
                {emergency.timestamp
                  ? new Date(emergency.timestamp.toDate()).toLocaleString()
                  : "No timestamp"}
              </p>
              <span
                className={`inline-block px-3 py-1 text-sm font-medium mt-3 rounded ${
                  emergency.status === "Approved"
                    ? "bg-green-500 text-white"
                    : emergency.status === "Denied"
                    ? "bg-red-500 text-white"
                    : "bg-yellow-400 text-gray-800"
                }`}
              >
                {emergency.status || "Pending"}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No emergency notifications available.</p>
        )}
      </div>

      {/* Modal for viewing emergency details */}
      {isModalOpen && selectedEmergency && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              🆘 Emergency Request Details
            </h3>
            <p className="text-gray-700">
              <strong>Reason:</strong> {selectedEmergency.reason}
            </p>
            <p className="text-gray-700">
              <strong>Requested By:</strong> {selectedEmergency.studentUsername}
            </p>
            <p className="text-gray-600 text-sm">
              <strong>Timestamp:</strong>{" "}
              {selectedEmergency.timestamp
                ? new Date(selectedEmergency.timestamp.toDate()).toLocaleString()
                : "No timestamp"}
            </p>

            <div className="flex justify-between mt-6">
              <button
                className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow-md transition"
                onClick={() => handleUpdateStatus("Approved")}
              >
                ✅ Approve
              </button>
              <button
                className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-md transition"
                onClick={() => handleUpdateStatus("Denied")}
              >
                ❌ Deny
              </button>
              <button
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-lg shadow-md transition"
                onClick={handleCloseModal}
              >
                🔙 Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
