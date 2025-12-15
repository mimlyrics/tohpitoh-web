// components/Layout.tsx (update admin navigation part)
// ... existing imports ...

export const Layout: React.FC<LayoutProps> = ({
  userRole,
  onLogout,
  activeTab,
  setActiveTab,
  darkMode,
  toggleDarkMode,
  children
}) => {
  // ... existing code ...

  // Admin tabs
  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'patients', label: 'Patients', icon: HeartPulse },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'laboratories', label: 'Laboratories', icon: FlaskConical },
    { id: 'medical-records', label: 'Records', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'lab-tests', label: 'Lab Tests', icon: ClipboardList },
    { id: 'validations', label: 'Validations', icon: ShieldCheck },
    { id: 'access', label: 'Access', icon: Shield },
  ];

  // ... existing code ...

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* ... existing sidebar code ... */}
      
      <div className="ml-0 md:ml-64">
        {/* Admin navigation bar */}
        {userRole === UserRole.ADMIN && (
          <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-6 py-3">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {adminTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <tab.icon size={16} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};