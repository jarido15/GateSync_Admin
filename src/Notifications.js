import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, doc, getDocs, updateDoc, onSnapshot } from "firebase/firestore";
import { FaExclamationTriangle, FaIdCard } from "react-icons/fa";
import { Timestamp } from "firebase/firestore";

const Notifications = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [studentsMap, setStudentsMap] = useState({});
  const [scannedEntries, setScannedEntries] = useState([]);
  const [selectedScannedEntry, setSelectedScannedEntry] = useState(null);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Fetch all students and map { idNumber: { username, course, yearLevel } }
    const fetchStudents = async () => {
      try {
        const studentsRef = collection(db, "students");
        const studentSnapshot = await getDocs(studentsRef);
        const studentData = {};

        studentSnapshot.forEach((doc) => {
          const data = doc.data();
          studentData[data.idNumber] = {
            username: data.username || "Unknown Student",
            course: data.course || "Unknown Course",
            yearLevel: data.yearLevel || "Unknown Year Level",
          };
        });

        setStudentsMap(studentData);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    // Listen to Emergency collection for real-time updates
    const emergencyQuery = collection(db, "Emergency");
  
    const unsubscribeEmergencies = onSnapshot(emergencyQuery, (querySnapshot) => {
      const emergencyList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        studentUsername: doc.data().username || "Unknown Student", // Directly use the 'username' from the Emergency document
      }));
  
      setEmergencies(emergencyList);
  
      // Count only "Pending" emergencies for notification count
      setPendingCount((prevCount) =>
        emergencyList.filter((e) => e.status === "Pending").length +
        scannedEntries.filter((e) => e.status === "Pending").length
      );
    });
  
    return () => unsubscribeEmergencies();
  }, [scannedEntries]); // Add scannedEntries as dependency to update pending count when it's updated

  useEffect(() => {
    // Listen to scanned_ids collection for real-time updates
    const scannedQuery = collection(db, "scanned_ids");

    const unsubscribeScanned = onSnapshot(scannedQuery, (querySnapshot) => {
      const scannedList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        const studentDetails = studentsMap[data.idNumber] || {}; // Get the student details from the map

        return {
          id: doc.id,
          ...data,
          studentUsername: studentDetails.username || "Unknown Student",
          studentCourse: studentDetails.course || "Unknown Course",
          studentYearLevel: studentDetails.yearLevel || "Unknown Year Level",
          timestamp: data.timestamp instanceof Timestamp ? data.timestamp.toDate() : data.timestamp,
        };
      });

      setScannedEntries(scannedList);
  
      // Update pending count based on new scanned entries
      setPendingCount((prevCount) =>
        emergencies.filter((e) => e.status === "Pending").length +
        scannedList.filter((e) => e.status === "Pending").length
      );
    });

    return () => unsubscribeScanned();
  }, [studentsMap, emergencies]); // Re-run when studentsMap or emergencies updates

  // Open modal with selected emergency details
  // const handleOpenModal = (emergency) => {
  //   setSelectedEmergency(emergency);
  //   setIsModalOpen(true);
  // };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmergency(null);
    setSelectedScannedEntry(null); // Add this line to clear selectedScannedEntry when modal closes
  };

// Open modal and update Emergency status to "In Progress"
const handleOpenModal = async (emergency) => {
  if (emergency.status === "Pending") {
    try {
      const emergencyRef = doc(db, "Emergency", emergency.id);
      await updateDoc(emergencyRef, { status: "In Progress" });

      setEmergencies((prev) =>
        prev.map((e) =>
          e.id === emergency.id ? { ...e, status: "In Progress" } : e
        )
      );
    } catch (error) {
      console.error("Error updating emergency status to In Progress:", error);
    }
  }
  setSelectedEmergency(emergency);
  setIsModalOpen(true);
};

// Open modal and update Scanned Entry status to "In Progress"
const handleOpenScannedModal = async (entry) => {
  if (entry.status === "Pending") {
    try {
      const scannedRef = doc(db, "scanned_ids", entry.id);
      await updateDoc(scannedRef, { status: "In Progress" });

      setScannedEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id ? { ...e, status: "In Progress" } : e
        )
      );
    } catch (error) {
      console.error("Error updating scanned entry status to In Progress:", error);
    }
  }
  setSelectedScannedEntry(entry);
  setIsModalOpen(true);
};


  // // Open modal for scanned entry details
  // const handleOpenScannedModal = (entry) => {
  //   setSelectedScannedEntry(entry);
  //   setIsModalOpen(true);
  // };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Notifications</h2>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-700">
          Emergencies and Scanned Entries: {pendingCount}
        </h3>
      </div>

      {/* Emergency Requests */}
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
                <strong>Student Name:</strong> {emergency.username}
              </p>
              <p className="text-sm text-gray-500">
              <strong>Scan Time:</strong> {emergency.timestamp ? new Date(emergency.timestamp.toDate()).toLocaleString() : "No timestamp"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No emergency notifications available.</p>
        )}
      </div>

      {/* Scanned Entries */}
      <h3 className="text-2xl font-bold text-gray-700 mt-8 mb-4">Scanned Entries</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scannedEntries.length > 0 ? (
          scannedEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white shadow-lg rounded-lg p-5 transition transform hover:scale-105 cursor-pointer border-l-4 border-blue-500 hover:border-blue-700"
              onClick={() => handleOpenScannedModal(entry)}
            >
              <div className="flex items-center gap-3">
                <FaIdCard className="text-blue-500 text-xl" />
                <h3 className="text-lg font-semibold">Scanned Entry</h3>
              </div>
              <p className="text-gray-600">
                <strong>Student Name:</strong> {entry.studentUsername}
              </p>
              <p className="text-gray-600 mt-2">
                <strong>ID Number:</strong> {entry.idNumber}
              </p>
              <p className="text-gray-600">
                <strong>Course:</strong> {entry.studentCourse}
              </p>
              <p className="text-gray-600">
                <strong>Year Level:</strong> {entry.studentYearLevel}
              </p>
              <p className="text-sm text-gray-500">
              <strong>Scan Time:</strong> {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : "No timestamp"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No scanned entries available.</p>
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
            <strong>Scan Time:</strong>{" "}
              {selectedEmergency.timestamp
                ? new Date(selectedEmergency.timestamp.toDate()).toLocaleString()
                : "No timestamp"}
            </p>

            <div className="flex justify-center mt-6">
              <button
                className="px-4 py-2 bg-red-400 hover:bg-red-500 text-white font-medium rounded-lg shadow-md transition"
                onClick={handleCloseModal}
              >
                🔙 Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for scanned entry details */}
      {isModalOpen && selectedScannedEntry && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-semibold mb-3 text-gray-800">
              🆔 Scanned Entry Details
            </h3>
            <p className="text-gray-700">
              <strong>Student Name:</strong> {selectedScannedEntry.studentUsername}
            </p>
            <p className="text-gray-700">
              <strong>ID Number:</strong> {selectedScannedEntry.idNumber}
            </p>
            <p className="text-gray-700">
              <strong>Course:</strong> {selectedScannedEntry.studentCourse}
            </p>
            <p className="text-gray-700">
              <strong>Year Level:</strong> {selectedScannedEntry.studentYearLevel}
            </p>
            <p className="text-sm text-gray-500">
            <strong>Scan Time:</strong> {" "}
              {selectedScannedEntry.timestamp
                ? new Date(selectedScannedEntry.timestamp).toLocaleString()
                : "No timestamp"}
            </p>

         <div className="flex justify-center mt-6">
            <button
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-md transition"
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
