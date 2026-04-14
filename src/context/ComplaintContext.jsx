// Global complaint data store using React Context
import { createContext, useContext, useState, useEffect } from 'react';

const ComplaintContext = createContext(null);

const STORAGE_KEY = 'cms_complaints';
const USERS_KEY = 'cms_users';

// Seed data for demonstration
const SEED_COMPLAINTS = [
  {
    id: 'CMP-001',
    title: 'Street light not working on Main Ave',
    description: 'The street light at the corner of Main Ave and 5th Street has been out for over a week. This creates a safety hazard for pedestrians at night.',
    category: 'Infrastructure',
    priority: 'high',
    status: 'in-progress',
    submittedBy: 'John Doe',
    email: 'john.doe@example.com',
    phone: '555-0101',
    location: 'Main Ave & 5th Street',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: {
      summary: 'Non-functional street lighting creating safety hazard.',
      suggestedResponse: 'We have dispatched our maintenance team to address the street light issue at Main Ave & 5th Street.',
    },
    notes: ['Maintenance team notified', 'Scheduled for repair on Thursday'],
    attachments: [],
  },
  {
    id: 'CMP-002',
    title: 'Water supply disruption in Sector 7',
    description: 'No water supply in our area for the past 3 days. Multiple households are affected. We need urgent resolution.',
    category: 'Service',
    priority: 'critical',
    status: 'pending',
    submittedBy: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '555-0102',
    location: 'Sector 7, Block B',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: {
      summary: 'Critical water supply outage affecting multiple households.',
      suggestedResponse: 'We are treating this as a critical priority. Emergency water supply teams have been alerted.',
    },
    notes: [],
    attachments: [],
  },
  {
    id: 'CMP-003',
    title: 'Incorrect billing amount on invoice #4521',
    description: 'I was charged $250 instead of the agreed $180 for the monthly service package. Please review and correct the invoice.',
    category: 'Billing',
    priority: 'medium',
    status: 'resolved',
    submittedBy: 'Alex Johnson',
    email: 'alex.j@example.com',
    phone: '555-0103',
    location: 'Online',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: {
      summary: 'Customer overcharged by $70 on monthly service invoice.',
      suggestedResponse: 'We have reviewed your invoice and confirmed the discrepancy. A credit of $70 has been applied to your account.',
    },
    notes: ['Credit issued', 'Customer notified via email'],
    attachments: [],
  },
  {
    id: 'CMP-004',
    title: 'App crashes on login screen (iOS 17)',
    description: 'After the latest update, the mobile app crashes immediately after entering credentials on iOS 17 devices. Multiple users are reporting this.',
    category: 'Technical',
    priority: 'critical',
    status: 'in-progress',
    submittedBy: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    phone: '555-0104',
    location: 'Mobile App',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: {
      summary: 'Critical iOS 17 crash bug on login screen post-update.',
      suggestedResponse: 'Our engineering team has identified the issue and is working on an emergency patch.',
    },
    notes: ['Engineering team alerted', 'Hotfix branch created', 'ETA: 24 hours'],
    attachments: [],
  },
  {
    id: 'CMP-005',
    title: 'Rude behavior from support staff',
    description: 'Support agent was dismissive and unhelpful during my call on April 10th. The service was unsatisfactory.',
    category: 'Staff',
    priority: 'low',
    status: 'resolved',
    submittedBy: 'Mike Wilson',
    email: 'mike.w@example.com',
    phone: '555-0105',
    location: 'Phone Support',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    aiAnalysis: {
      summary: 'Customer satisfaction issue with phone support agent conduct.',
      suggestedResponse: 'We sincerely apologize for your experience. This has been escalated to our quality team and corrective action has been taken.',
    },
    notes: ['QA reviewed call recording', 'Agent counseled'],
    attachments: [],
  },
];

const SEED_USERS = [
  { id: 'USR-001', name: 'Admin User', email: 'admin@cms.com', role: 'admin', password: 'admin123' },
  { id: 'USR-002', name: 'John Doe', email: 'john@example.com', role: 'user', password: 'user123' },
];

export function ComplaintProvider({ children }) {
  const [complaints, setComplaints] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : SEED_COMPLAINTS;
    } catch {
      return SEED_COMPLAINTS;
    }
  });

  const [users] = useState(() => {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : SEED_USERS;
    } catch {
      return SEED_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cms_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // --- NOTIFICATION ARCHITECTURE --- //
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem('cms_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cms_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (targetRoleOrUserId, title, message, type = 'info') => {
    const notify = {
      id: `NOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      target: targetRoleOrUserId, // 'admin' or explicit email
      title,
      message,
      type, // 'info', 'success', 'warning', 'critical'
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [notify, ...prev].slice(0, 50)); // cap at 50
  };

  const markNotificationsAsRead = (targetRoleOrUserId) => {
    setNotifications(prev =>
      prev.map(n => n.target === targetRoleOrUserId ? { ...n, read: true } : n)
    );
  };
  // -------------------------------- //

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));

    // Auto-Escalation Check for pending complaints older than 48 hours
    const now = new Date();
    const prolonged = complaints.filter(c => c.status === 'pending' && ((now - new Date(c.createdAt)) / (1000 * 60 * 60) > 48));

    if (prolonged.length > 0) {
      // Just check if we recently triggered escalation to avoid spamming the log on every render
      const recentEscalation = notifications.find(n => n.type === 'escalation' && (now - new Date(n.createdAt)) / (1000 * 60) < 60);
      if (!recentEscalation) {
        addNotification('admin', 'Auto-Escalation Alert', `${prolonged.length} pending tickets have exceeded the 48-hour SLA threshold. Immediate triage required.`, 'escalation');
      }
    }
  }, [complaints]);

  const addComplaint = (complaint) => {
    const newComplaint = {
      ...complaint,
      id: `CMP-${String(complaints.length + 1).padStart(3, '0')}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [],
      attachments: [],
    };
    setComplaints(prev => [newComplaint, ...prev]);

    // System Event: Log Submission Notification (User)
    addNotification(newComplaint.email, 'Ticket Logged Securley', `Your complaint (${newComplaint.id}) has been forwarded.`, 'success');

    // System Event: Critical Log Alert (Admin)
    if (newComplaint.priority === 'critical' || newComplaint.aiAnalysis?.sentiment === 'Critical') {
      addNotification('admin', 'CRITICAL PRIORITY Incident', `A highly urgent incident (${newComplaint.id}) was initiated by ${newComplaint.submittedBy}.`, 'critical');
    } else {
      addNotification('admin', 'New Ticket Generated', `A new standard ticket (${newComplaint.id}) was logged.`, 'info');
    }

    return newComplaint;
  };

  const updateComplaint = (id, updates) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...updates, updatedAt: new Date().toISOString() };

          // Detect Status Phase Transition
          if (updates.status && updates.status !== c.status) {
            let msg = `Status on your ticket (${id}) moved to ${updates.status.toUpperCase()}.`;
            if (updates.status === 'resolved') msg = `Your ticket (${id}) was formally Resolved. Reason: ${updates.resolutionMessage || 'Standard administrative closure.'}`;
            addNotification(c.email, 'Ticket Workflow Update', msg, updates.status === 'resolved' ? 'success' : 'info');
          }

          return updated;
        }
        return c;
      })
    );
  };

  const deleteComplaint = (id) => {
    setComplaints(prev => prev.filter(c => c.id !== id));
  };

  const addNote = (complaintId, note) => {
    setComplaints(prev =>
      prev.map(c =>
        c.id === complaintId
          ? { ...c, notes: [...(c.notes || []), note], updatedAt: new Date().toISOString() }
          : c
      )
    );
  };

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      setCurrentUser(safeUser);
      localStorage.setItem('cms_current_user', JSON.stringify(safeUser));
      return { success: true, user: safeUser };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cms_current_user');
  };

  const getStats = () => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const inProgress = complaints.filter(c => c.status === 'in-progress').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const rejected = complaints.filter(c => c.status === 'rejected').length;
    const highPriority = complaints.filter(c => c.priority === 'high' || c.priority === 'critical').length;
    return { total, pending, inProgress, resolved, rejected, highPriority };
  };

  const getCategoryDistribution = () => {
    const categories = {};
    complaints.forEach(c => {
      categories[c.category] = (categories[c.category] || 0) + 1;
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  const getMonthlyTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      submitted: Math.floor(Math.random() * 30) + 5,
      resolved: Math.floor(Math.random() * 25) + 3,
    }));
  };

  const getStatusDistribution = () => {
    const statuses = {};
    complaints.forEach(c => {
      const statusName = c.status === 'in-progress' ? 'In Progress' : c.status.charAt(0).toUpperCase() + c.status.slice(1);
      statuses[statusName] = (statuses[statusName] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  };

  const getAverageResolutionTime = () => {
    const resolved = complaints.filter(c => c.status === 'resolved');
    if (resolved.length === 0) return '0 hrs';

    const totalMs = resolved.reduce((acc, c) => {
      return acc + (new Date(c.updatedAt) - new Date(c.createdAt));
    }, 0);

    const avgMs = totalMs / resolved.length;
    const hours = Math.round(avgMs / (1000 * 60 * 60));

    if (hours < 24) return `${hours} hrs`;
    return `${Math.round(hours / 24)} days`;
  };

  const updateMultipleComplaints = (ids, updates) => {
    setComplaints(prev =>
      prev.map(c => {
        if (ids.includes(c.id)) {
          // If macro status assignment triggered dispatch alerts to origin user iteratively 
          if (updates.status && updates.status !== c.status) {
            addNotification(c.email, 'Ticket Update (Bulk)', `Status on your ticket (${c.id}) macro-assigned to ${updates.status.toUpperCase()}.`, 'info');
          }
          return { ...c, ...updates, updatedAt: new Date().toISOString() };
        }
        return c;
      })
    );
  };

  return (
    <ComplaintContext.Provider value={{
      complaints,
      currentUser,
      notifications,
      markNotificationsAsRead,
      addComplaint,
      updateComplaint,
      updateMultipleComplaints,
      deleteComplaint,
      addNote,
      login,
      logout,
      getStats,
      getCategoryDistribution,
      getMonthlyTrend,
      getStatusDistribution,
      getAverageResolutionTime,
    }}>
      {children}
    </ComplaintContext.Provider>
  );
}

export function useComplaints() {
  const context = useContext(ComplaintContext);
  if (!context) throw new Error('useComplaints must be used within ComplaintProvider');
  return context;
}
