"use strict";

const campusFloors = {
  ground: {
    name: "Ground Floor",
    rooms: [
      { id: "G-ENT", name: "Main Entrance", type: "entrance", x: 0, z: 24 },
      { id: "G-1", name: "Administrative Office 1", type: "office", x: 22, z: 16.5 },
      { id: "G-2", name: "Administrative Office 2", type: "office", x: 11, z: 16.5 },
      { id: "G-3", name: "Board Room", type: "room", x: 2.5, z: 16.5 },
      { id: "G-4", name: "Principal Room", type: "office", x: -4.5, z: 16.5 },
      { id: "G-5", name: "Computer Network / Internet Lab", type: "lab", x: -13, z: 16.5 },
      { id: "G-6", name: "Programming Lab", type: "lab", x: -23, z: 16.5 },

      { id: "G-7", name: "Computer Network Lab", type: "lab", x: -37.5, z: -13.5 },
      { id: "G-8", name: "Multimedia Lab", type: "lab", x: -37.5, z: -8.5 },
      { id: "G-9", name: "Electrical Workshop Lab", type: "lab", x: -37.5, z: -2.5 },
      { id: "G-9A", name: "Department Office", type: "office", x: -37.5, z: 3 },
      { id: "G-12", name: "HOD Room", type: "office", x: -37.5, z: 14.5 },

      { id: "G-13", name: "Electrical Machines Lab", type: "lab", x: -38.5, z: -19.5 },
      { id: "G-14", name: "Circuit Lab", type: "lab", x: -31.5, z: -19.5 },
      { id: "G-15", name: "Concrete Technology / Geotech Lab", type: "lab", x: -23, z: -19.5 },
      { id: "G-16", name: "Mechanics of Structures Lab", type: "lab", x: -13, z: -19.5 },
      { id: "G-17", name: "Hydraulics Lab", type: "lab", x: -4, z: -19.5 },
      { id: "G-18", name: "Surveying Lab", type: "lab", x: 4, z: -19.5 },
      { id: "G-19", name: "CAD Drawing Hall", type: "lab", x: 14, z: -19.5 },
      { id: "G-20", name: "CAD Centre", type: "lab", x: 23.5, z: -19.5 },
      { id: "G-21", name: "HOD and Stationery Office", type: "office", x: 35, z: -19.5 },

      { id: "G-23", name: "Sick Room", type: "room", x: 37.5, z: -15 },
      { id: "G-25", name: "Microprocessor Lab IF", type: "lab", x: 37.5, z: -5.5 },
      { id: "G-26", name: "Microprocessor Lab CO", type: "lab", x: 37.5, z: -0.5 },
      { id: "G-27", name: "Hardware Lab IF", type: "lab", x: 37.5, z: 4.5 },
      { id: "G-28", name: "Hardware Lab CO", type: "lab", x: 37.5, z: 9.5 },

      { id: "G-F-S1", name: "Staircase 1", type: "staircase", x: 30.5, z: 16.5 },
      { id: "G-F-S2", name: "Staircase 2", type: "staircase", x: 30, z: -12 }
    ]
  },

  first: {
    name: "First Floor",
    rooms: [
      { id: "F1-101", name: "Programming Lab 101", type: "lab", x: 5, z: 16.5 },
      { id: "F1-102", name: "Computer Lab 102", type: "lab", x: -1, z: 16.5 },
      { id: "F1-103", name: "Electronics Workshop Lab 103", type: "lab", x: -7, z: 16.5 },
      { id: "F1-104", name: "LIC and Instrumentation Lab 104", type: "lab", x: -14, z: 16.5 },
      { id: "F1-105", name: "Basic and Applied Electronics Lab 105", type: "lab", x: -21, z: 16.5 },
      { id: "F1-106", name: "Communication / DTA Lab 106", type: "lab", x: -28, z: 16.5 },

      { id: "F1-107", name: "Power Electronics Lab", type: "lab", x: -37.5, z: 0.5 },
      { id: "F1-108", name: "Department Office / HOD Area", type: "office", x: -37.5, z: -8 },
      { id: "F1-109", name: "Boys Common Room", type: "room", x: -37.5, z: -9.5 },
      { id: "F1-110", name: "Gents Toilet", type: "facility", x: -37.5, z: -10 },
      { id: "F1-111", name: "HOD Room", type: "office", x: -37.5, z: -11 },

      { id: "F1-112", name: "Classroom 112", type: "classroom", x: -37.5, z: -19.5 },
      { id: "F1-113", name: "Classroom 113", type: "classroom", x: -30, z: -19.5 },
      { id: "F1-114", name: "Classroom 114", type: "classroom", x: -22.5, z: -19.5 },
      { id: "F1-115", name: "Classroom 115", type: "classroom", x: -13.5, z: -19.5 },
      { id: "F1-116", name: "Classroom 116", type: "classroom", x: -4.5, z: -19.5 },
      { id: "F1-117", name: "Classroom 117", type: "classroom", x: 4.5, z: -19.5 },
      { id: "F1-118", name: "Classroom 118", type: "classroom", x: 13.5, z: -19.5 },
      { id: "F1-119", name: "Classroom 119", type: "classroom", x: 22.5, z: -19.5 },
      { id: "F1-120", name: "Environmental Lab", type: "lab", x: 30, z: -19.5 },
      { id: "F1-121", name: "Chemistry Lab", type: "lab", x: 37.5, z: -19.5 },

      { id: "F1-122", name: "Staff Room", type: "office", x: 37.5, z: -10 },
      { id: "F1-124", name: "Physics Lab", type: "lab", x: 37.5, z: -4.5 },
      { id: "F1-125", name: "Exam Control Room", type: "office", x: 37.5, z: 2.5 },
      { id: "F1-126", name: "Faculty Room", type: "office", x: 37.5, z: 7.5 },
      { id: "F1-127", name: "Computer Centre", type: "lab", x: 25, z: 16.5 },
      { id: "F1-128", name: "Computer Room", type: "lab", x: 25, z: 16.5 },

      { id: "G-F-S1", name: "Staircase 1", type: "staircase", x: 14.5, z: 16.5 },
      { id: "G-F-S2", name: "Staircase 2", type: "staircase", x: 30, z: -12 },
      { id: "F-S-S1", name: "Staircase - Girls Common Room Side", type: "staircase", x: -31.5, z: -13.5 }
    ]
  },

  second: {
    name: "Second Floor",
    rooms: [
      { id: "F2-201", name: "Classroom 201", type: "classroom", x: -30, z: -18 },
      { id: "F2-AI1", name: "AI Lab 1", type: "lab", x: -15, z: -15 },
      { id: "F2-AI2", name: "AI Lab 2", type: "lab", x: -5, z: -15 },
      { id: "F2-AI3", name: "AI Lab 3", type: "lab", x: 5, z: -15 },
      { id: "F2-AI4", name: "AI Lab 4", type: "lab", x: 15, z: -15 },
      { id: "F2-205", name: "Staff Room 205", type: "office", x: -30, z: 12 },
      { id: "F2-206", name: "Tutorial Room 206", type: "classroom", x: -15, z: 12 },
      { id: "F2-207", name: "Classroom 207", type: "classroom", x: 0, z: 12 },
      { id: "F2-IF1", name: "IF Lab 1", type: "lab", x: -10, z: 5 },
      { id: "F2-IF2", name: "IF Lab 2", type: "lab", x: 0, z: 5 },
      { id: "F2-IF3", name: "IF Lab 3", type: "lab", x: 10, z: 5 },
      { id: "F2-IF4", name: "IF Lab 4", type: "lab", x: 20, z: 5 },
      { id: "F-S-S1", name: "Staircase - Girls Common Room Side", type: "staircase", x: -37.5, z: -7 }
    ]
  }
};

const staircaseConnections = [
  {
    from: { floor: "ground", id: "G-F-S1" },
    to: { floor: "first", id: "G-F-S1" },
    label: "Ground to First - Staircase 1"
  },
  {
    from: { floor: "ground", id: "G-F-S2" },
    to: { floor: "first", id: "G-F-S2" },
    label: "Ground to First - Staircase 2"
  },
  {
    from: { floor: "first", id: "F-S-S1" },
    to: { floor: "second", id: "F-S-S1" },
    label: "First to Second - Girls Common Room Side"
  }
];

console.log("Campus floor data loaded.");