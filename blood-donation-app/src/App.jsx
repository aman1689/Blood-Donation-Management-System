//import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import { User, Calendar, Database, Search, Plus, Users, Activity, AlertTriangle, Sparkles, Copy, X, RefreshCw } from 'lucide-react';

// --- API Configuration ---
const API_BASE_URL = 'http://localhost:8080/api';

// --- Simple Card Components ---
const Card = ({ children, className = "" }) => (<div className={`bg-white rounded-lg shadow-sm border ${className}`}>{children}</div>);
const CardHeader = ({ children }) => (<div className="px-6 py-4 border-b">{children}</div>);
const CardTitle = ({ children }) => (<h2 className="text-lg font-semibold text-gray-900">{children}</h2>);
const CardContent = ({ children }) => (<div className="px-6 py-4">{children}</div>);

// --- Gemini API Utility ---
const generateGeminiContent = async (prompt) => {
    // NOTE: In a real-world application, this API key should be handled securely on a backend server,
    // not exposed in the frontend code. This is for demonstration purposes only.
    const apiKey = ""; // Add your API key here
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        return result.candidates?.[0]?.content?.parts?.[0]?.text || "No content generated.";
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return "Error: Unable to generate content. Please check the API key and network connection.";
    }
};

export default function App() {
    const [currentView, setCurrentView] = useState('dashboard');
    const [donors, setDonors] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [newDonor, setNewDonor] = useState({ firstName: '', lastName: '', email: '', phone: '', bloodType: 'A+', dateOfBirth: '', gender: 'Male', city: '', state: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [serverError, setServerError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);

    const fetchDonors = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/donors`);
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            setDonors(data);
            if (serverError) setServerError(null); // Clear error on success
        } catch (error) {
            console.error("Failed to fetch donors:", error);
            // Updated error message for clarity
            setServerError("Could not connect to the backend. Please ensure the Java server is running on localhost:8080 and click Retry.");
        }
    };

    const fetchInventory = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/inventory`);
            if (!response.ok) throw new Error('Network error');
            const data = await response.json();
            setInventory(data);
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
        }
    };

    useEffect(() => {
        fetchDonors();
        fetchInventory();
    }, []);

    const retryConnection = async () => {
        setIsRetrying(true);
        await Promise.all([fetchDonors(), fetchInventory()]);
        setIsRetrying(false);
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    const handleAddDonor = async () => {
        if (!newDonor.firstName || !newDonor.lastName || !newDonor.email || !newDonor.city || !newDonor.state || !newDonor.dateOfBirth) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/donors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDonor)
            });
            if (!response.ok) throw new Error('Failed to register donor');
            setNewDonor({ firstName: '', lastName: '', email: '', phone: '', bloodType: 'A+', dateOfBirth: '', gender: 'Male', city: '', state: '' });
            showNotification('Donor registered successfully!');
            await fetchDonors(); // Refresh the list
            setCurrentView('donors');
        } catch (error) {
            showNotification("Failed to register donor. Please try again.", "error");
        }
    };

    const filteredDonors = donors.filter(donor =>
        `${donor.firstName} ${donor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donor.bloodType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Main component render
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {serverError && <ServerErrorBanner message={serverError} onRetry={retryConnection} isRetrying={isRetrying} />}
            {notification.show && <NotificationModal message={notification.message} type={notification.type} onclose={() => setNotification({ ...notification, show: false })} />}
            <Header />
            <Navigation currentView={currentView} setCurrentView={setCurrentView} />
            <main className="p-6">
                {currentView === 'dashboard' && <DashboardView donors={donors} inventory={inventory} />}
                {currentView === 'register' && <DonorRegistrationView newDonor={newDonor} setNewDonor={setNewDonor} handleAddDonor={handleAddDonor} />}
                {currentView === 'donors' && <DonorListView donors={filteredDonors} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
                {currentView === 'inventory' && <InventoryView inventory={inventory} />}
                {currentView === 'find' && <FindDonorsView showNotification={showNotification} />}
            </main>
        </div>
    );
}

// --- Helper Functions & Sub-Components ---

const getBloodTypeColor = (bloodType) => ({ 'A+': 'text-red-600', 'A-': 'text-red-800', 'B+': 'text-blue-600', 'B-': 'text-blue-800', 'AB+': 'text-purple-600', 'AB-': 'text-purple-800', 'O+': 'text-green-600', 'O-': 'text-green-800' }[bloodType] || 'text-gray-600');

const getStockStatus = (units) => {
    if (units < 10) return { color: 'text-red-600', status: 'Critical', bg: 'bg-red-50' };
    if (units < 20) return { color: 'text-orange-600', status: 'Low', bg: 'bg-orange-50' };
    return { color: 'text-green-600', status: 'Good', bg: 'bg-green-50' };
};

const ServerErrorBanner = ({ message, onRetry, isRetrying }) => (
    <div className="fixed inset-x-0 top-0 z-50 p-4 bg-red-600 text-white shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 mr-3" />
                <div>
                    <p className="font-bold">Connection Error</p>
                    <p className="text-sm">{message}</p>
                </div>
            </div>
            <button onClick={onRetry} disabled={isRetrying} className="flex items-center bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`}/>
                {isRetrying ? 'Retrying...' : 'Retry'}
            </button>
        </div>
    </div>
);

const NotificationModal = ({ message, type, onclose }) => {
    if (!message) return null;
    const colors = { success: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-400' }, error: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' } };
    return (
        <div className={`fixed top-5 right-5 p-4 rounded-lg shadow-lg border ${colors[type].bg} ${colors[type].text} ${colors[type].border} flex items-center z-50`}>
            <span>{message}</span>
            <button onClick={onclose} className="ml-4 text-lg font-bold">&times;</button>
        </div>
    );
};

const Header = () => (
    <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-red-600">🩸 Blood Donation Management System</h1>
                <div className="text-sm text-gray-600">Welcome, Admin | Today: {new Date().toLocaleDateString()}</div>
            </div>
        </div>
    </header>
);

const Navigation = ({ currentView, setCurrentView }) => (
    <nav className="bg-white shadow-sm">
        <div className="px-6">
            <div className="flex space-x-1 md:space-x-8 overflow-x-auto">
                {[
                    { key: 'dashboard', label: 'Dashboard', icon: Database },
                    { key: 'find', label: 'Find Donors', icon: Search },
                    { key: 'register', label: 'Register Donor', icon: Plus },
                    { key: 'donors', label: 'View Donors', icon: Users },
                    { key: 'inventory', label: 'Blood Stock', icon: Activity }
                ].map(({ key, label, icon: Icon }) => (
                    <button key={key} onClick={() => setCurrentView(key)} className={`flex-shrink-0 flex items-center space-x-2 px-3 md:px-4 py-3 border-b-2 text-sm font-medium transition-colors ${currentView === key ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                    </button>
                ))}
            </div>
        </div>
    </nav>
);

const DashboardView = ({ donors, inventory }) => {
    const [campaignIdeas, setCampaignIdeas] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateCampaigns = async () => {
        setIsLoading(true);
        const lowStockItems = inventory.filter(item => item.units < 20).map(item => item.bloodType);
        const prompt = `As an expert marketing strategist for a blood donation center, generate 3 creative and engaging campaign ideas to attract more donors. The current urgent need is for the following blood types: ${lowStockItems.join(', ') || 'all types'}. For each idea, provide: 1. A catchy slogan. 2. A brief theme description. 3. A sample social media post (under 280 characters). Format the response clearly using markdown.`;
        const ideas = await generateGeminiContent(prompt);
        setCampaignIdeas(ideas);
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Donors</p>
                                <p className="text-3xl font-bold text-blue-900">{donors.length}</p>
                            </div>
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Eligible Donors</p>
                                <p className="text-3xl font-bold text-green-900">{donors.filter(d => d.isEligible).length}</p>
                            </div>
                            <Activity className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Total Donations</p>
                                <p className="text-3xl font-bold text-purple-900">2</p>
                            </div>
                            <Calendar className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600">Low Stock Items</p>
                                <p className="text-3xl font-bold text-orange-900">{inventory.filter(item => item.units < 20).length}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>✨ AI-Powered Campaign Generator</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">Need inspiration for your next donation drive? Let AI help you craft the perfect message based on your current inventory needs.</p>
                        <button onClick={handleGenerateCampaigns} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:opacity-90 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 mr-2" />
                            {isLoading ? 'Generating Ideas...' : 'Generate Campaign Ideas'}
                        </button>
                        {isLoading && <div className="text-center p-4">Loading...</div>}
                        {campaignIdeas && (
                            <div className="mt-4 p-4 border rounded-lg bg-gray-50 prose prose-sm max-w-none">
                                <pre className="whitespace-pre-wrap font-sans">{campaignIdeas}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Blood Inventory Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {inventory.map(item => {
                                const status = getStockStatus(item.units);
                                return (
                                    <div key={item.bloodType} className={`flex items-center justify-between p-3 rounded-lg ${status.bg}`}>
                                        <div>
                                            <span className={`font-bold text-lg ${getBloodTypeColor(item.bloodType)}`}>{item.bloodType}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg">{item.units} units</p>
                                            <p className={`text-sm ${status.color}`}>{status.status}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const DonorRegistrationView = ({ newDonor, setNewDonor, handleAddDonor }) => (
    <Card>
        <CardHeader>
            <CardTitle>Register New Donor</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <input type="text" className="w-full p-2 border rounded-md" value={newDonor.firstName} onChange={(e) => setNewDonor({...newDonor, firstName: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <input type="text" className="w-full p-2 border rounded-md" value={newDonor.lastName} onChange={(e) => setNewDonor({...newDonor, lastName: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input type="email" className="w-full p-2 border rounded-md" value={newDonor.email} onChange={(e) => setNewDonor({...newDonor, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <input type="tel" className="w-full p-2 border rounded-md" value={newDonor.phone} onChange={(e) => setNewDonor({...newDonor, phone: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Blood Type</label>
                        <select className="w-full p-2 border rounded-md" value={newDonor.bloodType} onChange={(e) => setNewDonor({...newDonor, bloodType: e.target.value})}>
                            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Date of Birth</label>
                        <input type="date" className="w-full p-2 border rounded-md" value={newDonor.dateOfBirth} onChange={(e) => setNewDonor({...newDonor, dateOfBirth: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Gender</label>
                        <select className="w-full p-2 border rounded-md" value={newDonor.gender} onChange={(e) => setNewDonor({...newDonor, gender: e.target.value})}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">State</label>
                        <input type="text" className="w-full p-2 border rounded-md" value={newDonor.state} onChange={(e) => setNewDonor({...newDonor, state: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">City</label>
                        <input type="text" className="w-full p-2 border rounded-md" value={newDonor.city} onChange={(e) => setNewDonor({...newDonor, city: e.target.value})} />
                    </div>
                </div>
                <button onClick={handleAddDonor} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
                    Register Donor
                </button>
            </div>
        </CardContent>
    </Card>
);

const DonorListView = ({ donors, searchTerm, setSearchTerm }) => (
    <Card>
        <CardHeader>
            <CardTitle>Donor Management</CardTitle>
            <div className="relative mt-4">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input type="text" placeholder="Search donors by name, email, or blood type..." className="w-full pl-10 pr-4 py-2 border rounded-md" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {donors.map(donor => (
                    <div key={donor.id} className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="md:col-span-2">
                            <h3 className="font-medium text-lg">{donor.firstName} {donor.lastName}</h3>
                            <p className="text-sm text-gray-600">{donor.email}</p>
                            <p className="text-sm text-gray-600">{donor.city}, {donor.state}</p>
                        </div>
                        <div className="text-center">
                            <span className={`font-bold text-xl ${getBloodTypeColor(donor.bloodType)}`}>{donor.bloodType}</span>
                        </div>
                        <div className="text-right">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${donor.isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {donor.isEligible ? 'Eligible' : 'Not Eligible'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

const InventoryView = ({ inventory }) => (
    <Card>
        <CardHeader>
            <CardTitle>Blood Inventory Management</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {inventory.map(item => {
                    const status = getStockStatus(item.units);
                    return (
                        <div key={item.bloodType} className={`p-6 rounded-lg border-2 ${status.bg} ${item.units < 10 ? 'border-red-300' : item.units < 20 ? 'border-orange-300' : 'border-green-300'}`}>
                            <div className="text-center">
                                <h3 className={`text-3xl font-bold ${getBloodTypeColor(item.bloodType)}`}>{item.bloodType}</h3>
                                <p className="text-2xl font-bold mt-2">{item.units}</p>
                                <p className="text-sm text-gray-600">units</p>
                                <p className={`text-sm font-medium mt-2 ${status.color}`}>{status.status}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </CardContent>
    </Card>
);

const FindDonorsView = ({ showNotification }) => {
    const [searchCriteria, setSearchCriteria] = useState({ state: '', city: '' });
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const messageRef = useRef(null);

    const handleSearch = async () => {
        if (!searchCriteria.state.trim() || !searchCriteria.city.trim()) {
            showNotification("Please enter both a state and a city.", 'error');
            return;
        }
        setIsSearching(true);
        setSearchPerformed(true);
        setGeneratedMessage('');
        try {
            const state = encodeURIComponent(searchCriteria.state);
            const city = encodeURIComponent(searchCriteria.city);
            const response = await fetch(`${API_BASE_URL}/donors/search?state=${state}&city=${city}`);
            if (!response.ok) throw new Error('Search request failed');
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Failed to search for donors:", error);
            showNotification("Failed to find donors. The server may be down.", "error");
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleGenerateMessage = async () => {
        setIsGenerating(true);
        const bloodTypesFound = [...new Set(searchResults.map(d => d.bloodType))].join(', ');
        const prompt = `Create a polite and encouraging outreach message (SMS or email) for registered blood donors in ${searchCriteria.city}, ${searchCriteria.state}. The message should be friendly and appreciative. Mention that there is a need for donations in their local area. Specifically mention the need for these blood types if relevant: ${bloodTypesFound}. Encourage them to schedule an appointment. Keep it concise and professional. Do not include placeholders like [Clinic Name] or [Link].`;
        const message = await generateGeminiContent(prompt);
        setGeneratedMessage(message);
        setIsGenerating(false);
    };

    const copyToClipboard = () => {
        if (messageRef.current) {
            navigator.clipboard.writeText(messageRef.current.innerText).then(() => showNotification('Message copied to clipboard!'));
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Find Available Donors</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium mb-2">State</label>
                            <input type="text" placeholder="e.g., CA" className="w-full p-2 border rounded-md" value={searchCriteria.state} onChange={(e) => setSearchCriteria({...searchCriteria, state: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">City</label>
                            <input type="text" placeholder="e.g., Los Angeles" className="w-full p-2 border rounded-md" value={searchCriteria.city} onChange={(e) => setSearchCriteria({...searchCriteria, city: e.target.value})} />
                        </div>
                        <button onClick={handleSearch} disabled={isSearching} className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center">
                            <Search className="h-4 w-4 mr-2" />
                            {isSearching ? 'Searching...' : 'Find Donors'}
                        </button>
                    </div>
                </div>

                <div className="mt-6">
                    {isSearching ? (
                        <div className="text-center p-4">Searching...</div>
                    ) : (
                        searchPerformed ? (
                            <div>
                                <div className="md:flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">{searchResults.length} eligible donor(s) found</h3>
                                    {searchResults.length > 0 && (
                                        <button onClick={handleGenerateMessage} disabled={isGenerating} className="mt-2 md:mt-0 bg-teal-500 text-white font-semibold py-2 px-4 rounded-md hover:opacity-90 disabled:opacity-50 flex items-center">
                                            <Sparkles className="h-4 w-4 mr-2" />
                                            {isGenerating ? 'Generating...' : 'Generate Outreach Message'}
                                        </button>
                                    )}
                                </div>

                                {generatedMessage && (
                                    <div className="mb-4 p-4 border rounded-lg bg-gray-50 relative">
                                        <pre ref={messageRef} className="whitespace-pre-wrap font-sans text-sm">{generatedMessage}</pre>
                                        <button onClick={copyToClipboard} className="absolute top-2 right-2 p-1.5 bg-gray-200 rounded-md hover:bg-gray-300">
                                            <Copy className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {searchResults.map(donor => (
                                        <div key={donor.id} className="border rounded-lg p-4 grid grid-cols-3 items-center bg-green-50">
                                            <p className="font-bold">{donor.firstName}</p>
                                            <div className="text-center">
                                                <span className={`font-bold text-2xl ${getBloodTypeColor(donor.bloodType)}`}>{donor.bloodType}</span>
                                            </div>
                                            <p className="text-right">{donor.city}, {donor.state}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg">
                                Please enter a location to find donors.
                            </div>
                        )
                    )}
                </div>
            </CardContent>
        </Card>
    );
};