import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = ({ children, title }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="flex h-screen bg-gray-50 flex-col md:flex-row overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <h1 className="text-xl font-bold text-primary">SmartTrack</h1>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-500">
                    {isSidebarOpen ? '✕' : '☰'}
                </button>
            </div>

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            
            <div className={`flex-1 flex flex-col transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'md:ml-64 opacity-50 md:opacity-100' : 'md:ml-64'}`}>
                <Navbar title={title} />
                <main className="flex-1 overflow-hidden relative">
                    {children}
                </main>
            </div>
            
            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-30 md:hidden" 
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default Layout;
