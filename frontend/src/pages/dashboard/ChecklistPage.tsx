import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useLocation, useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { tripApi } from '../../services/tripApi'; // Import tripApi
import type { UserChecklist, ChecklistItem } from '../../services/tripApi'; // Import types

const ChecklistPage: React.FC = () => {
    const { id} = useParams<{ id: string}>();
    const location = useLocation();
    // Attempt to get tripName from navigation state, if passed.
    const { tripName } = (location.state as { tripName?: string }) || {};

    const [checklistData, setChecklistData] = useState<UserChecklist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('itinerary'); // Default to Itinerary tab
    const [newItemText, setNewItemText] = useState('');
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editingItemText, setEditingItemText] = useState<string>('');
    const [editingDescriptionText, setEditingDescriptionText] = useState<string>(''); 
    const [newItemDescription, setNewItemDescription] = useState('');
    const [newItemTime, setNewItemTime] = useState('');
    const [newItemDate, setNewItemDate] = useState(''); 
    const [newItemLocation, setNewItemLocation] = useState('');
    const [openDescriptionId, setOpenDescriptionId] = useState<string | null>(null); //handle description toggle

    // Fetch checklist data when component mounts or trip ID changes
    // Wrapped in useCallback to prevent unnecessary re-creation and optimize useEffect
    const fetchChecklist = useCallback(async () => {
        setLoading(true);
        setError(null); // Clear previous errors
        try {
            // Type assertion for the API response to match UserChecklist structure
            const response = await tripApi.getUserChecklist(id!) as {
                success: boolean;
                data: UserChecklist;
            };

            if (response.success) {
                setChecklistData(response.data);
            } else {
                setError(response.data ? (response.data as any).message || 'Failed to fetch checklist' : 'Failed to fetch checklist');
            }
        } catch (err: any) {
            console.error('Error fetching checklist:', err);
            setError(err.response?.data?.message || 'Failed to fetch checklist. Please check your network connection.');
        } finally {
            setLoading(false);
        }
    }, [id]); // Dependency array includes 'id'

    useEffect(() => {
        if (id) {
            fetchChecklist();
        }
    }, [id, fetchChecklist]); // Add fetchChecklist to dependency array of useEffect

    const handleCheckboxChange = async (itemId: string, currentChecked: boolean) => {
        try {
            // Optimistic update: Update UI first for responsiveness
            setChecklistData(prevData => {
                if (!prevData) return null;
                const updatedItems = prevData.items.map(item =>
                    item._id === itemId ? { ...item, checked: !currentChecked } : item
                );
                return { ...prevData, items: updatedItems, lastModifiedAt: new Date().toISOString() };
            });

            await tripApi.updateChecklistItem(id!, itemId, { checked: !currentChecked });

        } catch (err: any) {
            console.error('Error updating checklist item:', err);
            alert('Failed to update item status. Please try again.');
            // Revert optimistic update by re-fetching data if API call fails
            fetchChecklist();
        }
    };

    const handleAddItem = async () => {
    if (!newItemText.trim() || isAddingItem) return;

    setIsAddingItem(true);
    try {
        let itemType: ChecklistItem['type'];
        // Initialize an object to hold additional details
        const additionalDetails: {
            description?: string;
            time?: string;
            date?: string;
            location?: string;
        } = {};

        switch (activeTab) {
            case 'itinerary':
                itemType = 'activity';
                // For itinerary, likely include all details
                if (newItemDescription.trim()) additionalDetails.description = newItemDescription.trim();
                if (newItemTime.trim()) additionalDetails.time = newItemTime.trim();
                if (newItemDate.trim()) additionalDetails.date = newItemDate.trim();
                if (newItemLocation.trim()) additionalDetails.location = newItemLocation.trim();
                break;
            case 'packing':
                itemType = 'packing';
                // Packing items might only need a description, if at all
                if (newItemDescription.trim()) additionalDetails.description = newItemDescription.trim();
                break;
            case 'places':
                itemType = 'place';
                // Places would definitely need location and possibly description
                if (newItemDescription.trim()) additionalDetails.description = newItemDescription.trim();
                if (newItemLocation.trim()) additionalDetails.location = newItemLocation.trim();
                // Date/time might also be relevant for planned visits
                if (newItemDate.trim()) additionalDetails.date = newItemDate.trim();
                if (newItemTime.trim()) additionalDetails.time = newItemTime.trim();
                break;
            default:
                itemType = 'custom'; // Fallback for any other unexpected tab
                // Custom items could potentially have any of these
                if (newItemDescription.trim()) additionalDetails.description = newItemDescription.trim();
                if (newItemTime.trim()) additionalDetails.time = newItemTime.trim();
                if (newItemDate.trim()) additionalDetails.date = newItemDate.trim();
                if (newItemLocation.trim()) additionalDetails.location = newItemLocation.trim();
                break;
        }

        const response = await tripApi.addChecklistItem(id!, {
            item: newItemText.trim(),
            checked: false,
            type: itemType,
            ...additionalDetails, // Spread the additional details here
        }) as { success: boolean; data: ChecklistItem };

        if (response.success) {
            setChecklistData(prevData => {
                if (!prevData) {
                    return { items: [response.data], lastModifiedAt: new Date().toISOString() };
                }
                return { ...prevData, items: [...prevData.items, response.data], lastModifiedAt: new Date().toISOString() };
            });
            setNewItemText(''); // Clear main input field
            // Clear the new input fields after successful addition
            setNewItemDescription('');
            setNewItemTime('');
            setNewItemDate('');
            setNewItemLocation('');
        } else {
            alert('Failed to add item: ' + (response.data as any)?.message || 'Unknown error.');
        }
    } catch (err: any) {
        console.error('Error adding checklist item:', err);
        alert(err.response?.data?.message || 'Failed to add item. Please try again.');
    } finally {
        setIsAddingItem(false);
    }
};
    const handleDeleteItem = async (itemId: string) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            // Optimistic update
            setChecklistData(prevData => {
                if (!prevData) return null;
                const updatedItems = prevData.items.filter(item => item._id !== itemId);
                return { ...prevData, items: updatedItems, lastModifiedAt: new Date().toISOString() };
            });

            await tripApi.deleteChecklistItem(id!, itemId);

        } catch (err: any) {
            console.error('Error deleting checklist item:', err);
            alert('Failed to delete item. Please try again.');
            // Revert or re-fetch on failure
            fetchChecklist();
        }
    };

    const handleStartEditing = (item: ChecklistItem) => {
        // Ensure item._id exists before setting editing state
        if (item._id) {
            setEditingItemId(item._id);
            setEditingItemText(item.item);
            setEditingDescriptionText(item.description || '');
        }
    };

    const handleSaveEdit = async (itemId: string) => {
        if (!editingItemText.trim() || !itemId) return;

        try {
            // Optimistic update for both item and description
            setChecklistData(prevData => {
                if (!prevData) return null;
                const updatedItems = prevData.items.map(item =>
                    item._id === itemId
                    ? { ...item, item: editingItemText.trim(), description: editingDescriptionText }
                    : item
                );
                return { ...prevData, items: updatedItems, lastModifiedAt: new Date().toISOString() };
            });

            // Send both fields to backend
            await tripApi.updateChecklistItem(id!, itemId, {
                item: editingItemText.trim(),
                description: editingDescriptionText,
            });

            setEditingItemId(null);
            setEditingItemText('');
            setEditingDescriptionText('');
        } catch (err: any) {
            console.error('Error saving edit:', err);
            alert('Failed to save changes. Please try again.');
            // Revert optimistic update by re-fetching data if API call fails
            fetchChecklist();
        }
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
        setEditingItemText('');
    };

    const handleToggleDescription = (id: string) => {
    setOpenDescriptionId(openDescriptionId === id ? null : id);
    };

    // Helper to filter items by type
    const getFilteredItems = (type: ChecklistItem['type']) => {
        // Ensure checklistData and items exist before filtering
        return checklistData?.items?.filter(item => item.type === type) || [];
    };

    // Helper to group itinerary activities by date and sort by time
    const getItineraryGroupedItems = () => {
        const grouped: { [key: string]: ChecklistItem[] } = {};
        const itineraryItems = getFilteredItems('activity');

        itineraryItems.forEach(item => {
            const dateKey = item.date ? new Date(item.date).toLocaleDateString() : 'Unknown Date'; // Format date for display
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(item);
        });

        // Sort days chronologically. Handle 'Unknown Date' by placing it last.
        const sortedDays = Object.keys(grouped).sort((a, b) => {
            if (a === 'Unknown Date') return 1;
            if (b === 'Unknown Date') return -1;
            return new Date(a).getTime() - new Date(b).getTime();
        });

        return sortedDays.map(date => ({
            date,
            activities: grouped[date].sort((a, b) => {
                // Sort activities by time. Handle missing time by keeping original order.
                if (!a.time || !b.time) return 0;
                const [hA, mA] = a.time.split(':').map(Number);
                const [hB, mB] = b.time.split(':').map(Number);
                if (hA === hB) return mA - mB;
                return hA - hB;
            })
        }));
    };

    const itineraryGrouped = getItineraryGroupedItems();

    // Helper to check if all items in a category are complete
    const isCategoryComplete = (items: ChecklistItem[]) => {
        return items.length > 0 && items.every(item => item.checked);
    };

    // Helper to check if all activities for an itinerary day are complete
    const isItineraryDayComplete = (activities: ChecklistItem[]) => {
        return activities.length > 0 && activities.every(activity => activity.checked);
    };

    // Helper to extract unique places from both 'place' items and itinerary activities
    const extractPlacesFromItinerary = () => {
        const placeItems = getFilteredItems('place');
        const itineraryItems = getFilteredItems('activity');

        // Collect locations from itinerary activities
        const itineraryPlaces = itineraryItems
            .filter(item => item.location && item.location.trim())
            .map(item => ({
                // Use location as the unique key
                _id: `itinerary-${item.location}`,
                item: item.location ?? '', // Ensure item is always a string
                location: item.location ?? '',
                checked: false,
                type: 'place' as ChecklistItem['type'],
                description: '', // You can enhance this if you want to show more info
            }));

        // Merge, avoiding duplicates by location
        const allPlacesMap = new Map<string, ChecklistItem>();
        placeItems.forEach(item => {
            if (item.location) {
                allPlacesMap.set(item.location, item);
            }
        });
        itineraryPlaces.forEach(item => {
                    if (item.location && !allPlacesMap.has(item.location)) {
                        allPlacesMap.set(item.location, item);
                    }
                });

        return Array.from(allPlacesMap.values());
    };

    // Configuration for tabs, dynamically showing only tabs with data
    const tabConfigs = [
        { id: 'itinerary', label: 'Itinerary Activities', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', data: itineraryGrouped },
        { id: 'packing', label: 'Packing List', icon: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4 6l4 4m0 0l-4 4m4-4H8', data: getFilteredItems('packing') },
        { id: 'places', label: 'Places to Visit', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', data: getFilteredItems('place') },
    ].filter(tab => {
        // Filter tabs: 'itinerary' needs to check if its grouped data has any days
        if (tab.id === 'itinerary') {
            return (tab.data as { date: string; activities: ChecklistItem[] }[]).length > 0;
        }
        // Other tabs check if the filtered array has any items
        return (tab.data as ChecklistItem[]).length > 0;
    });

    // --- Render Logic ---
    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                        <p className="text-gray-300">Loading your checklist...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !checklistData) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-xl mb-4">
                        {error || 'Checklist not found or failed to load.'}
                    </div>
                    <Link
                        to={`/dashboard/ChecklistP`}
                        className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-all"
                    >
                      Back to Check Lists
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            to={`/dashboard/ChecklistP`}
                            className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to {tripName || 'Check List'} Details
                        </Link>
                        <h1 className="text-3xl font-bold text-white">Comprehensive Checklist for {tripName || 'Your Trip'}</h1>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
                    <div className="flex space-x-0 border-b border-slate-700 overflow-x-auto">
                        {tabConfigs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-purple-600 text-white border-b-2 border-purple-400'
                                        : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                </svg>
                                <span>{tab.label}</span>
                                {/* Completion indicator for non-itinerary tabs */}
                                {tab.id !== 'itinerary' && isCategoryComplete(tab.data as ChecklistItem[]) && (
                                    <span className="ml-2 text-green-400 text-xs">✔</span>
                                )}
                                {/* Completion indicator for itinerary tab (all days complete) */}
                                {tab.id === 'itinerary' && itineraryGrouped.length > 0 && itineraryGrouped.every(day => isItineraryDayComplete(day.activities)) && (
                                    <span className="ml-2 text-green-400 text-xs">✔</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Add New Item Input */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                        <input
                            type="text"
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            placeholder={`Add new item to ${tabConfigs.find(t => t.id === activeTab)?.label || 'checklist'}...`}
                            className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-500 border border-slate-600 focus:outline-none focus:border-purple-500 text-lg" // Added text-lg for slightly larger text
                        />

                        {/* Conditional inputs for additional details */}
                        {(activeTab === 'itinerary' || activeTab === 'places' || activeTab === 'custom'|| activeTab === 'packing') && (
                            <input
                                type="text"
                                value={newItemDescription}
                                onChange={(e) => setNewItemDescription(e.target.value)}
                                placeholder="Description (optional)"
                                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-500 border border-slate-600 focus:outline-none focus:border-purple-500"
                            />
                        )}

                        {/* Time and Date Inputs - Stacked Vertically */}
                        {(activeTab === 'itinerary' || activeTab === 'custom') && (
                            <div className="flex flex-col space-y-3"> {/* New container for stacking time/date */}
                                <input
                                    type="time"
                                    value={newItemTime}
                                    onChange={(e) => setNewItemTime(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-500 border border-slate-600 focus:outline-none focus:border-purple-500"
                                />
                                <input
                                    type="date"
                                    value={newItemDate}
                                    onChange={(e) => setNewItemDate(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-500 border border-slate-600 focus:outline-none focus:border-purple-500"
                                />
                            </div>
                        )}

                        {/* Location Input */}
                        {(activeTab === 'itinerary' || activeTab === 'custom') && (
                            <input
                                type="text"
                                value={newItemLocation}
                                onChange={(e) => setNewItemLocation(e.target.value)}
                                placeholder="Location (optional)"
                                className="w-full px-4 py-2 rounded-lg bg-slate-700 text-white placeholder-gray-500 border border-slate-600 focus:outline-none focus:border-purple-500"
                            />
                        )}
                            {/* Add Button (full width on mobile, right on desktop) */}
                            <div className="md:col-span-2 flex">
                                <button
                                onClick={handleAddItem}
                                disabled={isAddingItem || !newItemText.trim()}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 ml-auto"
                                >
                                {isAddingItem ? 'Adding...' : 'Add Item'}
                                </button>
                            </div>
                        </div>

                        {/* Itinerary Activities Tab Content */}
                        {activeTab === 'itinerary' && (
                            itineraryGrouped.length > 0 ? (
                                <div className="space-y-6">
                                    {itineraryGrouped.map((day, dayIndex) => (
                                        <div key={day.date} className="bg-slate-700/50 rounded-xl p-6">
                                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                                Day {dayIndex + 1} - {day.date}
                                                {isItineraryDayComplete(day.activities) && (
                                                    <span className="ml-3 text-green-400 text-base">✔ All done for today!</span>
                                                )}
                                            </h3>
                                            <ul className="space-y-4">
                                                {day.activities.map((activity) => (
                                                    <li key={activity._id} className="flex items-start bg-slate-800/50 p-4 rounded-lg shadow-inner">
                                                        <input
                                                            type="checkbox"
                                                            checked={activity.checked}
                                                            // Ensure _id exists before passing to handler
                                                            onChange={() => activity._id && handleCheckboxChange(activity._id, activity.checked)}
                                                            className="form-checkbox h-6 w-6 text-purple-600 bg-gray-900 border-gray-600 rounded focus:ring-purple-500 transition-colors duration-200 mt-1"
                                                        />
                                                        <div className="ml-4 flex-1">
                                                            {editingItemId === activity._id ? (
                                                                <input
                                                                    type="text"
                                                                    value={editingItemText}
                                                                    onChange={(e) => setEditingItemText(e.target.value)}
                                                                    // Save on Enter key press
                                                                    onKeyDown={(e) => e.key === 'Enter' && activity._id && handleSaveEdit(activity._id)}
                                                                    className="w-full px-2 py-1 rounded-md bg-slate-700 text-white focus:outline-none focus:border-purple-500"
                                                                />
                                                            ) : (
                                                                <p className={`text-white font-medium ${activity.checked ? 'line-through text-gray-500' : ''}`}>
                                                                    <span className="text-purple-300 mr-2">{activity.time}:</span> {activity.item}
                                                                </p>
                                                            )}

                                                            {/* Optional display for location and description */}
                                                            {activity.location && (
                                                                <div className="flex items-center space-x-2 mt-1">
                                                                    <span className={`text-gray-400 text-sm ${activity.checked ? 'line-through' : ''}`}>
                                                                        {activity.location}
                                                                    </span>
                                                                    <a
                                                                        href="#"
                                                                        className="inline-flex items-center text-blue-400 hover:text-blue-300 text-xs underline"
                                                                        title="View on Map"
                                                                        // onClick={...} 
                                                                    >
                                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 0c-4.418 0-8 1.79-8 4v3h16v-3c0-2.21-3.582-4-8-4z" />
                                                                        </svg>
                                                                        View on Map
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {activity.description && (
                                                                <p className={`text-gray-300 text-sm mt-1 ${activity.checked ? 'line-through' : ''}`}>
                                                                    {activity.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {/* Action buttons (Edit/Delete or Save/Cancel) */}
                                                        <div className="ml-4 flex space-x-2">
                                                            {editingItemId === activity._id ? (
                                                                <>
                                                                    <button onClick={() => activity._id && handleSaveEdit(activity._id)} className="text-green-400 hover:text-green-300">Save</button>
                                                                    <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-300">Cancel</button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button onClick={() => handleStartEditing(activity)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                                                    <button onClick={() => activity._id && handleDeleteItem(activity._id)} className="text-red-400 hover:text-red-300">Delete</button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <p>No itinerary activities found for this trip plan.</p>
                                </div>
                            )
                        )}

                        {/* Other Tabs Content (Packing, Places) */}
                        {['packing', 'places'].map(category => {
                            if (activeTab !== category) {
                                return null;
                            }
                            const items = category === 'packing'
                                ? getFilteredItems(category as ChecklistItem['type'])
                                : extractPlacesFromItinerary();

                            if (items.length > 0) {
                                return (
                                    <ul key={category} className="space-y-4">
                                        {items.map((item) => (
                                            <li key={item._id} className="flex flex-col bg-slate-700/50 p-4 rounded-lg shadow-inner">
                                                <div className="flex items-start">
                                                    {category === 'packing' && (
                                                        <input
                                                            type="checkbox"
                                                            checked={item.checked}
                                                            onChange={() => item._id && handleCheckboxChange(item._id, item.checked)}
                                                            className="form-checkbox h-6 w-6 text-purple-600 bg-gray-900 border-gray-600 rounded focus:ring-purple-500 transition-colors duration-200 mt-1"
                                                        />
                                                    )}
                                                    
                                                    <div className="ml-4 flex-1">
                                                        {editingItemId === item._id ? (
                                                            <div className="flex flex-col space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={editingItemText}
                                                                    onChange={(e) => setEditingItemText(e.target.value)}
                                                                    placeholder="Item Name"
                                                                    className="w-full px-2 py-1 rounded-md bg-slate-700 text-white focus:outline-none focus:border-purple-500"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={editingDescriptionText}
                                                                    onChange={(e) => setEditingDescriptionText(e.target.value)}
                                                                    placeholder="Description"
                                                                    className="w-full px-2 py-1 rounded-md bg-slate-700 text-white focus:outline-none focus:border-purple-500"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between">
                                                                <span className={`text-lg text-white font-medium ${item.checked ? 'line-through text-gray-500' : ''}`}>
                                                                    {item.item}
                                                                </span>
                                                                {/* Show location link for places */}
                                                                {category === 'places' && item.location && (
                                                                    <a
                                                                        href="#"
                                                                        className="inline-flex items-center text-blue-400 hover:text-blue-300 text-xs underline ml-3"
                                                                        title="View on Map"
                                                                    >
                                                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 0c-4.418 0-8 1.79-8 4v3h16v-3c0-2.21-3.582-4-8-4z" />
                                                                        </svg>
                                                                        {/* {item.location} */}
                                                                        view on Map
                                                                    </a>
                                                                )}
                                                                {item.description && (
                                                                    <button
                                                                        onClick={() => item._id && handleToggleDescription(item._id)}
                                                                        className="ml-2 text-gray-400 hover:text-white transition-transform duration-200"
                                                                    >
                                                                        <svg
                                                                            className={`h-5 w-5 transform ${openDescriptionId === item._id ? 'rotate-180' : 'rotate-0'}`}
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 20 20"
                                                                            fill="currentColor"
                                                                        >
                                                                            <path
                                                                                fillRule="evenodd"
                                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                                clipRule="evenodd"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="ml-4 flex space-x-2">
                                                        {editingItemId === item._id ? (
                                                            <>
                                                                <button onClick={() => item._id && handleSaveEdit(item._id)} className="text-green-400 hover:text-green-300">Save</button>
                                                                <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-300">Cancel</button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => handleStartEditing(item)} className="text-blue-400 hover:text-blue-300">Edit</button>
                                                                <button onClick={() => item._id && handleDeleteItem(item._id)} className="text-red-400 hover:text-red-300">Delete</button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                                {item.description && openDescriptionId === item._id && (
                                                    <div className="ml-10 mt-2 text-gray-300 text-sm">
                                                        <p>{item.description}</p>
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                );
                            } else {
                                return (
                                    <div key={category} className="text-center py-8 text-gray-400">
                                        <p>No {category.replace(/([A-Z])/g, ' $1').toLowerCase()} items found for this trip plan.</p>
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ChecklistPage;