import { useState, useMemo } from 'react'
import {
  Calendar,
  Users,
  BookOpen,
  DollarSign,
  LogOut,
  Check,
  X,
  PieChart,
  Edit,
  Save,
  Unlock,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Search,
  UserPlus,
  BarChart3,
  TrendingUp,
  Clock,
  Bell,
} from 'lucide-react'

// ============ SAMPLE DATA ============
const INITIAL_COURSES = [
  { id: 1, name: 'Data Structures', code: 'CS301' },
  { id: 2, name: 'Database Management', code: 'CS302' },
  { id: 3, name: 'Operating Systems', code: 'CS303' },
  { id: 4, name: 'Computer Networks', code: 'CS304' },
]

const INITIAL_STUDENTS = [
  { id: 1, name: 'Student One', rollNo: '24R21A66H1', email: '24r21a66h1@mlrit.ac.in', section: 'H1', courseIds: [1, 2, 3, 4], password: 'student123' },
  { id: 2, name: 'Student Two', rollNo: '24R21A66H2', email: '24r21a66h2@mlrit.ac.in', section: 'H2', courseIds: [1, 2, 3, 4], password: 'student123' },
  { id: 3, name: 'Student Three', rollNo: '24R21A66H3', email: '24r21a66h3@mlrit.ac.in', section: 'H3', courseIds: [1, 2, 3, 4], password: 'student123' },
  { id: 4, name: 'Student Four', rollNo: '24R21A66H4', email: '24r21a66h4@mlrit.ac.in', section: 'H4', courseIds: [1, 2, 3, 4], password: 'student123' },
  { id: 5, name: 'Student Five', rollNo: '24R21A66H5', email: '24r21a66h5@mlrit.ac.in', section: 'H5', courseIds: [1, 2, 3, 4], password: 'student123' },
  { id: 6, name: 'Student Six', rollNo: '24R21A66H6', email: '24r21a66h6@mlrit.ac.in', section: 'H6', courseIds: [1, 2, 3, 4], password: 'student123' },
  { id: 7, name: 'Student Seven', rollNo: '24R21A66H7', email: '24r21a66h7@mlrit.ac.in', section: 'H7', courseIds: [1, 2, 3, 4], password: 'student123' },
  { id: 8, name: 'Student Eight', rollNo: '24R21A66H8', email: '24r21a66h8@mlrit.ac.in', section: 'H8', courseIds: [1, 2, 3, 4], password: 'student123' },
  { id: 9, name: 'Student Nine', rollNo: '24R21A66H9', email: '24r21a66h9@mlrit.ac.in', section: 'H9', courseIds: [1, 2, 3, 4], password: 'student123' },
]

const INITIAL_FEES = [
  { id: 1, semester: 'Semester 1 - 2024', amount: 75000, dueDate: '2024-08-15', status: 'paid', paidDate: '2024-08-10' },
  { id: 2, semester: 'Semester 2 - 2025', amount: 75000, dueDate: '2025-02-15', status: 'pending', paidDate: null },
]

const todayStr = () => new Date().toISOString().slice(0, 10)

// ============ HELPERS ============
function checkPasswordStrength(password) {
  if (!password) return { level: 0, label: 'Weak', color: '#EF4444' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  // 5-level bar: 0-1 Weak, 2 Medium, 3-4 Strong
  const level = Math.min(5, Math.max(0, score))
  if (level <= 1) return { level, label: 'Weak', color: '#EF4444' }
  if (level <= 3) return { level, label: 'Medium', color: '#F59E0B' }
  return { level, label: 'Strong', color: '#10B981' }
}

// ============ MAIN COMPONENT ============
export default function AttendanceSystem() {
  const [user, setUser] = useState(null)
  const [authView, setAuthView] = useState('login') // login | forgot | reset
  const [resetEmail, setResetEmail] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')

  const [courses, setCourses] = useState(INITIAL_COURSES)
  const [students, setStudents] = useState(INITIAL_STUDENTS)
  const [fees, setFees] = useState(INITIAL_FEES)
  const [attendance, setAttendance] = useState({}) // key: `${rollNo}_${date}_${courseId}`, value: boolean

  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')

  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [editMode, setEditMode] = useState(false)
  const [attendanceEdits, setAttendanceEdits] = useState({}) // rollNo -> true/false
  const [searchRollNo, setSearchRollNo] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [courseForm, setCourseForm] = useState({ name: '', code: '' })
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [courseSuccess, setCourseSuccess] = useState('')

  const [studentForm, setStudentForm] = useState({ name: '', rollNo: '', email: '', section: 'H1', courseId: null })
  const [showStudentForm, setShowStudentForm] = useState(false)
  const [studentSuccess, setStudentSuccess] = useState('')

  const [feeForm, setFeeForm] = useState({ semester: '', amount: '', dueDate: '' })
  const [showFeeForm, setShowFeeForm] = useState(false)
  const [feeSuccess, setFeeSuccess] = useState('')

  const [nextId, setNextId] = useState({ course: 5, student: 10, fee: 3 })

  // ---------- Auth ----------
  const handleLogin = (e) => {
    e?.preventDefault()
    setLoginError('')
    const email = loginEmail.trim().toLowerCase()
    const password = loginPassword
    if (!email || !password) {
      setLoginError('Email and password are required.')
      return
    }
    if (!email.endsWith('@mlrit.ac.in')) {
      setLoginError('Email must end with @mlrit.ac.in')
      return
    }
    if (password.length < 8) {
      setLoginError('Password must be at least 8 characters.')
      return
    }
    if (email === 'ruthiwic@mlrit.ac.in' && password === 'faculty123') {
      setUser({ id: 0, name: 'Faculty', email: 'ruthiwic@mlrit.ac.in', role: 'faculty' })
      setLoginEmail('')
      setLoginPassword('')
      setActiveTab('dashboard')
      return
    }
    const rollMatch = email.match(/^24r21a66h[1-9]@mlrit\.ac\.in$/)
    if (rollMatch && password === 'student123') {
      const rollNo = email.slice(0, 10).toUpperCase().replace('r', 'R').replace('a', 'A')
      const s = students.find(st => st.email.toLowerCase() === email)
      setUser({
        id: s?.id ?? 0,
        name: s?.name ?? 'Student',
        email: s?.email ?? email,
        role: 'student',
        rollNo: s?.rollNo ?? rollNo,
        section: s?.section ?? 'H1',
        courseIds: s?.courseIds ?? [1, 2, 3, 4],
      })
      setLoginEmail('')
      setLoginPassword('')
      setActiveTab('dashboard')
      return
    }
    setLoginError('Invalid email or password.')
  }

  const handleLogout = () => {
    setUser(null)
    setAuthView('login')
    setAuthSuccess('')
    setLoginError('')
  }

  const handleForgotPassword = (e) => {
    e?.preventDefault()
    setAuthSuccess('')
    const email = resetEmail.trim().toLowerCase()
    if (!email.endsWith('@mlrit.ac.in')) {
      setAuthSuccess('Please enter a valid @mlrit.ac.in email.')
      return
    }
    setAuthSuccess('Reset link would be sent to ' + email + ' (demo: no email sent).')
  }

  const handleResetPassword = (e) => {
    e?.preventDefault()
    setAuthSuccess('')
    if (newPassword.length < 8) {
      setAuthSuccess('Password must be at least 8 characters.')
      return
    }
    const strength = checkPasswordStrength(newPassword)
    if (strength.label === 'Weak') {
      setAuthSuccess('Please choose a stronger password.')
      return
    }
    if (newPassword !== confirmPassword) {
      setAuthSuccess('Passwords do not match.')
      return
    }
    setAuthSuccess('Password reset successfully (demo).')
    setNewPassword('')
    setConfirmPassword('')
  }

  // ---------- Attendance ----------
  const getAttendanceKey = (rollNo, date, courseId) => `${rollNo}_${date}_${courseId}`
  const getAttendanceStatus = (rollNo, date, courseId) => {
    if (editMode && attendanceEdits.hasOwnProperty(rollNo)) return attendanceEdits[rollNo]
    const key = getAttendanceKey(rollNo, date, courseId)
    return attendance[key] ?? null
  }

  const toggleAttendance = (rollNo) => {
    if (!editMode) return
    const current = attendanceEdits.hasOwnProperty(rollNo)
      ? attendanceEdits[rollNo]
      : getAttendanceStatus(rollNo, selectedDate, selectedCourseId)
    setAttendanceEdits(prev => ({ ...prev, [rollNo]: !(current === true) }))
  }

  const saveAttendance = () => {
    const date = selectedDate
    const courseId = selectedCourseId
    if (!courseId) return
    const updates = { ...attendance }
    Object.entries(attendanceEdits).forEach(([rollNo, present]) => {
      updates[getAttendanceKey(rollNo, date, courseId)] = present
    })
    setAttendance(updates)
    setAttendanceEdits({})
    setEditMode(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  // ---------- Courses ----------
  const addCourse = (e) => {
    e?.preventDefault()
    if (!courseForm.name.trim() || !courseForm.code.trim()) return
    const newCourse = { id: nextId.course, name: courseForm.name.trim(), code: courseForm.code.trim().toUpperCase() }
    setCourses(prev => [...prev, newCourse])
    setNextId(prev => ({ ...prev, course: prev.course + 1 }))
    setCourseForm({ name: '', code: '' })
    setShowCourseForm(false)
    setCourseSuccess('Course created successfully.')
    setTimeout(() => setCourseSuccess(''), 3000)
  }

  const deleteCourse = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id))
  }

  // ---------- Students ----------
  const addStudent = (e) => {
    e?.preventDefault()
    const { name, rollNo, email, section, courseId } = studentForm
    if (!name?.trim() || !rollNo?.trim() || !email?.trim() || !courseId) return
    const courseIds = [courseId]
    const existing = students.find(s => s.courseIds.includes(courseId) && (s.rollNo === rollNo.trim() || s.email === email.trim().toLowerCase()))
    if (existing) {
      setStudentSuccess('Student already enrolled in this course or roll/email exists.')
      setTimeout(() => setStudentSuccess(''), 3000)
      return
    }
    const newStudent = {
      id: nextId.student,
      name: name.trim(),
      rollNo: rollNo.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      section: section,
      courseIds: [...new Set([...(students.find(s => s.rollNo === rollNo.trim())?.courseIds ?? []), courseId])],
      password: 'student123',
    }
    const existingByRoll = students.find(s => s.rollNo === newStudent.rollNo)
    if (existingByRoll) {
      setStudents(prev => prev.map(s => s.id === existingByRoll.id ? { ...s, courseIds: [...new Set([...s.courseIds, courseId])] } : s))
    } else {
      setStudents(prev => [...prev, newStudent])
      setNextId(prev => ({ ...prev, student: prev.student + 1 }))
    }
    setStudentForm({ name: '', rollNo: '', email: '', section: 'H1', courseId: null })
    setShowStudentForm(false)
    setStudentSuccess('Student enrolled. Default password: student123')
    setTimeout(() => setStudentSuccess(''), 4000)
  }

  const deleteStudent = (id) => {
    setStudents(prev => prev.filter(s => s.id !== id))
  }

  // ---------- Fees ----------
  const addFee = (e) => {
    e?.preventDefault()
    if (!feeForm.semester?.trim() || !feeForm.amount || !feeForm.dueDate) return
    const amount = Number(feeForm.amount)
    if (isNaN(amount) || amount <= 0) return
    const newFee = {
      id: nextId.fee,
      semester: feeForm.semester.trim(),
      amount,
      dueDate: feeForm.dueDate,
      status: 'pending',
      paidDate: null,
    }
    setFees(prev => [...prev, newFee])
    setNextId(prev => ({ ...prev, fee: prev.fee + 1 }))
    setFeeForm({ semester: '', amount: '', dueDate: '' })
    setShowFeeForm(false)
    setFeeSuccess('Fee record added.')
    setTimeout(() => setFeeSuccess(''), 3000)
  }

  const toggleFeeStatus = (id) => {
    setFees(prev => prev.map(f => f.id === id
      ? { ...f, status: f.status === 'paid' ? 'pending' : 'paid', paidDate: f.status === 'paid' ? null : todayStr() }
      : f))
  }

  const deleteFee = (id) => setFees(prev => prev.filter(f => f.id !== id))

  // ---------- Stats ----------
  const getStatsForFaculty = () => {
    const courseId = selectedCourseId || courses[0]?.id
    const date = selectedDate
    const enrolled = students.filter(s => s.courseIds.includes(courseId))
    const present = enrolled.filter(s => getAttendanceStatus(s.rollNo, date, courseId) === true).length
    const total = enrolled.length
    const totalClasses = 30
    const pct = total ? Math.round((present / total) * 100) : 0
    return { totalClasses, present, absent: total - present, percentage: pct, total }
  }

  const getStatsForStudent = () => {
    if (!user || user.role !== 'student') return { totalClasses: 0, present: 0, absent: 0, percentage: 0 }
    const courseIds = user.courseIds || []
    let present = 0, absent = 0
    const dates = [todayStr()]
    for (let i = 1; i <= 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().slice(0, 10))
    }
    courseIds.forEach(courseId => {
      dates.forEach(date => {
        const status = getAttendanceStatus(user.rollNo, date, courseId)
        if (status === true) present++
        else if (status === false) absent++
      })
    })
    const total = present + absent
    const totalClasses = courseIds.length * 30
    const percentage = total ? Math.round((present / total) * 100) : 0
    return { totalClasses: total, present, absent, percentage }
  }

  const getAttendanceHistoryForStudent = () => {
    if (!user || user.role !== 'student') return []
    const history = []
    const courseIds = user.courseIds || []
    const courseMap = Object.fromEntries(courses.map(c => [c.id, c]))
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const date = d.toISOString().slice(0, 10)
      courseIds.forEach(courseId => {
        const status = getAttendanceStatus(user.rollNo, date, courseId)
        if (status !== null) {
          history.push({
            date,
            courseId,
            courseName: courseMap[courseId]?.name || 'Course',
            status: status ? 'present' : 'absent',
          })
        }
      })
    }
    return history.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7)
  }

  const enrolledForCourse = useMemo(() => {
    if (!selectedCourseId) return []
    return students
      .filter(s => s.courseIds.includes(selectedCourseId))
      .filter(s => !searchRollNo || s.rollNo.toLowerCase().includes(searchRollNo.toLowerCase()))
      .sort((a, b) => a.rollNo.localeCompare(b.rollNo))
  }, [students, selectedCourseId, searchRollNo])

  const studentFees = user?.role === 'student' ? fees : fees

  // ============ RENDER: AUTH SCREENS ============
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative w-full max-w-md animate-fade-in">
          <div className="glass p-8 rounded-2xl shadow-2xl">
            {authView === 'login' && (
              <>
                <div className="text-center mb-6">
                  <BookOpen className="w-12 h-12 mx-auto text-white mb-2" />
                  <h1 className="text-2xl font-bold text-white">MLRIT Attendance</h1>
                  <p className="text-white/80 text-sm mt-1">Sign in to continue</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-white/40"
                        placeholder="you@mlrit.ac.in"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50 focus:ring-2 focus:ring-white/30"
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  {loginError && <p className="text-red-200 text-sm">{loginError}</p>}
                  <button type="submit" className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-all hover:scale-[1.02]">
                    Sign In
                  </button>
                  <button type="button" onClick={() => { setAuthView('forgot'); setLoginError(''); setAuthSuccess(''); }} className="w-full text-sm text-white/80 hover:text-white">
                    Forgot Password?
                  </button>
                </form>
                <div className="mt-6 p-4 rounded-xl bg-white/10 border border-white/20">
                  <p className="text-xs font-medium text-white/80 mb-2">Demo credentials</p>
                  <p className="text-xs text-white/90">Faculty: ruthiwic@mlrit.ac.in / faculty123</p>
                  <p className="text-xs text-white/90">Student: 24r21a66h1@mlrit.ac.in / student123</p>
                </div>
              </>
            )}

            {authView === 'forgot' && (
              <>
                <div className="text-center mb-6">
                  <Mail className="w-12 h-12 mx-auto text-white mb-2" />
                  <h1 className="text-xl font-bold text-white">Forgot Password</h1>
                  <p className="text-white/80 text-sm mt-1">Enter your @mlrit.ac.in email</p>
                </div>
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Email</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder-white/50"
                      placeholder="you@mlrit.ac.in"
                    />
                  </div>
                  {authSuccess && <p className="text-green-200 text-sm">{authSuccess}</p>}
                  <button type="submit" className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-all">
                    Send Reset Link
                  </button>
                  <button type="button" onClick={() => { setAuthView('reset'); setAuthSuccess(''); }} className="w-full text-sm text-white/80 hover:text-white">
                    Already have reset link? Set new password
                  </button>
                  <button type="button" onClick={() => { setAuthView('login'); setResetEmail(''); setAuthSuccess(''); }} className="w-full text-sm text-white/80 hover:text-white">
                    Back to Login
                  </button>
                </form>
              </>
            )}

            {authView === 'reset' && (
              <>
                <div className="text-center mb-6">
                  <Unlock className="w-12 h-12 mx-auto text-white mb-2" />
                  <h1 className="text-xl font-bold text-white">Reset Password</h1>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-white/15 border border-white/20 text-white"
                        placeholder="Min 8 characters"
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70">
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex gap-0.5 flex-1">
                          {[1, 2, 3, 4, 5].map(i => {
                            const st = checkPasswordStrength(newPassword)
                            return (
                              <div
                                key={i}
                                className="h-1.5 flex-1 rounded-full transition-colors"
                                style={{ background: i <= st.level ? st.color : 'rgba(255,255,255,0.2)' }}
                              />
                            )
                          })}
                        </div>
                        <span className="text-xs text-white/90 font-medium">{checkPasswordStrength(newPassword).label}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-white/15 border border-white/20 text-white"
                        placeholder="Confirm"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70">
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && <p className="text-red-200 text-xs mt-1">Passwords do not match</p>}
                  </div>
                  {authSuccess && <p className="text-green-200 text-sm">{authSuccess}</p>}
                  <button type="submit" className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold transition-all">
                    Reset Password
                  </button>
                  <button type="button" onClick={() => { setAuthView('login'); setAuthSuccess(''); }} className="w-full text-sm text-white/80 hover:text-white">
                    Back to Login
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ============ DASHBOARD LAYOUT ============
  const isFaculty = user.role === 'faculty'
  const tabs = isFaculty
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'attendance', label: 'Attendance', icon: Users },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'students', label: 'Students', icon: UserPlus },
        { id: 'fees', label: 'Fees', icon: DollarSign },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'attendance', label: 'Attendance', icon: Users },
        { id: 'courses', label: 'Courses', icon: BookOpen },
        { id: 'fees', label: 'Fees', icon: DollarSign },
      ]

  const stats = isFaculty ? getStatsForFaculty() : getStatsForStudent()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500/20 via-purple-600/20 to-pink-500/20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <span className="font-bold text-lg text-gray-800">MLRIT Attendance</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{user.role}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-all hover:scale-105">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="glass-dark border-b border-white/10 px-4">
        <div className="max-w-7xl mx-auto flex gap-1 overflow-x-auto py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all hover:scale-105 ${
                activeTab === tab.id ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'text-gray-600 hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Classes', value: stats.totalClasses, icon: Calendar, color: 'text-blue-500' },
                { label: 'Present', value: stats.present, icon: Check, color: 'text-green-500' },
                { label: 'Absent', value: stats.absent, icon: X, color: 'text-red-500' },
                { label: 'Attendance %', value: stats.percentage + '%', icon: TrendingUp, color: 'bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent' },
              ].map(card => (
                <div key={card.label} className="glass p-5 rounded-2xl hover:scale-105 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{card.label}</p>
                      <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                    <card.icon className={`w-10 h-10 ${card.color}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Doughnut + Quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 glass p-6 rounded-2xl">
                <h3 className="font-semibold text-gray-800 mb-4">Today&apos;s Summary</h3>
                <div className="relative w-48 h-48 mx-auto">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="12" />
                    <circle
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="12"
                      strokeDasharray={`${stats.total ? (stats.present / stats.total) * 251.2 : 0} 251.2`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">{stats.percentage}%</span>
                  </div>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <span className="flex items-center gap-1 text-sm"><span className="w-3 h-3 rounded-full bg-green-500" /> Present</span>
                  <span className="flex items-center gap-1 text-sm"><span className="w-3 h-3 rounded-full bg-red-500" /> Absent</span>
                </div>
              </div>

              <div className="lg:col-span-2 glass p-6 rounded-2xl">
                <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { title: isFaculty ? 'Mark Attendance' : 'View Attendance', desc: isFaculty ? 'Take attendance for a course' : 'See your attendance', icon: Users },
                    { title: isFaculty ? 'Manage Courses' : 'My Courses', desc: isFaculty ? 'Add or remove courses' : 'Enrolled courses', icon: BookOpen },
                    { title: isFaculty ? 'Manage Fees' : 'Fee Status', desc: isFaculty ? 'Add fee records' : 'View payment status', icon: DollarSign },
                  ].map((action, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(action.title.includes('Attendance') ? 'attendance' : action.title.includes('Course') ? 'courses' : 'fees')}
                      className="glass p-4 rounded-xl text-left hover:scale-105 hover:border-blue-400/50 border border-transparent transition-all"
                    >
                      <action.icon className="w-8 h-8 text-blue-500 mb-2" />
                      <p className="font-semibold text-gray-800">{action.title}</p>
                      <p className="text-sm text-gray-500">{action.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!isFaculty && (
              <div className="glass p-6 rounded-2xl">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Clock className="w-5 h-5" /> Recent Attendance</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {getAttendanceHistoryForStudent().length ? getAttendanceHistoryForStudent().map((h, i) => (
                    <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/20">
                      <span className="font-medium text-gray-700">{h.courseName}</span>
                      <span className="text-sm text-gray-500">{h.date}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${h.status === 'present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {h.status === 'present' ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  )) : <p className="text-gray-500 text-sm">No attendance records yet.</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && isFaculty && (
          <div className="space-y-6 animate-fade-in">
            <div className="glass p-4 rounded-2xl flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Course</label>
                <select
                  value={selectedCourseId ?? ''}
                  onChange={e => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 bg-white/80"
                >
                  <option value="">Select course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-4 py-2 rounded-xl border border-gray-200 bg-white/80" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Search Roll No</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={searchRollNo} onChange={e => setSearchRollNo(e.target.value)} placeholder="Roll No" className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white/80" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditMode(!editMode); if (editMode) setAttendanceEdits({}); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${editMode ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {editMode ? <Unlock className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                  {editMode ? 'Editing' : 'Edit'}
                </button>
                {editMode && (
                  <button onClick={saveAttendance} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600">
                    <Save className="w-4 h-4" /> Save
                  </button>
                )}
              </div>
              {editMode && <span className="text-amber-600 text-sm font-medium">Editing Mode Active</span>}
            </div>
            {saveSuccess && <p className="text-green-600 font-medium">Attendance saved successfully.</p>}
            <div className="glass overflow-hidden rounded-2xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <th className="text-left py-3 px-4">Roll No</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Section</th>
                    <th className="text-left py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCourseId ? enrolledForCourse.map(s => {
                    const status = getAttendanceStatus(s.rollNo, selectedDate, selectedCourseId)
                    return (
                      <tr key={s.id} className="border-b border-gray-100 hover:bg-white/30">
                        <td className="py-3 px-4 font-medium">{s.rollNo}</td>
                        <td className="py-3 px-4">{s.name}</td>
                        <td className="py-3 px-4">{s.section}</td>
                        <td className="py-3 px-4">
                          {editMode ? (
                            <div className="flex gap-2">
                              <button onClick={() => toggleAttendance(s.rollNo)} className={`px-3 py-1 rounded-lg text-sm ${status === true ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>Present</button>
                              <button onClick={() => { setAttendanceEdits(prev => ({ ...prev, [s.rollNo]: false })) }} className={`px-3 py-1 rounded-lg text-sm ${status === false ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}>Absent</button>
                            </div>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${status === true ? 'bg-green-100 text-green-700' : status === false ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                              {status === true ? 'Present' : status === false ? 'Absent' : '-'}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  }) : (
                    <tr><td colSpan={4} className="py-8 text-center text-gray-500">Select a course to view students.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {editMode && selectedCourseId && (
              <button onClick={saveAttendance} className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                <Save className="w-5 h-5" /> Save All Attendance
              </button>
            )}
          </div>
        )}

        {activeTab === 'attendance' && !isFaculty && (
          <div className="glass overflow-hidden rounded-2xl animate-fade-in">
            <p className="p-4 text-gray-600 text-sm">Your attendance across enrolled courses (read-only).</p>
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <th className="text-left py-3 px-4">Course</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {(user.courseIds || []).flatMap(courseId => {
                  const course = courses.find(c => c.id === courseId)
                  const dates = []
                  for (let i = 0; i < 14; i++) {
                    const d = new Date()
                    d.setDate(d.getDate() - i)
                    dates.push(d.toISOString().slice(0, 10))
                  }
                  return dates.map(date => {
                    const status = getAttendanceStatus(user.rollNo, date, courseId)
                    if (status === null) return null
                    return (
                      <tr key={`${courseId}-${date}`} className="border-b border-gray-100 hover:bg-white/30">
                        <td className="py-3 px-4">{course?.name}</td>
                        <td className="py-3 px-4">{date}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {status ? 'Present' : 'Absent'}
                          </span>
                        </td>
                      </tr>
                    )
                  }).filter(Boolean)
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-6 animate-fade-in">
            {isFaculty && (
              <>
                <button onClick={() => setShowCourseForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:scale-105 transition-all">
                  <Plus className="w-5 h-5" /> Create New Course
                </button>
                {courseSuccess && <p className="text-green-600">{courseSuccess}</p>}
                {showCourseForm && (
                  <div className="glass p-6 rounded-2xl max-w-md">
                    <h3 className="font-semibold text-gray-800 mb-4">Create Course</h3>
                    <form onSubmit={addCourse} className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Course Name</label>
                        <input type="text" value={courseForm.name} onChange={e => setCourseForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="e.g. Data Structures" required />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Course Code</label>
                        <input type="text" value={courseForm.code} onChange={e => setCourseForm(f => ({ ...f, code: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="e.g. CS301" required />
                      </div>
                      <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600">Create</button>
                        <button type="button" onClick={() => { setShowCourseForm(false); setCourseForm({ name: '', code: '' }); }} className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(isFaculty ? courses : courses.filter(c => (user.courseIds || []).includes(c.id))).map(c => (
                <div key={c.id} className="glass p-5 rounded-2xl hover:scale-105 hover:border-blue-400/50 border border-transparent transition-all flex justify-between items-start">
                  <div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-700">{c.code}</span>
                    <p className="font-bold text-gray-800 mt-2">{c.name}</p>
                    <p className="text-sm text-green-600 mt-1">Active</p>
                    <p className="text-xs text-gray-500 mt-1">{students.filter(s => s.courseIds.includes(c.id)).length} students</p>
                  </div>
                  {isFaculty && (
                    <button onClick={() => deleteCourse(c.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'students' && isFaculty && (
          <div className="space-y-6 animate-fade-in">
            <button onClick={() => setShowStudentForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:scale-105 transition-all">
              <Plus className="w-5 h-5" /> Enroll New Student
            </button>
            {studentSuccess && <p className="text-green-600">{studentSuccess}</p>}
            {showStudentForm && (
              <div className="glass p-6 rounded-2xl max-w-md">
                <h3 className="font-semibold text-gray-800 mb-4">Enroll Student</h3>
                <form onSubmit={addStudent} className="space-y-4">
                  <input type="text" value={studentForm.name} onChange={e => setStudentForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="Student Name" required />
                  <input type="text" value={studentForm.rollNo} onChange={e => setStudentForm(f => ({ ...f, rollNo: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="Roll No (e.g. 24R21A66H1)" required />
                  <input type="email" value={studentForm.email} onChange={e => setStudentForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="Email @mlrit.ac.in" required />
                  <select value={studentForm.section} onChange={e => setStudentForm(f => ({ ...f, section: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200">
                    {['H1','H2','H3','H4','H5','H6','H7','H8','H9'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={studentForm.courseId ?? ''} onChange={e => setStudentForm(f => ({ ...f, courseId: e.target.value ? Number(e.target.value) : null }))} className="w-full px-4 py-2 rounded-xl border border-gray-200" required>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <p className="text-xs text-gray-500">Default password: student123</p>
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 rounded-xl bg-blue-500 text-white">Enroll</button>
                    <button type="button" onClick={() => { setShowStudentForm(false); setStudentForm({ name: '', rollNo: '', email: '', section: 'H1', courseId: null }); }} className="px-4 py-2 rounded-xl bg-gray-200">Cancel</button>
                  </div>
                </form>
              </div>
            )}
            <div className="glass overflow-hidden rounded-2xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <th className="text-left py-3 px-4">Roll No</th>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Section</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-white/30">
                      <td className="py-3 px-4 font-medium">{s.rollNo}</td>
                      <td className="py-3 px-4">{s.name}</td>
                      <td className="py-3 px-4">{s.email}</td>
                      <td className="py-3 px-4">{s.section}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => deleteStudent(s.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="p-3 text-sm text-gray-500">Total: {students.length} students</p>
            </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="space-y-6 animate-fade-in">
            {isFaculty && (
              <>
                <button onClick={() => setShowFeeForm(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:scale-105 transition-all">
                  <Plus className="w-5 h-5" /> Add Fee Record
                </button>
                {feeSuccess && <p className="text-green-600">{feeSuccess}</p>}
                {showFeeForm && (
                  <div className="glass p-6 rounded-2xl max-w-md">
                    <h3 className="font-semibold text-gray-800 mb-4">Add Fee</h3>
                    <form onSubmit={addFee} className="space-y-4">
                      <input type="text" value={feeForm.semester} onChange={e => setFeeForm(f => ({ ...f, semester: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="e.g. Semester 1 - 2025" required />
                      <input type="number" value={feeForm.amount} onChange={e => setFeeForm(f => ({ ...f, amount: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200" placeholder="Amount (₹)" required />
                      <input type="date" value={feeForm.dueDate} onChange={e => setFeeForm(f => ({ ...f, dueDate: e.target.value }))} className="w-full px-4 py-2 rounded-xl border border-gray-200" required />
                      <div className="flex gap-2">
                        <button type="submit" className="px-4 py-2 rounded-xl bg-blue-500 text-white">Add</button>
                        <button type="button" onClick={() => { setShowFeeForm(false); setFeeForm({ semester: '', amount: '', dueDate: '' }); }} className="px-4 py-2 rounded-xl bg-gray-200">Cancel</button>
                      </div>
                    </form>
                  </div>
                )}
              </>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentFees.map(f => (
                <div key={f.id} className={`glass p-5 rounded-2xl border-2 transition-all hover:scale-105 ${f.status === 'paid' ? 'border-green-400/50 bg-green-50/50' : 'border-amber-400/50 bg-amber-50/50'}`}>
                  <div className="flex items-center gap-2 text-gray-800 font-semibold">
                    <DollarSign className="w-5 h-5" />
                    {f.semester}
                  </div>
                  <p className="text-xl font-bold text-gray-800 mt-2">₹{f.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{f.status === 'paid' ? `Paid on ${f.paidDate}` : `Due ${f.dueDate}`}</p>
                  <div className="flex gap-2 mt-4">
                    {isFaculty && (
                      <>
                        <button onClick={() => toggleFeeStatus(f.id)} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600">
                          {f.status === 'paid' ? 'Mark Pending' : 'Mark Paid'}
                        </button>
                        <button onClick={() => deleteFee(f.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
