"use client";

import React, { useState, useEffect, FC, JSX } from "react";
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
  getAuth,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

import {
  Calendar,
  BookOpen,
  TrendingUp,
  Clock,
  User,
  LogOut,
  BarChart3,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
}

interface AttendanceRecord {
  date: Date;
  present: boolean;
}

interface SubjectAttendance {
  subject: Subject;
  attendanceRecords: AttendanceRecord[];
}

interface SubjectAttendanceWithStats extends SubjectAttendance {
  total: number;
  attended: number;
  percentage: number;
}

interface Semester {
  semesterNumber: number;
  subjects: SubjectAttendance[];
}

interface Student {
  id: string;
  name: string;
  email: string;
  phone: number;
  branch: string;
  section: string;
  batchStart: number;
  batchEnd: number;
  creditsObtained: number;
  semesters: Semester[];
}

interface TodayClass {
  time: string;
  subject: string;
  code: string;
  room: string;
  status: "completed" | "upcoming";
}

interface MockData {
  student: Student;
  todayClasses: TodayClass[];
}

interface AttendanceCalendarProps {
  studentId: string;
  semesterNumber: number;
  subjectCode: string;
  attendanceData: SubjectAttendanceWithStats;
  onBack: () => void;
}

interface DetailedViewData {
  studentId: string;
  semesterNumber: number;
  subjectCode: string;
  attendanceData: SubjectAttendanceWithStats;
}

const mockAuth = {
  currentUser: {
    email: "09117711623_ml@vipstc.edu.in",
    displayName: "Yash Goel",
  },
};

const generateMockData = (): MockData => {
  const semesterSubjects: { [key: number]: Subject[] } = {
    1: [
      {
        id: "SUB001",
        name: "Programming Fundamentals",
        code: "CS101",
        credits: 4,
      },
      { id: "SUB002", name: "Digital Logic", code: "CS102", credits: 3 },
      { id: "SUB003", name: "Mathematics I", code: "MA101", credits: 4 },
      { id: "SUB004", name: "Physics", code: "PH101", credits: 3 },
      {
        id: "SUB005",
        name: "English Communication",
        code: "EN101",
        credits: 2,
      },
    ],
    2: [
      {
        id: "SUB006",
        name: "Object Oriented Programming",
        code: "CS201",
        credits: 4,
      },
      { id: "SUB007", name: "Discrete Mathematics", code: "MA201", credits: 3 },
      { id: "SUB008", name: "Data Structures", code: "CS202", credits: 4 },
      {
        id: "SUB009",
        name: "Computer Organization",
        code: "CS203",
        credits: 3,
      },
      {
        id: "SUB010",
        name: "Environmental Science",
        code: "ES201",
        credits: 2,
      },
    ],
    3: [
      {
        id: "SUB011",
        name: "Database Management Systems",
        code: "CS301",
        credits: 4,
      },
      { id: "SUB012", name: "Operating Systems", code: "CS302", credits: 4 },
      { id: "SUB013", name: "Computer Networks", code: "CS303", credits: 3 },
      { id: "SUB014", name: "Software Engineering", code: "CS304", credits: 3 },
      {
        id: "SUB015",
        name: "Theory of Computation",
        code: "CS305",
        credits: 3,
      },
    ],
  };

  const generateAttendance = (
    numClasses: number,
    attendanceRate: number
  ): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const today = new Date();
    for (let i = 0; i < numClasses; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i * 2);
      records.push({
        date: date,
        present: Math.random() < attendanceRate,
      });
    }
    return records;
  };

  const semesters: Semester[] = [
    {
      semesterNumber: 1,
      subjects: semesterSubjects[1].map((sub) => ({
        subject: sub,
        attendanceRecords: generateAttendance(25, 0.92),
      })),
    },
    {
      semesterNumber: 2,
      subjects: semesterSubjects[2].map((sub) => ({
        subject: sub,
        attendanceRecords: generateAttendance(28, 0.88),
      })),
    },
    {
      semesterNumber: 3,
      subjects: semesterSubjects[3].map((sub) => ({
        subject: sub,
        attendanceRecords: generateAttendance(30, 0.85),
      })),
    },
  ];

  const todayClasses: TodayClass[] = [
    {
      time: "09:00 AM - 10:00 AM",
      subject: "Database Management Systems",
      code: "CS301",
      room: "Room 301",
      status: "completed",
    },
    {
      time: "10:15 AM - 11:15 AM",
      subject: "Operating Systems",
      code: "CS302",
      room: "Room 205",
      status: "completed",
    },
    {
      time: "02:00 PM - 03:00 PM",
      subject: "Computer Networks",
      code: "CS303",
      room: "Lab 101",
      status: "upcoming",
    },
    {
      time: "03:30 PM - 04:30 PM",
      subject: "Software Engineering",
      code: "CS304",
      room: "Room 402",
      status: "upcoming",
    },
  ];

  return {
    student: {
      id: "STU2023001",
      name: "Yash Goel",
      email: "09117711623_ml@vipstc.edu.in",
      phone: 8920866347,
      branch: "Artificial Intelligence and Machine Learning",
      section: "B",
      batchStart: 2023,
      batchEnd: 2027,
      creditsObtained: 34,
      semesters,
    },
    todayClasses,
  };
};

const AttendanceCalendar: FC<AttendanceCalendarProps> = ({
  studentId,
  semesterNumber,
  subjectCode,
  attendanceData,
  onBack,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const subject = attendanceData.subject;
  const records = attendanceData.attendanceRecords;

  const getMonthsWithRecords = (): string[] => {
    const months = new Set<string>();
    records.forEach((record) => {
      const date = new Date(record.date);
      months.add(`${date.getFullYear()}-${date.getMonth()}`);
    });
    return Array.from(months).sort().reverse();
  };

  const monthsWithRecords = getMonthsWithRecords();

  const getDaysInMonth = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getAttendanceForDate = (date: Date): AttendanceRecord | undefined => {
    return records.find((record) => {
      const recordDate = new Date(record.date);
      return (
        recordDate.getDate() === date.getDate() &&
        recordDate.getMonth() === date.getMonth() &&
        recordDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const renderCalendar = (): JSX.Element => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days: JSX.Element[] = [];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const attendance = getAttendanceForDate(date);
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          className={`p-3 text-center rounded-lg transition ${
            isToday ? "ring-2 ring-indigo-500" : ""
          } ${
            attendance
              ? attendance.present
                ? "bg-green-100 text-green-800 font-semibold"
                : "bg-red-100 text-red-800 font-semibold"
              : "bg-gray-50 text-gray-400"
          }`}
        >
          <div className="text-sm">{day}</div>
          {attendance && (
            <div className="text-xs mt-1">{attendance.present ? "✓" : "✗"}</div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4 inter-normal">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-600 text-sm p-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">{days}</div>
      </div>
    );
  };

  const changeMonth = (offset: number): void => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const totalClasses = records.length;
  const attendedClasses = records.filter((r) => r.present).length;
  const percentage = (
    totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 transition"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="ml-1">Back to Dashboard</span>
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {subject.name}
              </h1>
              <p className="text-gray-600">
                Code: {subject.code} | Credits: {subject.credits}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Student ID: {studentId} | Semester {semesterNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Overall Attendance</p>
              <p
                className={`text-4xl font-bold ${
                  parseFloat(percentage) >= 75
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {percentage}%
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {attendedClasses}/{totalClasses} classes
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Total Classes</p>
              <p className="text-3xl font-bold text-indigo-600">
                {totalClasses}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Present</p>
              <p className="text-3xl font-bold text-green-600">
                {attendedClasses}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Absent</p>
              <p className="text-3xl font-bold text-red-600">
                {totalClasses - attendedClasses}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Attendance Calendar
            </h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold text-gray-800 min-w-[150px] text-center">
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </span>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {renderCalendar()}

          <div className="flex justify-center items-center space-x-6 mt-6 pt-6 border-t">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 rounded"></div>
              <span className="text-sm text-gray-600">Present</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span className="text-sm text-gray-600">Absent</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-50 rounded border"></div>
              <span className="text-sm text-gray-600">No Class</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-indigo-500 rounded"></div>
              <span className="text-sm text-gray-600">Today</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Recent Attendance
          </h2>
          <div className="space-y-2">
            {records.slice(0, 10).map((record, idx) => {
              const date = new Date(record.date);
              return (
                <div
                  key={idx}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded-lg"
                >
                  <span className="text-gray-700">
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      record.present
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {record.present ? "Present" : "Absent"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentDashboard: FC = () => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      setCurrentUser(null);
      router.replace("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });
    return () => unsubscribe();
  }, []);
  const [studentData, setStudentData] = useState<MockData | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number>(3);
  const [loading, setLoading] = useState<boolean>(true);
  const [detailedView, setDetailedView] = useState<DetailedViewData | null>(
    null
  );

  useEffect(() => {
    const user = mockAuth.currentUser;
    if (user?.email) {
      setTimeout(() => {
        const data = generateMockData();
        setStudentData(data);
        setLoading(false);
      }, 500);
    }
  }, []);

  const calculateCGPA = (): string => {
    if (!studentData) return "0.00";
    const totalCredits = studentData.student.creditsObtained;
    if (totalCredits === 0) return "0.00";

    const assumedGradePoints = 8.5;
    return assumedGradePoints.toFixed(2);
  };

  const calculateSemesterAttendance = (semesterData: Semester): string => {
    let totalClasses = 0;
    let attendedClasses = 0;

    semesterData.subjects.forEach((subj) => {
      totalClasses += subj.attendanceRecords.length;
      attendedClasses += subj.attendanceRecords.filter((r) => r.present).length;
    });

    return totalClasses > 0
      ? ((attendedClasses / totalClasses) * 100).toFixed(1)
      : "0.0";
  };

  const getSubjectAttendance = (
    semesterData: Semester
  ): SubjectAttendanceWithStats[] => {
    return semesterData.subjects.map((subj) => {
      const total = subj.attendanceRecords.length;
      const attended = subj.attendanceRecords.filter((r) => r.present).length;
      const percentage = total > 0 ? (attended / total) * 100 : 0;
      return {
        ...subj,
        total,
        attended,
        percentage: parseFloat(percentage.toFixed(1)),
      };
    });
  };

  const handleSubjectClick = (
    subjectData: SubjectAttendanceWithStats
  ): void => {
    if (!studentData) return;
    setDetailedView({
      studentId: studentData.student.id,
      semesterNumber: selectedSemester,
      subjectCode: subjectData.subject.code,
      attendanceData: subjectData,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!studentData) return null;

  if (detailedView) {
    return (
      <AttendanceCalendar
        studentId={detailedView.studentId}
        semesterNumber={detailedView.semesterNumber}
        subjectCode={detailedView.subjectCode}
        attendanceData={detailedView.attendanceData}
        onBack={() => setDetailedView(null)}
      />
    );
  }

  const currentSemester = studentData.student.semesters.find(
    (s) => s.semesterNumber === selectedSemester
  );

  if (!currentSemester) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center">
        <p className="text-red-700 font-semibold">
          Error: Data for selected semester (Semester {selectedSemester}) not
          found.
        </p>
      </div>
    );
  }

  const currentSemesterAttendance =
    calculateSemesterAttendance(currentSemester);
  const subjectWiseAttendance = getSubjectAttendance(currentSemester);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 p-3 rounded-full">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {studentData.student.name}
                </h1>
                <p className="text-gray-600">
                  {studentData.student.branch} - Section{" "}
                  {studentData.student.section}
                </p>
                <p className="text-sm text-gray-500">
                  {studentData.student.email}
                </p>
              </div>
            </div>
            <button
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Current Semester</p>
                <p className="text-3xl font-bold text-indigo-600">
                  Semester {selectedSemester}
                </p>
              </div>
              <BookOpen className="w-12 h-12 text-indigo-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Current CGPA</p>
                <p className="text-3xl font-bold text-green-600">
                  {calculateCGPA()}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Overall Attendance</p>
                <p className="text-3xl font-bold text-blue-600">
                  {currentSemesterAttendance}%
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Today's Classes */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-indigo-600" />
            Today&apos;s Classes
          </h2>
          <div className="space-y-3">
            {studentData.todayClasses.map((cls, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                <div className="flex items-center space-x-4">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-800">{cls.subject}</p>
                    <p className="text-sm text-gray-600">
                      {cls.code} - {cls.room}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{cls.time}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      cls.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {cls.status === "completed" ? "Completed" : "Upcoming"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Attendance Overview
            </h2>
            <select
              value={selectedSemester}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSelectedSemester(parseInt(e.target.value))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {studentData.student.semesters.map((sem) => (
                <option key={sem.semesterNumber} value={sem.semesterNumber}>
                  Semester {sem.semesterNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {subjectWiseAttendance.map((subjectData, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:border-indigo-300 transition"
                onClick={() => handleSubjectClick(subjectData)}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {subjectData.subject.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {subjectData.subject.code} • {subjectData.subject.credits}{" "}
                      Credits
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p
                      className={`text-2xl font-bold ${
                        subjectData.percentage >= 75
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {subjectData.percentage}%
                    </p>
                    <p className="text-sm text-gray-600">
                      {subjectData.attended}/{subjectData.total} classes
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      subjectData.percentage >= 75
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${subjectData.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Classes</p>
              <p className="text-2xl font-bold text-indigo-600">
                {currentSemester.subjects.reduce(
                  (acc, s) => acc + s.attendanceRecords.length,
                  0
                )}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Classes Attended</p>
              <p className="text-2xl font-bold text-green-600">
                {currentSemester.subjects.reduce(
                  (acc, s) =>
                    acc + s.attendanceRecords.filter((r) => r.present).length,
                  0
                )}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Classes Missed</p>
              <p className="text-2xl font-bold text-red-600">
                {currentSemester.subjects.reduce(
                  (acc, s) =>
                    acc + s.attendanceRecords.filter((r) => !r.present).length,
                  0
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
