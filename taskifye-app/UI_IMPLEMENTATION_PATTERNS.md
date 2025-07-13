# UI Implementation Patterns for Light Architecture

## Core Patterns for Light UI

### Pattern 1: Fire and Forget
**When to use:** Long-running operations where immediate result isn't needed

```typescript
// ❌ Heavy UI - Blocks user for 30+ seconds
const generateMonthlyInvoices = async () => {
  setLoading(true);
  try {
    const jobs = await api.getCompletedJobs();
    for (const job of jobs) {
      const invoice = await api.createInvoice(job);
      await api.sendInvoice(invoice);
      await api.updateJob(job.id, { invoiced: true });
    }
    showSuccess('All invoices generated!');
  } finally {
    setLoading(false);
  }
};

// ✅ Light UI - Returns immediately
const generateMonthlyInvoices = async () => {
  const { workflowId } = await api.post('/n8n/webhook/monthly-invoices');
  showNotification('Generating invoices... You\'ll be notified when complete.');
  
  // Optional: Track progress
  trackWorkflow(workflowId);
};
```

### Pattern 2: Optimistic Updates
**When to use:** Simple changes that rarely fail

```typescript
// ✅ Update UI immediately, sync in background
const updateDealStage = async (dealId: string, newStage: string) => {
  // 1. Update UI immediately
  setDealStage(dealId, newStage);
  
  // 2. Trigger sync via n8n
  api.post('/n8n/webhook/sync-deal-stage', { 
    dealId, 
    newStage,
    timestamp: Date.now() 
  }).catch(error => {
    // 3. Rollback on failure
    setDealStage(dealId, previousStage);
    showError('Failed to update. Please try again.');
  });
};
```

### Pattern 3: Status Polling
**When to use:** Need to show progress of background operations

```typescript
// ✅ Light UI with progress tracking
const importContacts = async (file: File) => {
  // 1. Upload file and start workflow
  const { workflowId, estimatedTime } = await api.post('/n8n/webhook/import-contacts', {
    file,
    totalRecords: file.size / 100 // rough estimate
  });
  
  // 2. Show progress UI
  showProgressBar(0);
  
  // 3. Poll for status
  const interval = setInterval(async () => {
    const status = await api.get(`/workflow-status/${workflowId}`);
    
    updateProgressBar(status.progress);
    updateStatus(status.message);
    
    if (status.complete) {
      clearInterval(interval);
      showResults(status.results);
    }
  }, 2000);
};
```

### Pattern 4: Cached Data with Background Sync
**When to use:** Frequently accessed data that doesn't need real-time accuracy

```typescript
// ✅ Read from cache, n8n syncs in background
const DashboardStats = () => {
  // Always read from fast cache
  const stats = useSWR('/api/cache/dashboard-stats', {
    refreshInterval: 60000 // Poll every minute
  });
  
  return (
    <div>
      <Stat label="Total Revenue" value={stats.revenue} />
      <Stat label="Jobs Today" value={stats.jobsToday} />
      <LastUpdated time={stats.lastSync} />
    </div>
  );
};

// n8n workflow runs every 5 minutes to update cache
```

### Pattern 5: Webhook-Driven Updates
**When to use:** Real-time updates from background processes

```typescript
// ✅ UI subscribes to updates
useEffect(() => {
  const ws = new WebSocket(WS_URL);
  
  ws.on('workflow-update', (data) => {
    switch(data.type) {
      case 'job-completed':
        updateJobStatus(data.jobId, 'completed');
        showNotification(`Job ${data.jobNumber} completed!`);
        break;
      
      case 'payment-received':
        updateInvoiceStatus(data.invoiceId, 'paid');
        playSuccessSound();
        break;
    }
  });
  
  return () => ws.close();
}, []);
```

## Component Examples

### Example 1: Smart Contact Form
```typescript
const ContactForm = () => {
  const [status, setStatus] = useState('idle');
  
  const handleSubmit = async (data: ContactData) => {
    setStatus('processing');
    
    // Light UI just validates and sends to n8n
    const validation = validateContactData(data);
    if (!validation.valid) {
      showErrors(validation.errors);
      return;
    }
    
    // Let n8n handle the complex flow
    const result = await api.post('/n8n/webhook/create-contact', {
      ...data,
      source: 'web-form',
      timestamp: Date.now()
    });
    
    if (result.queued) {
      setStatus('queued');
      showMessage('Contact is being created...');
      
      // Optional: Poll for completion
      pollForCompletion(result.queueId);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Simple form fields */}
      <button disabled={status === 'processing'}>
        {status === 'processing' ? 'Creating...' : 'Create Contact'}
      </button>
    </form>
  );
};
```

### Example 2: Job Completion Flow
```typescript
const JobCompletionButton = ({ job }) => {
  const [status, setStatus] = useState('pending');
  
  const completeJob = async () => {
    // 1. Quick validation
    if (!job.photos || job.photos.length === 0) {
      showError('Please add photos before completing');
      return;
    }
    
    // 2. Update UI optimistically
    setStatus('completing');
    updateJobUI(job.id, { status: 'completing' });
    
    // 3. Trigger n8n workflow
    try {
      await api.post('/n8n/webhook/complete-job', {
        jobId: job.id,
        completedBy: currentUser.id,
        photos: job.photos,
        notes: job.notes,
        signature: job.signature
      });
      
      setStatus('completed');
      showSuccess('Job completed! Invoice will be generated shortly.');
      
    } catch (error) {
      // Rollback on failure
      setStatus('pending');
      updateJobUI(job.id, { status: 'in-progress' });
      showError('Failed to complete job. Please try again.');
    }
  };
  
  return (
    <button 
      onClick={completeJob}
      disabled={status !== 'pending'}
      className={getButtonClass(status)}
    >
      {getButtonText(status)}
    </button>
  );
};
```

### Example 3: Smart Scheduling Component
```typescript
const ScheduleAppointment = ({ customer }) => {
  const [slots, setSlots] = useState([]);
  const [booking, setBooking] = useState(false);
  
  // Fetch available slots (cached data)
  useEffect(() => {
    api.get('/api/cache/available-slots').then(setSlots);
  }, []);
  
  const bookSlot = async (slot) => {
    setBooking(true);
    
    // Let n8n handle complex scheduling logic
    const result = await api.post('/n8n/webhook/book-appointment', {
      customerId: customer.id,
      slotId: slot.id,
      serviceType: customer.serviceType,
      location: customer.address,
      preferences: customer.preferences
    });
    
    if (result.success) {
      showSuccess('Appointment booked! Confirmation sent.');
      router.push(`/appointments/${result.appointmentId}`);
    } else {
      showError(result.message || 'Booking failed');
    }
    
    setBooking(false);
  };
  
  return (
    <div>
      <h3>Available Slots</h3>
      {slots.map(slot => (
        <SlotButton 
          key={slot.id}
          slot={slot}
          onClick={() => bookSlot(slot)}
          disabled={booking}
        />
      ))}
    </div>
  );
};
```

## State Management Patterns

### 1. Workflow Status Store
```typescript
// Simple store for tracking background operations
const useWorkflowStore = create((set, get) => ({
  workflows: {},
  
  trackWorkflow: (id, type, metadata) => {
    set(state => ({
      workflows: {
        ...state.workflows,
        [id]: { type, status: 'running', metadata, startTime: Date.now() }
      }
    }));
  },
  
  updateWorkflow: (id, updates) => {
    set(state => ({
      workflows: {
        ...state.workflows,
        [id]: { ...state.workflows[id], ...updates }
      }
    }));
  },
  
  getActiveWorkflows: () => {
    return Object.values(get().workflows).filter(w => w.status === 'running');
  }
}));
```

### 2. Cache Management
```typescript
// SWR configuration for cached data
const swrConfig = {
  fetcher: (url) => api.get(url),
  revalidateOnFocus: false,
  revalidateIfStale: true,
  dedupingInterval: 10000,
  
  // Use cache while revalidating
  revalidateOnMount: true,
  
  // Error retry with backoff
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  
  // Show stale data while fetching
  keepPreviousData: true
};

// Usage
const { data: contacts, error, isLoading } = useSWR(
  '/api/cache/contacts',
  swrConfig
);
```

### 3. Optimistic Update Helper
```typescript
const useOptimisticUpdate = () => {
  const queryClient = useQueryClient();
  
  return {
    update: async (key, updater, asyncAction) => {
      // 1. Snapshot current data
      const previousData = queryClient.getQueryData(key);
      
      // 2. Optimistically update
      queryClient.setQueryData(key, updater);
      
      try {
        // 3. Perform async action
        await asyncAction();
      } catch (error) {
        // 4. Rollback on failure
        queryClient.setQueryData(key, previousData);
        throw error;
      }
    }
  };
};
```

## Error Handling Patterns

### 1. Graceful Degradation
```typescript
const SmartDashboard = () => {
  const { data, error } = useSWR('/api/cache/dashboard');
  
  // If cache fails, show limited UI with direct API calls
  if (error) {
    return <BasicDashboard />;
  }
  
  // Show full dashboard with cached data
  return <FullDashboard data={data} />;
};
```

### 2. User-Friendly Error Messages
```typescript
const errorMessages = {
  'workflow-timeout': 'This is taking longer than usual. We\'ll notify you when complete.',
  'api-limit': 'System is busy. Your request is queued and will process shortly.',
  'sync-conflict': 'Someone else updated this. Please refresh and try again.',
  'network-error': 'Connection issue. Changes saved locally and will sync when online.'
};

const handleWorkflowError = (error) => {
  const message = errorMessages[error.code] || 'Something went wrong. Please try again.';
  showNotification({ type: 'error', message, duration: 5000 });
  
  // Log for debugging but don't expose technical details
  console.error('Workflow error:', error);
};
```

## Performance Tips

1. **Debounce User Actions**
```typescript
const debouncedSearch = useMemo(
  () => debounce((term) => {
    api.get(`/api/search?q=${term}`).then(setResults);
  }, 300),
  []
);
```

2. **Lazy Load Heavy Components**
```typescript
const ReportGenerator = lazy(() => import('./ReportGenerator'));

// Only load when needed
{showReports && (
  <Suspense fallback={<Spinner />}>
    <ReportGenerator />
  </Suspense>
)}
```

3. **Virtual Lists for Large Data**
```typescript
const ContactList = ({ contacts }) => {
  const rowVirtualizer = useVirtual({
    count: contacts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });
  
  // Only render visible items
  return (
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
      {rowVirtualizer.virtualItems.map(virtualRow => (
        <ContactRow key={virtualRow.index} contact={contacts[virtualRow.index]} />
      ))}
    </div>
  );
};
```

## Summary

The key to a light UI is:
1. **Never wait** for complex operations
2. **Always give feedback** about background processes
3. **Cache aggressively** for read operations
4. **Update optimistically** for better UX
5. **Degrade gracefully** when systems are slow
6. **Let n8n handle** all multi-step operations

Remember: The UI is just the remote control. n8n is the engine.