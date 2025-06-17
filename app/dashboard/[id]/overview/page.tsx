'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Edit2, Trash2, X, Save, Users, FileText } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { supabase } from '@/lib/supabase-client';

interface Event {
  id: string | number;
  title: string;
  Team_event?: boolean;
  token_number?: string;
  team_name?: string;
  description?: string;
  participants?: string;
}

interface RegistrationDetails {
  id: string;
  student_id: string;
  event_id: string | number;
  token: string;
  Team_name?: string;
  description?: string;
  participants?: string;
  created_at: string;
}

export default function OverviewPage() {
  const { id: studentId } = useParams();
  const [name, setName] = useState<string>('Fresher');
  const [loading, setLoading] = useState<boolean>(true);
  const [individualEvents, setIndividualEvents] = useState<Event[]>([]);
  const [teamEvents, setTeamEvents] = useState<Event[]>([]);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrationDetails, setRegistrationDetails] = useState<RegistrationDetails | null>(null);
  const [editLoading, setEditLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  
  // Form states
  const [editTeamName, setEditTeamName] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editParticipants, setEditParticipants] = useState<string>('');

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId || typeof studentId !== 'string') return;

      // 1. Fetch student name
      const { data: studentData } = await supabase
        .from('students')
        .select('name')
        .eq('id', studentId)
        .single();

      if (studentData) setName(studentData.name);

      // 2. Fetch events student has registered for with additional details
      const { data: registrations } = await supabase
        .from('registrations')
        .select('event_id, token, Team_name, description, name')
        .eq('student_id', studentId);

      if (!registrations || registrations.length === 0) {
        setLoading(false);
        return;
      }

      const eventIds = registrations.map((reg) => reg.event_id);

      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, Team_event')
        .in('id', eventIds);

      if (eventsData) {
        // Merge event data with registration details
        const eventsWithDetails = eventsData.map(event => {
          const registration = registrations.find(reg => reg.event_id === event.id);
          return {
            ...event,
            token_number: registration?.token,
            team_name: registration?.Team_name,
            description: registration?.description,
            participants: registration?.name
          };
        });

        const individual = eventsWithDetails.filter((event) => !event.Team_event);
        const team = eventsWithDetails.filter((event) => event.Team_event);

        setIndividualEvents(individual);
        setTeamEvents(team);
      }

      setLoading(false);
    };

    fetchStudentData();
  }, [studentId]);

  const fetchRegistrationDetails = async (eventId: string | number) => {
    if (!studentId || typeof studentId !== 'string') return null;

    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('student_id', studentId)
      .eq('event_id', eventId)
      .single();

    if (error) {
      console.error('Error fetching registration details:', error);
      return null;
    }

    return data;
  };

  const handleEditEvent = async (event: Event) => {
    setSelectedEvent(event);
    setEditLoading(true);
    setShowEditModal(true);

    const details = await fetchRegistrationDetails(event.id);
    if (details) {
      setRegistrationDetails(details);
      setEditTeamName(details.Team_name || '');
      setEditDescription(details.description || '');
      setEditParticipants(details.name || '');
    }
    setEditLoading(false);
  };

  const handleSaveEdit = async () => {
    if (!registrationDetails || !selectedEvent) return;

    setEditLoading(true);

    interface UpdateData {
      description: string;
      Team_name?: string;
      name?: string;
    }
    
    const updateData: UpdateData = {
      description: editDescription
    };

    // Only include team-specific fields if it's a team event
    if (selectedEvent.Team_event) {
      updateData.Team_name = editTeamName;
      updateData.name = editParticipants;
    }

    const { error } = await supabase
      .from('registrations')
      .update(updateData)
      .eq('id', registrationDetails.id);

    if (error) {
      console.error('Error updating registration:', error);
      alert('Failed to update registration. Please try again.');
    } else {
      // Update local state
      if (selectedEvent.Team_event) {
        setTeamEvents(prev => prev.map(event => 
          event.id === selectedEvent.id 
            ? { 
                ...event, 
                team_name: editTeamName, 
                description: editDescription,
                participants: editParticipants 
              }
            : event
        ));
      } else {
        setIndividualEvents(prev => prev.map(event => 
          event.id === selectedEvent.id 
            ? { ...event, description: editDescription }
            : event
        ));
      }
      
      setShowEditModal(false);
      alert('Registration updated successfully!');
    }

    setEditLoading(false);
  };

  const handleDeleteEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedEvent || !studentId || typeof studentId !== 'string') return;

    setDeleteLoading(true);

    const { error } = await supabase
      .from('registrations')
      .delete()
      .eq('student_id', studentId)
      .eq('event_id', selectedEvent.id);

    if (error) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration. Please try again.');
    } else {
      // Update local state
      if (selectedEvent.Team_event) {
        setTeamEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      } else {
        setIndividualEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      }
      
      setShowDeleteModal(false);
      alert('Registration deleted successfully!');
    }

    setDeleteLoading(false);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedEvent(null);
    setRegistrationDetails(null);
    setEditTeamName('');
    setEditDescription('');
    setEditParticipants('');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedEvent(null);
  };

  const totalEvents = individualEvents.length + teamEvents.length;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        {/* Top Right Welcome Section */}
        <div className="flex justify-end mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20 flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="h-6 bg-gray-200 rounded-lg w-48"></div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                  <span className="text-white text-xl font-bold">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome {name}
                </h1>
              </>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Participation Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
              {loading ? (
                <div className="animate-pulse space-y-6">
                  <div className="h-8 bg-gray-200 rounded-lg w-64"></div>
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold text-gray-800 mb-8 animate-fade-in">
                    You are participating in
                  </h2>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">🎯</span>
                        </div>
                        <p className="text-orange-100 font-medium mb-1">Individual Events</p>
                        <p className="text-4xl font-bold">{individualEvents.length}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">🤝</span>
                        </div>
                        <p className="text-purple-100 font-medium mb-1">Team Events</p>
                        <p className="text-4xl font-bold">{teamEvents.length}</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-2xl">🏆</span>
                        </div>
                        <p className="text-blue-100 font-medium mb-1">Total Events</p>
                        <p className="text-4xl font-bold">{totalEvents}</p>
                      </div>
                    </div>
                  </div>

                  {/* Motivational Message */}
                  {totalEvents > 0 && (
                    <div className="mt-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white text-center">
                      <h3 className="text-xl font-bold mb-2">🚀 You are all Set!</h3>
                      <p className="text-green-100">
                      Ready to showcase your talents in {totalEvents} amazing event{totalEvents !== 1 ? 's' : ''}!
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Side - Event Details */}
          <div className="space-y-6">
            {/* Individual Events Box */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🎯</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Individual Events</h3>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : individualEvents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl text-gray-400">📋</span>
                  </div>
                  <p className="text-gray-500">No individual events</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {individualEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100 hover:border-orange-300 transition-all duration-300"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-2">{event.title}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded-full text-xs font-medium">
                                Token: {event.token_number || 'TBD'}
                              </span>
                            </div>
                            {event.description && (
                              <div className="text-gray-600 text-xs">
                                <span className="font-medium">Description:</span> {event.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-3">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Edit registration"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete registration"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Team Events Box */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-white text-lg">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Team Events</h3>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 rounded-xl"></div>
                    </div>
                  ))}
                </div>
              ) : teamEvents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl text-gray-400">👥</span>
                  </div>
                  <p className="text-gray-500">No team events</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {teamEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100 hover:border-purple-300 transition-all duration-300"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-2">{event.title}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-xs font-medium">
                                Token: {event.token_number || 'TBD'}
                              </span>
                            </div>
                            {event.team_name && (
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600">Team:</span>
                                <span className="px-2 py-1 bg-pink-200 text-pink-800 rounded-full text-xs font-medium">
                                  {event.team_name}
                                </span>
                              </div>
                            )}
                            {event.participants && (
                              <div className="text-gray-600 text-xs">
                                <span className="font-medium">Participants:</span> {event.participants}
                              </div>
                            )}
                            {event.description && (
                              <div className="text-gray-600 text-xs">
                                <span className="font-medium">Description:</span> {event.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-3">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Edit registration"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete registration"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Edit2 className="mr-2 text-blue-600" size={24} />
                    Edit Registration
                  </h2>
                  <button
                    onClick={closeEditModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {editLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-800 mb-1">{selectedEvent?.title}</h3>
                      <p className="text-sm text-gray-600">
                        {selectedEvent?.Team_event ? 'Team Event' : 'Individual Event'}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Token: {registrationDetails?.token || 'TBD'} (Fixed)
                      </p>
                    </div>

                    {selectedEvent?.Team_event && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Users size={16} className="mr-1" />
                            Team Name
                          </label>
                          <input
                            type="text"
                            value={editTeamName}
                            onChange={(e) => setEditTeamName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter team name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Users size={16} className="mr-1" />
                            Participants
                          </label>
                          <textarea
                            value={editParticipants}
                            onChange={(e) => setEditParticipants(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter participant names (e.g., John, Jane, Mike)"
                            rows={3}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <FileText size={16} className="mr-1" />
                        Description
                      </label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter event description or notes"
                        rows={4}
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handleSaveEdit}
                        disabled={editLoading}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        <Save size={16} className="mr-2" />
                        {editLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={closeEditModal}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-red-600 flex items-center">
                    <Trash2 className="mr-2" size={24} />
                    Delete Registration
                  </h2>
                  <button
                    onClick={closeDeleteModal}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-800 font-medium">⚠️ Are you sure you want to delete this registration?</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 mb-1">{selectedEvent?.title}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedEvent?.Team_event ? 'Team Event' : 'Individual Event'}
                    </p>
                    {selectedEvent?.team_name && (
                      <p className="text-sm text-gray-600 mt-1">
                        Team: {selectedEvent.team_name}
                      </p>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-4">
                    This action cannot be undone. You will need to register again if you want to participate in this event.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={confirmDelete}
                    disabled={deleteLoading}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={16} className="mr-2" />
                    {deleteLoading ? 'Deleting...' : 'Delete Registration'}
                  </button>
                  <button
                    onClick={closeDeleteModal}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        /* Custom scrollbar for event lists */
        .max-h-64::-webkit-scrollbar {
          width: 4px;
        }

        .max-h-64::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .max-h-64::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .max-h-64::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </DashboardLayout>
  );
}