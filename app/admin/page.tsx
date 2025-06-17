'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import Switch from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Search, Flame, Download } from 'lucide-react';
import jsPDF from 'jspdf';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  registration_open: boolean;
  Team_event: boolean;
  team_size: number;
  image_filename?: string;
  audio: boolean;
  video: boolean;
}

interface Participant {
  id: string;
  token: string;
  name: string;
  Team_name?: string;
  description?: string;
  event_id: string;
  student_id: string;
}

interface MediaFile {
  name: string;
  url: string;
  type: 'audio' | 'video';
  studentId: string;
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);
  const [participantsMap, setParticipantsMap] = useState<{ [key: string]: Participant[] }>({});
  const [mediaFilesMap, setMediaFilesMap] = useState<{ [key: string]: MediaFile[] }>({});
  const [teamSizeInput, setTeamSizeInput] = useState<{ [key: string]: string }>({});
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    imageFile: null as File | null,
    registration_open: true,
    Team_event: false,
    team_size: '1',
    audio: false,
    video: false,
  });
  const [editEvent, setEditEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    registration_open: true,
    Team_event: false,
    team_size: '1',
    audio: false,
    video: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [fireActive, setFireActive] = useState(false);

  useEffect(() => {
    fetchEvents();
    initializeFireStatus();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*');
    if (error) console.error(error);
    else setEvents(data);
  };

  const initializeFireStatus = async () => {
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
    
    const { error } = await supabase
      .from('admin_status')
      .upsert({ 
        id: 1,
        fire_status: status,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to update fire status:', error);
      window.dispatchEvent(new CustomEvent('fireStatusChange', { 
        detail: { status } 
      }));
    }
  };

  // Function to fetch media files for an event
  const fetchMediaFiles = async (eventId: string): Promise<MediaFile[]> => {
    try {
      const mediaFiles: MediaFile[] = [];

      // Fetch audio files
      const { data: audioFiles, error: audioError } = await supabase.storage
        .from('event-image')
        .list('audio', {
          limit: 100,
          offset: 0
        });

      if (!audioError && audioFiles) {
        const eventAudioFiles = audioFiles.filter(file => 
          file.name.startsWith(`${eventId}_`)
        );

        for (const file of eventAudioFiles) {
          const { data } = supabase.storage
            .from('event-image')
            .getPublicUrl(`audio/${file.name}`);

          // Extract student ID from filename: eventId_studentId.extension
          const fileNameParts = file.name.split('_');
          if (fileNameParts.length >= 2) {
            const studentIdWithExt = fileNameParts.slice(1).join('_'); // Handle cases where filename might have underscores
            const studentId = studentIdWithExt.split('.')[0];

            mediaFiles.push({
              name: file.name,
              url: data.publicUrl,
              type: 'audio',
              studentId: studentId
            });
          }
        }
      }

      // Fetch video files
      const { data: videoFiles, error: videoError } = await supabase.storage
        .from('event-image')
        .list('video', {
          limit: 100,
          offset: 0
        });

      if (!videoError && videoFiles) {
        const eventVideoFiles = videoFiles.filter(file => 
          file.name.startsWith(`${eventId}_`)
        );

        for (const file of eventVideoFiles) {
          const { data } = supabase.storage
            .from('event-image')
            .getPublicUrl(`video/${file.name}`);

          // Extract student ID from filename: eventId_studentId.extension
          const fileNameParts = file.name.split('_');
          if (fileNameParts.length >= 2) {
            const studentIdWithExt = fileNameParts.slice(1).join('_');
            const studentId = studentIdWithExt.split('.')[0];

            mediaFiles.push({
              name: file.name,
              url: data.publicUrl,
              type: 'video',
              studentId: studentId
            });
          }
        }
      }

      return mediaFiles;
    } catch (err) {
      console.error('Error fetching media files:', err);
      return [];
    }
  };

  // Function to get media files for a specific participant
  const getParticipantMediaFiles = (eventId: string, studentId: string): MediaFile[] => {
    const eventMediaFiles = mediaFilesMap[eventId] || [];
    return eventMediaFiles.filter(file => file.studentId === studentId);
  };

  // Audio control functions
  const handleAudioPlay = (audioId: string) => {
    if (playingAudio && playingAudio !== audioId) {
      // Stop currently playing audio
      const currentAudio = document.getElementById(playingAudio) as HTMLAudioElement;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    }
    setPlayingAudio(audioId);
  };

  const handleAudioPause = () => {
    setPlayingAudio(null);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const uploadImageToSupabase = async (file: File, eventId: string): Promise<string | null> => {
    try {
      // Get file extension
      const extension = file.name.split('.').pop();
      const filename = `${eventId}.${extension}`;
      const filePath = filename;
  
      console.log(`Attempting to upload file: ${filePath}`);
  
      // Check if file already exists and remove it first (for updates)
      const { data: existingFiles } = await supabase.storage
        .from('event-image')
        .list('', { search: eventId });
  
      if (existingFiles && existingFiles.length > 0) {
        // Remove existing files for this event
        const filesToRemove = existingFiles
          .filter(file => file.name.startsWith(eventId + '.'))
          .map(file => file.name);
        
        if (filesToRemove.length > 0) {
          console.log('Removing existing files:', filesToRemove);
          const { error: removeError } = await supabase.storage
            .from('event-image')
            .remove(filesToRemove);
          
          if (removeError) {
            console.warn('Warning: Could not remove existing file:', removeError);
            // Continue with upload anyway
          }
        }
      }
  
      // Upload new file
      const { data, error } = await supabase.storage
        .from('event-image')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // This will overwrite if file exists
        });
  
      if (error) {
        console.error('Supabase upload error:', error);
        alert(`Image upload failed: ${error.message}`);
        return null;
      }
  
      console.log('Upload successful:', data);
      return filename;
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Image upload failed due to unexpected error');
      return null;
    }
  };
  
  const downloadParticipantsPDF = (event: Event) => {
    const doc = new jsPDF();
    const participants = participantsMap[event.id] || [];
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
  
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(event.title, margin, 25);
    
    doc.setLineWidth(0.5);
    doc.line(margin, 28, margin + doc.getTextWidth(event.title), 28);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Participant List', margin, 38);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Event Time: ' + (event.time || 'Not specified'), margin, 50);
    
    const descriptionLines = doc.splitTextToSize('Description: ' + (event.description || 'No description'), contentWidth);
    doc.text(descriptionLines, margin, 58);
    
    let y = 58 + (descriptionLines.length * 5) + 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Participants: ${participants.length}`, margin, y);
    
    y += 15;
    
    if (participants.length === 0) {
      doc.setFont('helvetica', 'italic');
      doc.text('No participants registered yet.', margin, y);
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y - 2, contentWidth, 8, 'F');
      
      doc.text('Token', margin + 2, y + 4);
      doc.text('Name', margin + 25, y + 4);
      doc.text('Team Name', margin + 80, y + 4);
      doc.text('Description', margin + 125, y + 4);
      
      doc.setLineWidth(0.3);
      doc.line(margin, y + 6, margin + contentWidth, y + 6);
      
      y += 12;
      
      doc.setFont('helvetica', 'normal');
      participants.forEach((p, index) => {
        const descText = p.description || '-';
        const descriptionWidth = contentWidth - 125;
        const descLines = doc.splitTextToSize(descText, descriptionWidth);
        const rowHeight = Math.max(8, descLines.length * 4 + 2);
        
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(margin, y - 2, contentWidth, rowHeight, 'F');
        }
        
        doc.setFont('helvetica', 'bold');
        doc.text('#' + p.token, margin + 2, y + 4);
        
        doc.setFont('helvetica', 'normal');
        const nameText = p.name || 'N/A';
        const nameLines = doc.splitTextToSize(nameText, 50);
        doc.text(nameLines, margin + 25, y + 4);
        
        const teamText = p.Team_name || '-';
        const teamLines = doc.splitTextToSize(teamText, 40);
        doc.text(teamLines, margin + 80, y + 4);
        
        doc.text(descLines, margin + 125, y + 4);
        
        y += rowHeight;
        
        if (y > 270) {
          doc.addPage();
          y = 25;
          
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
    
    const pageCount = doc.internal.pages.length - 1;
    
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
    
    // Step 1: Insert event details into the events table first
    const { data, error } = await supabase.from('events').insert({
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      registration_open: newEvent.registration_open,
      Team_event: newEvent.Team_event,
      team_size: newEvent.Team_event ? parseInt(newEvent.team_size) || 1 : 1,
      audio: newEvent.audio,
      video: newEvent.video,
    }).select('id').single();
    
    if (error) {
      console.error('Database insert error:', error);
      alert('Failed to create event');
      return;
    }

    // Step 2: Get the event ID from the inserted record
    const eventId = data.id;
    console.log('Created event with ID:', eventId);
    
    // Step 3: Upload image with event ID as filename (if image provided)
    if (newEvent.imageFile) {
      const imageFilename = await uploadImageToSupabase(newEvent.imageFile, eventId);
      if (!imageFilename) {
        // Image upload failed, but event was created successfully
        alert('Event created successfully, but image upload failed');
      } else {
        console.log('Image uploaded as:', imageFilename);
      }
    }
    
    // Reset form and refresh events list
    setCreating(false);
    setNewEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      imageFile: null,
      registration_open: true,
      Team_event: false,
      team_size: '1',
      audio: false,
      video: false,
    });
    fetchEvents();
    alert('Event created successfully!');
  };

  const startEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEditEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      registration_open: event.registration_open,
      Team_event: event.Team_event,
      team_size: event.team_size ? event.team_size.toString() : '1',
      audio: event.audio || false,
      video: event.video || false,
    });
    setEditing(true);
  };

  const updateEvent = async () => {
    if (!editEvent.title || !editEvent.description || !editingEvent?.id) return;
    
    // Updated updateData to include audio and video fields
    const updateData = {
      title: editEvent.title,
      description: editEvent.description,
      date: editEvent.date,
      time: editEvent.time,
      registration_open: editEvent.registration_open,
      Team_event: editEvent.Team_event,
      team_size: editEvent.Team_event ? parseInt(editEvent.team_size) || 1 : 1,
      audio: editEvent.audio,
      video: editEvent.video,
    };

    console.log('Updating event with data:', updateData);

    const { error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', editingEvent.id);

    if (error) {
      console.error('Database update error:', error);
      alert('Failed to update event');
      return;
    }

    // Success - clean up and refresh
    alert('Event updated successfully!');
    
    setEditing(false);
    setEditingEvent(null);
    setEditEvent({
      title: '',
      description: '',
      date: '',
      time: '',
      registration_open: true,
      Team_event: false,
      team_size: '1',
      audio: false,
      video: false,
    });
    
    // Refresh events list
    fetchEvents();
    
    // Update selected events in state
    setSelectedEvents(prev => prev.map(event => 
      event.id === editingEvent.id
        ? { 
            ...event, 
            title: editEvent.title, 
            description: editEvent.description,
            date: editEvent.date,
            time: editEvent.time,
            registration_open: editEvent.registration_open,
            Team_event: editEvent.Team_event,
            team_size: parseInt(editEvent.team_size) || 1,
            audio: editEvent.audio,
            video: editEvent.video,
          }
        : event
    ));
  };

  const toggleRegistrationOpen = async (eventId: string, newValue: boolean) => {
    const { error } = await supabase
      .from('events')
      .update({ registration_open: newValue })
      .eq('id', eventId);
    
    if (error) {
      alert('Failed to update registration status');
      return;
    }

    // Update local state
    setEvents((prev) => prev.map((event) => 
      event.id === eventId 
        ? { ...event, registration_open: newValue } 
        : event
    ));
    setSelectedEvents((prev) => prev.map((event) => 
      event.id === eventId 
        ? { ...event, registration_open: newValue } 
        : event
    ));
    
    console.log(`Registration ${newValue ? 'opened' : 'closed'} for event ${eventId}`);
  };

  const toggleTeamEvent = async (eventId: string, newValue: boolean) => {
    const { error } = await supabase
      .from('events')
      .update({ 
        Team_event: newValue,
        team_size: newValue ? 1 : 1
      })
      .eq('id', eventId);
    
    if (error) {
      alert('Failed to update team toggle');
      return;
    }

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
      
      // Fetch media files for this event
      if (!mediaFilesMap[event.id]) {
        const mediaFiles = await fetchMediaFiles(event.id);
        setMediaFilesMap(prev => ({ ...prev, [event.id]: mediaFiles }));
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
    const target = e.target as HTMLElement;
    const interactiveElements = ['BUTTON', 'INPUT', 'LABEL'];
    const isInteractiveClick = interactiveElements.includes(target.tagName) || 
                              target.closest('button') || 
                              target.closest('input') || 
                              target.closest('label') ||
                              target.getAttribute('role') === 'switch';
    
    if (!isInteractiveClick) {
      toggleEventSelection(event);
    }
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white flex">
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
                <span>Date: {event.date}</span>
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
              
              {/* Audio/Video requirements display */}
              {(event.audio || event.video) && (
                <div className="mt-3 p-2 rounded-lg border border-purple-400 bg-purple-400/10">
                  <div className="flex items-center gap-4 text-xs">
                    {event.audio && (
                      <span className="text-purple-400 font-semibold">🎤 Audio Required</span>
                    )}
                    {event.video && (
                      <span className="text-purple-400 font-semibold">📹 Video Required</span>
                    )}
                  </div>
                </div>
              )}
              
              {/* Registration Status Toggle */}
              <div className="mt-3 p-3 rounded-lg border-2 border-blue-400 bg-blue-400/10" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 text-sm font-semibold">
                    Registration: {event.registration_open ? 'Open' : 'Closed'}
                  </span>
                  <Switch
                    enabled={event.registration_open}
                    setEnabled={(val) => toggleRegistrationOpen(event.id, val)}
                  />
                </div>
              </div>
              
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
                        <ul className="space-y-4">
                          {participantsMap[event.id].map((p) => {
                            const participantMediaFiles = getParticipantMediaFiles(event.id, p.student_id);
                            const audioFiles = participantMediaFiles.filter(f => f.type === 'audio');
                            const videoFiles = participantMediaFiles.filter(f => f.type === 'video');
                            
                            return (
                              <li
                                key={p.id}
                                className="p-4 bg-white/10 rounded-lg border border-white/20"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <span className="font-mono text-yellow-400 text-lg">#{p.token}</span>
                                  <div className="text-right">
                                    <div className="font-semibold text-lg">{p.name}</div>
                                    {p.Team_name && (
                                      <div className="text-sm text-gray-400">{p.Team_name}</div>
                                    )}
                                    {p.description && (
                                      <div className="text-xs text-gray-500 mt-1">{p.description}</div>
                                    )}
                                  </div>
                                </div>

                                {/* Media Files Section */}
                                {(audioFiles.length > 0 || videoFiles.length > 0) && (
                                  <div className="mt-4 p-3 bg-white/5 rounded-lg border border-purple-400/30">
                                    <h4 className="text-sm font-semibold text-purple-400 mb-3">📎 Uploaded Files</h4>
                                    
                                    {/* Audio Files */}
                                    {audioFiles.length > 0 && (
                                      <div className="mb-4">
                                        <h5 className="text-xs text-purple-300 mb-2">🎤 Audio Files:</h5>
                                        {audioFiles.map((audioFile, index) => {
                                          const audioId = `audio-${event.id}-${p.student_id}-${index}`;
                                          return (
                                            <div key={audioFile.name} className="mb-3 p-2 bg-white/5 rounded border border-blue-400/30">
                                              <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-blue-300 truncate max-w-48">{audioFile.name}</span>
                                                <button
                                                  onClick={() => downloadFile(audioFile.url, audioFile.name)}
                                                  className="text-blue-400 hover:text-blue-300 p-1"
                                                  title="Download Audio"
                                                >
                                                  <Download size={14} />
                                                </button>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <audio
                                                  id={audioId}
                                                  src={audioFile.url}
                                                  className="w-full h-8"
                                                  controls
                                                  preload="metadata"
                                                  onPlay={() => handleAudioPlay(audioId)}
                                                  onPause={handleAudioPause}
                                                  onEnded={handleAudioPause}
                                                />
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}

                                    {/* Video Files */}
                                    {videoFiles.length > 0 && (
                                      <div>
                                        <h5 className="text-xs text-purple-300 mb-2">📹 Video Files:</h5>
                                        {videoFiles.map((videoFile) => (
                                          <div key={videoFile.name} className="mb-3 p-2 bg-white/5 rounded border border-green-400/30">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-xs text-green-300 truncate max-w-48">{videoFile.name}</span>
                                              <button
                                                onClick={() => downloadFile(videoFile.url, videoFile.name)}
                                                className="text-green-400 hover:text-green-300 p-1"
                                                title="Download Video"
                                              >
                                                <Download size={14} />
                                              </button>
                                            </div>
                                            <video
                                              src={videoFile.url}
                                              className="w-full max-h-48 rounded border border-green-400/20"
                                              controls
                                              preload="metadata"
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* No Media Files Message */}
                                {(event.audio || event.video) && audioFiles.length === 0 && videoFiles.length === 0 && (
                                  <div className="mt-4 p-3 bg-red-500/10 rounded-lg border border-red-400/30">
                                    <p className="text-xs text-red-300">
                                      ⚠️ No media files uploaded yet (Required: {event.audio ? 'Audio' : ''}{event.audio && event.video ? ' & ' : ''}{event.video ? 'Video' : ''})
                                    </p>
                                  </div>
                                )}
                              </li>
                            );
                          })}
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
              type="date"
              className="w-full border px-2 py-1 rounded"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
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
            
            {/* Modified file input with warning message */}
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                className="w-full"
                onChange={(e) => setNewEvent({ ...newEvent, imageFile: e.target.files?.[0] || null })}
              />
              {newEvent.imageFile && (
                <div className="p-3 bg-yellow-100 border border-yellow-400 rounded">
                  <p className="text-sm text-yellow-800 font-medium">
                    ⚠️ Warning: Once an image is added, it cannot be modified or deleted later.
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Selected: {newEvent.imageFile.name}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <label>Registration Open</label>
              <Switch
                enabled={newEvent.registration_open}
                setEnabled={(val) => setNewEvent({ ...newEvent, registration_open: val })}
              />
            </div>
            <div className="flex items-center gap-2">
              <label>Team Event</label>
              <Switch
                enabled={newEvent.Team_event}
                setEnabled={(val) => setNewEvent({ ...newEvent, Team_event: val })}
              />
            </div>
            {newEvent.Team_event && (
              <input
                type="number"
                placeholder="Enter team size"
                className="w-full border px-2 py-1 rounded"
                value={newEvent.team_size}
                onChange={(e) => setNewEvent({ ...newEvent, team_size: e.target.value })}
                min="1"
              />
            )}
            
            {/* Audio Required Toggle */}
            <div className="flex items-center gap-2">
              <label>Audio Required</label>
              <Switch
                enabled={newEvent.audio}
                setEnabled={(val) => setNewEvent({ ...newEvent, audio: val })}
              />
            </div>
            
            {/* Video Required Toggle */}
            <div className="flex items-center gap-2">
              <label>Video Required</label>
              <Switch
                enabled={newEvent.video}
                setEnabled={(val) => setNewEvent({ ...newEvent, video: val })}
              />
            </div>
            
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
              type="date"
              className="w-full border px-2 py-1 rounded"
              value={editEvent.date}
              onChange={(e) => setEditEvent({ ...editEvent, date: e.target.value })}
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
            
            {/* Removed image upload option from edit modal */}
            <div className="p-3 bg-gray-100 border border-gray-300 rounded">
              <p className="text-sm text-gray-600">
                📷 Image modifications are not available in edit mode.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Images can only be added during event creation.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <label>Registration Open</label>
              <Switch
                enabled={editEvent.registration_open}
                setEnabled={(val) => setEditEvent({ ...editEvent, registration_open: val })}
              />
            </div>
            <div className="flex items-center gap-2">
              <label>Team Event</label>
              <Switch
                enabled={editEvent.Team_event}
                setEnabled={(val) => setEditEvent({ ...editEvent, Team_event: val })}
              />
            </div>
            {editEvent.Team_event && (
              <input
                type="number"
                placeholder="Enter team size"
                className="w-full border px-2 py-1 rounded"
                value={editEvent.team_size}
                onChange={(e) => setEditEvent({ ...editEvent, team_size: e.target.value })}
                min="1"
              />
            )}
            
            {/* Audio Required Toggle */}
            <div className="flex items-center gap-2">
              <label>Audio Required</label>
              <Switch
                enabled={editEvent.audio}
                setEnabled={(val) => setEditEvent({ ...editEvent, audio: val })}
              />
            </div>
            
            {/* Video Required Toggle */}
            <div className="flex items-center gap-2">
              <label>Video Required</label>
              <Switch
                enabled={editEvent.video}
                setEnabled={(val) => setEditEvent({ ...editEvent, video: val })}
              />
            </div>
            
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