'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import Switch from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Search, Flame } from 'lucide-react';
import jsPDF from 'jspdf';

interface Event {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  Team_event: boolean;
  time: string;
  team_size: number;
}

interface Participant {
  id: string;
  token: string;
  name: string;
  Team_name?: string;
  description?: string;
  event_id: string;
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [participantsMap, setParticipantsMap] = useState<{ [key: string]: Participant[] }>({});
  const [teamSizeInput, setTeamSizeInput] = useState<{ [key: string]: string }>({});
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    imageFile: null as File | null,
    team_event: false,
    time: '',
    team_size: '',
  });
  const [editEvent, setEditEvent] = useState({
    title: '',
    description: '',
    imageFile: null as File | null,
    team_event: false,
    time: '',
    image_url: '',
    team_size: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [fireActive, setFireActive] = useState(false);

  useEffect(() => {
    fetchEvents();
    // Initialize fire status from database or localStorage alternative
    initializeFireStatus();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*');
    if (error) console.error(error);
    else setEvents(data);
  };

  const initializeFireStatus = async () => {
    // Try to get fire status from database
    const { data } = await supabase
      .from('admin_status')
      .select('fire_status')
      .single();
    
    if (data) {
      setFireActive(data.fire_status === 200);
    }
  };

  const updateFireStatus = async (isActive: boolean) => {
    const status = isActive ? 200 : 400;
    
    // Update in database
    const { error } = await supabase
      .from('admin_status')
      .upsert({ 
        id: 1, // Use a fixed ID for singleton pattern
        fire_status: status,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to update fire status:', error);
      // Fallback: broadcast to any listening components
      window.dispatchEvent(new CustomEvent('fireStatusChange', { 
        detail: { status } 
      }));
    }
  };

  const uploadImage = async (file: File) => {
    const ext = file.name.split('.').pop();
    const filePath = `events/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('event-images').upload(filePath, file);
    if (error) {
      alert('Image upload failed');
      return null;
    }
    const { data } = supabase.storage.from('event-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const downloadParticipantsPDF = (event: Event) => {
    const doc = new jsPDF();
    const participants = participantsMap[event.id] || [];
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
  
    // Header Section
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(event.title, margin, 25);
    
    // Underline for title
    doc.setLineWidth(0.5);
    doc.line(margin, 28, margin + doc.getTextWidth(event.title), 28);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Participant List', margin, 38);
    
    // Event Details Section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Event Time: ' + (event.time || 'Not specified'), margin, 50);
    
    // Description with text wrapping
    const descriptionLines = doc.splitTextToSize('Description: ' + (event.description || 'No description'), contentWidth);
    doc.text(descriptionLines, margin, 58);
    
    let y = 58 + (descriptionLines.length * 5) + 10;
    
    // Participants count
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Participants: ${participants.length}`, margin, y);
    
    y += 15;
    
    if (participants.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.text('No participants registered yet.', margin, y);
    } else {
      // Table Header
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      // Header background
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y - 2, contentWidth, 8, 'F');
      
      // Header text
      doc.text('Token', margin + 2, y + 4);
      doc.text('Name', margin + 25, y + 4);
      doc.text('Team Name', margin + 80, y + 4);
      doc.text('Description', margin + 125, y + 4);
      
      // Header border
      doc.setLineWidth(0.3);
      doc.line(margin, y + 6, margin + contentWidth, y + 6);
      
      y += 12;
      
      // Participant rows
      doc.setFont('helvetica', 'normal');
      participants.forEach((p, index) => {
        // Calculate description lines first to determine row height
        const descText = p.description || '-';
        const descriptionWidth = contentWidth - 125; // Available width for description column
        const descLines = doc.splitTextToSize(descText, descriptionWidth);
        const rowHeight = Math.max(8, descLines.length * 4 + 2); // Minimum 8, or height based on description lines
        
        // Alternating row colors
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margin, y - 2, contentWidth, rowHeight, 'F');
        }
        
        // Token
        doc.setFont('helvetica', 'bold');
        doc.text('#' + p.token, margin + 2, y + 4);
        
        // Name
        doc.setFont('helvetica', 'normal');
        const nameText = p.name || 'N/A';
        const nameLines = doc.splitTextToSize(nameText, 50); // Allow wrapping for long names
        doc.text(nameLines, margin + 25, y + 4);
        
        // Team Name
        const teamText = p.Team_name || '-';
        const teamLines = doc.splitTextToSize(teamText, 40); // Allow wrapping for long team names
        doc.text(teamLines, margin + 80, y + 4);
        
        // Description - Full text with wrapping
        doc.text(descLines, margin + 125, y + 4);
        
        y += rowHeight;
        
        // Check if we need a new page
        if (y > 270) {
          doc.addPage();
          y = 25;
          
          // Repeat header on new page
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, y - 2, contentWidth, 8, 'F');
          doc.text('Token', margin + 2, y + 4);
          doc.text('Name', margin + 25, y + 4);
          doc.text('Team Name', margin + 80, y + 4);
          doc.text('Description', margin + 125, y + 4);
          doc.line(margin, y + 6, margin + contentWidth, y + 6);
          y += 12;
          doc.setFont('helvetica', 'normal');
        }
      });
    }
    
    // Footer - Fixed to use correct method
    const pageCount = doc.internal.pages.length - 1; // Subtract 1 because pages array includes a null first element
    
    // Add footer to each page
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, doc.internal.pageSize.height - 10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - margin - 20, doc.internal.pageSize.height - 10);
    }
  
    doc.save(`${event.title.replace(/\s+/g, '_')}_participant_list.pdf`);
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.description) return;
    let imageUrl: string | null = null;
    if (newEvent.imageFile) {
      imageUrl = await uploadImage(newEvent.imageFile);
      if (!imageUrl) return;
    }
    const { error } = await supabase.from('events').insert({
      title: newEvent.title,
      description: newEvent.description,
      image_url: imageUrl,
      Team_event: newEvent.team_event,
      time: newEvent.time,
      team_size: newEvent.team_event ? parseInt(newEvent.team_size) || 1 : 1,
    });
    if (error) alert('Failed to create event');
    else {
      setCreating(false);
      setNewEvent({
        title: '',
        description: '',
        imageFile: null,
        team_event: false,
        time: '',
        team_size: '',
      });
      fetchEvents();
    }
  };

  const startEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEditEvent({
      title: event.title,
      description: event.description,
      imageFile: null,
      team_event: event.Team_event,
      time: event.time,
      image_url: event.image_url || '',
      team_size: event.team_size ? event.team_size.toString() : '1',
    });
    setEditing(true);
  };

  const updateEvent = async () => {
    if (!editEvent.title || !editEvent.description) return;
    
    let imageUrl = editEvent.image_url;
    if (editEvent.imageFile) {
      const newImageUrl = await uploadImage(editEvent.imageFile);
      if (!newImageUrl) return;
      imageUrl = newImageUrl;
    }

    const { error } = await supabase
      .from('events')
      .update({
        title: editEvent.title,
        description: editEvent.description,
        image_url: imageUrl,
        Team_event: editEvent.team_event,
        time: editEvent.time,
        team_size: editEvent.team_event ? parseInt(editEvent.team_size) || 1 : 1,
      })
      .eq('id', editingEvent?.id);

    if (error) {
      alert('Failed to update event');
    } else {
      setEditing(false);
      setEditingEvent(null);
      setEditEvent({
        title: '',
        description: '',
        imageFile: null,
        team_event: false,
        time: '',
        image_url: '',
        team_size: '',
      });
      fetchEvents();
      
      // Update selected events if the edited event is currently selected
      setSelectedEvents(prev => prev.map(event => 
        event.id === editingEvent?.id
          ? { ...event, title: editEvent.title, description: editEvent.description, Team_event: editEvent.team_event, time: editEvent.time, image_url: imageUrl, team_size: parseInt(editEvent.team_size) || 1 }
          : event
      ));
    }
  };

  const toggleTeamEvent = async (eventId: string, newValue: boolean) => {
    const { error } = await supabase
      .from('events')
      .update({ 
        Team_event: newValue,
        team_size: newValue ? 1 : 1 // Reset to default value when toggling
      })
      .eq('id', eventId);
    
    if (error) {
      alert('Failed to update team toggle');
      return;
    }

    // Clear the team size input for this event when toggling off
    if (!newValue) {
      setTeamSizeInput(prev => ({ ...prev, [eventId]: '' }));
    }

    setEvents((prev) => prev.map((event) => 
      event.id === eventId 
        ? { ...event, Team_event: newValue, team_size: 1 } 
        : event
    ));
    setSelectedEvents((prev) => prev.map((event) => 
      event.id === eventId 
        ? { ...event, Team_event: newValue, team_size: 1 } 
        : event
    ));
  };

  const updateTeamSize = async (eventId: string, teamSize: string) => {
    const size = parseInt(teamSize);
    if (isNaN(size) || size < 1) {
      alert('Please enter a valid team size (minimum 1)');
      return;
    }

    const { error } = await supabase
      .from('events')
      .update({ team_size: size })
      .eq('id', eventId);
    
    if (error) {
      console.error('Failed to update team size:', error);
      alert('Failed to update team size');
    } else {
      alert(`Team size updated to ${size} for this event`);
      
      // Update local state
      setEvents((prev) => prev.map((event) => 
        event.id === eventId 
          ? { ...event, team_size: size } 
          : event
      ));
      setSelectedEvents((prev) => prev.map((event) => 
        event.id === eventId 
          ? { ...event, team_size: size } 
          : event
      ));
      
      // Clear input after successful update
      setTeamSizeInput(prev => ({ ...prev, [eventId]: '' }));
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    await supabase.from('registrations').delete().eq('event_id', eventId);
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    if (error) alert('Failed to delete event');
    else {
      fetchEvents();
      setSelectedEvents((prev) => prev.filter(event => event.id !== eventId));
    }
  };

  const toggleEventSelection = async (event: Event) => {
    const isSelected = selectedEvents.some(selected => selected.id === event.id);
    
    if (isSelected) {
      setSelectedEvents(prev => prev.filter(selected => selected.id !== event.id));
    } else {
      setSelectedEvents(prev => [...prev, event]);
      if (!participantsMap[event.id]) {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('event_id', event.id)
          .order('token', { ascending: true });
        if (!error) {
          setParticipantsMap(prev => ({ ...prev, [event.id]: data }));
        }
      }
    }
  };

  const closeEvent = (eventId: string) => {
    setSelectedEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const handleFireToggle = async () => {
    const newFireStatus = !fireActive;
    setFireActive(newFireStatus);
    await updateFireStatus(newFireStatus);
  };

  const handleEventContainerClick = (e: React.MouseEvent, event: Event) => {
    // Check if the click was on interactive elements (buttons, switches, inputs)
    const target = e.target as HTMLElement;
    const interactiveElements = ['BUTTON', 'INPUT', 'LABEL'];
    const isInteractiveClick = interactiveElements.includes(target.tagName) || 
                              target.closest('button') || 
                              target.closest('input') || 
                              target.closest('label') ||
                              target.getAttribute('role') === 'switch';
    
    // Only toggle selection if it's not an interactive element
    if (!isInteractiveClick) {
      toggleEventSelection(event);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Left Sidebar - 40% */}
      <div className="w-2/5 p-6 border-r border-gray-700 relative">
        <h1 className="text-3xl mb-4 font-bold text-yellow-400">Admin Event Manager</h1>
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/10 backdrop-blur-md text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className={`cursor-pointer p-4 rounded-lg transition-colors relative ${
                selectedEvents.some(selected => selected.id === event.id) ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
              onClick={(e) => handleEventContainerClick(e, event)}
            >
              <div className="text-center mb-3">
                <h2 className="text-lg font-bold border-b border-gray-400 pb-2 inline-block">
                  {event.title}
                </h2>
              </div>
              
              <p className="text-sm text-gray-300 mb-3 text-center">{event.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Time: {event.time}</span>
                
                <div className="flex items-center gap-3">
                  <button
                    className="p-1.5 bg-white/10 backdrop-blur-sm rounded-md text-blue-400 hover:text-blue-300 hover:bg-white/20 transition-all"
                    onClick={(e) => { e.stopPropagation(); startEditEvent(event); }}
                  >
                    <Pencil size={14} />
                  </button>
                  
                  <button
                    className="p-1.5 bg-white/10 backdrop-blur-sm rounded-md text-red-500 hover:text-red-400 hover:bg-white/20 transition-all"
                    onClick={(e) => { e.stopPropagation(); deleteEvent(event.id); }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <span>Team Event</span>
                  <Switch
                    enabled={event.Team_event}
                    setEnabled={(val) => toggleTeamEvent(event.id, val)}
                  />
                </div>
              </div>
              
              {/* Team Size Input - appears when team event is ON */}
              {event.Team_event && (
                <div className="mt-3 p-3 rounded-lg border-2 border-yellow-400 bg-yellow-400/10" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-sm font-semibold">Current Team Size: {event.team_size || 1}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      placeholder="New team size"
                      className="flex-1 px-2 py-1 rounded bg-white text-black text-sm"
                      value={teamSizeInput[event.id] || ''}
                      onChange={(e) => setTeamSizeInput(prev => ({ ...prev, [event.id]: e.target.value }))}
                      min="1"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateTeamSize(event.id, teamSizeInput[event.id] || '');
                      }}
                      className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 text-black text-xs rounded font-semibold"
                      disabled={!teamSizeInput[event.id]}
                    >
                      Update
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => setCreating(true)}
            className="w-full p-4 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <Plus className="w-6 h-6 mr-2" />
            Add New Event
          </button>
        </div>

        {/* Fire Icon Button */}
        <button
          onClick={handleFireToggle}
          className={`fixed bottom-6 left-6 w-12 h-12 rounded-full backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
            fireActive 
              ? 'bg-orange-500/20 text-orange-500 border-orange-500/50' 
              : 'bg-white/10 text-gray-400 hover:text-gray-300'
          }`}
        >
          <Flame size={20} />
        </button>
      </div>

      {/* Right Panel - 60% */}
      <div className="w-3/5 p-6">
        {selectedEvents.length > 0 ? (
          <div className="space-y-6 max-h-screen overflow-y-auto">
            {selectedEvents.map((event) => (
              <div key={event.id} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-yellow-400">{event.title}</h2>
                  <button 
                    onClick={() => closeEvent(event.id)} 
                    className="text-red-400 hover:text-red-300 text-lg font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-yellow-400">Participants</h3>
                    <button
                      onClick={() => downloadParticipantsPDF(event)}
                      className="text-sm text-blue-400 hover:text-blue-300 underline"
                    >
                      Download PDF
                    </button>
                  </div>

                  {(participantsMap[event.id]?.length ?? 0) === 0 ? (
                    <p className="text-gray-400 text-center py-8 bg-white/5 rounded-lg">
                      No participants registered yet.
                    </p>
                  ) : (
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="max-h-80 overflow-y-auto">
                        <ul className="space-y-2">
                          {participantsMap[event.id].map((p) => (
                            <li
                              key={p.id}
                              className="flex justify-between items-center p-3 bg-white/10 rounded-lg border border-white/20"
                            >
                              <span className="font-mono text-yellow-400">#{p.token}</span>
                              <div className="text-right">
                                <div className="font-semibold">{p.name}</div>
                                {p.Team_name && (
                                  <div className="text-sm text-gray-400">{p.Team_name}</div>
                                )}
                                {p.description && (
                                  <div className="text-xs text-gray-500 mt-1">{p.description}</div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 h-96 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold mb-2">Select Events</h3>
              <p>Click on events from the left panel to view details and participants</p>
              <p className="text-sm mt-2">You can select multiple events to view them simultaneously</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {creating && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-96 space-y-4">
            <h2 className="text-xl font-bold">Create New Event</h2>
            <input
              type="text"
              placeholder="Title"
              className="w-full border px-2 py-1 rounded"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
            />
            <input
              type="time"
              className="w-full border px-2 py-1 rounded"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="w-full border px-2 py-1 rounded h-20 resize-none"
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
            />
            <input
              type="file"
              accept="image/*"
              className="w-full"
              onChange={(e) => setNewEvent({ ...newEvent, imageFile: e.target.files?.[0] || null })}
            />
            <div className="flex items-center gap-2">
              <label>Team Event</label>
              <Switch
                enabled={newEvent.team_event}
                setEnabled={(val) => setNewEvent({ ...newEvent, team_event: val })}
              />
            </div>
            {newEvent.team_event && (
              <input
                type="number"
                placeholder="Enter team size"
                className="w-full border px-2 py-1 rounded"
                value={newEvent.team_size}
                onChange={(e) => setNewEvent({ ...newEvent, team_size: e.target.value })}
                min="1"
              />
            )}
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setCreating(false)} 
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={createEvent} 
                className="bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded text-black font-semibold"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-96 space-y-4">
            <h2 className="text-xl font-bold">Edit Event</h2>
            <input
              type="text"
              placeholder="Title"
              className="w-full border px-2 py-1 rounded"
              value={editEvent.title}
              onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
            />
            <input
              type="time"
              className="w-full border px-2 py-1 rounded"
              value={editEvent.time}
              onChange={(e) => setEditEvent({ ...editEvent, time: e.target.value })}
            />
            <textarea
              placeholder="Description"
              className="w-full border px-2 py-1 rounded h-20 resize-none"
              value={editEvent.description}
              onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
            />
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                className="w-full"
                onChange={(e) => setEditEvent({ ...editEvent, imageFile: e.target.files?.[0] || null })}
              />
              {editEvent.image_url && !editEvent.imageFile && (
                <p className="text-sm text-gray-600">Current image will be kept if no new image is selected</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label>Team Event</label>
              <Switch
                enabled={editEvent.team_event}
                setEnabled={(val) => setEditEvent({ ...editEvent, team_event: val })}
              />
            </div>
            {editEvent.team_event && (
              <input
                type="number"
                placeholder="Enter team size"
                className="w-full border px-2 py-1 rounded"
                value={editEvent.team_size}
                onChange={(e) => setEditEvent({ ...editEvent, team_size: e.target.value })}
                min="1"
              />
            )}
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setEditing(false);
                  setEditingEvent(null);
                }} 
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={updateEvent} 
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white font-semibold"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}