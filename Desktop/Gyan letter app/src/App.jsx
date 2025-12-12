import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import DatabaseManager from './components/DatabaseManager'
import LetterEditor from './components/LetterEditor'
import { Database, FileText, Home } from 'lucide-react'

function Navigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/database', label: 'Database', icon: Database },
    { path: '/editor', label: 'Letter Editor', icon: FileText },
  ]

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6" />
            <h1 className="text-xl font-bold">Gyan Letter App</h1>
          </div>
          <div className="flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-700'
                      : 'hover:bg-blue-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Gyan Letter App</h2>
          <p className="text-gray-600 mb-6">
            A comprehensive solution for managing your database and creating professional letters and emails.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <Database className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Database Management</h3>
              <p className="text-gray-600">
                Manage all your contacts and data in one centralized location. Add, edit, delete, and search through your records easily.
              </p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <FileText className="w-8 h-8 text-green-600 mb-3" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Letter & Email Editor</h3>
              <p className="text-gray-600">
                Create professional letters and emails using our rich text editor. Use database fields to personalize your content and print or export easily.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <div className="min-h-screen bg-gray-100">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/database" element={<DatabaseManager />} />
          <Route path="/editor" element={<LetterEditor />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App


