import React, { useState, useEffect, useCallback } from 'react';
import AmbientParticles from './components/AmbientParticles';
import RomanticHeader from './components/RomanticHeader';
import Timeline from './components/Timeline';
import RomanticFooter from './components/RomanticFooter';
import LightboxModal from './components/LightboxModal';
import AdminPinModal from './components/AdminPinModal';
import AdminDashboard from './components/AdminDashboard';
import { apiService } from './services/apiService';
import { storageService } from './services/storageService';
import { firebaseService } from './services/firebaseService';
import { Database, Sparkles, Cloud } from 'lucide-react';

export default function App() {
  const [couple, setCouple] = useState(() => storageService.getCoupleData());
  const [memories, setMemories] = useState(() => storageService.getMemories());
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load from Cloud Sync or LocalStorage
  const refreshData = useCallback(async () => {
    try {
      const [fetchedCouple, fetchedMemories] = await Promise.all([
        apiService.getCoupleData(),
        apiService.getMemories(),
      ]);
      if (fetchedCouple) setCouple(fetchedCouple);
      if (fetchedMemories) setMemories(fetchedMemories);
    } catch (err) {
      console.warn('Error loading initial data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real-time synchronization across all devices via Firebase if configured
  useEffect(() => {
    if (firebaseService.isConfigured()) {
      const unsub = firebaseService.subscribeRealtime(
        (liveCouple) => {
          if (liveCouple) setCouple((prev) => ({ ...prev, ...liveCouple }));
        },
        (liveMemories) => {
          if (Array.isArray(liveMemories)) {
            setMemories(liveMemories);
          }
        }
      );
      return () => unsub();
    }
  }, []);

  // Check if user navigated to /admin or #admin
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('/admin') || hash.includes('#admin')) {
      setIsPinModalOpen(true);
    }
  }, []);

  // Sync memory like
  const handleLikeMemory = useCallback(async (id) => {
    // Optimistic UI update
    setMemories((prev) =>
      prev.map((m) => (String(m.id) === String(id) ? { ...m, likes: (m.likes || 0) + 1 } : m))
    );
    await apiService.toggleLike(id);
  }, []);

  // Add memory with instant optimistic display
  const handleAddMemory = useCallback(async (newMemory, rawFile = null) => {
    const tempId = newMemory.id || `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const optimisticItem = {
      ...newMemory,
      id: tempId,
      media: newMemory.media || (newMemory.image ? [{ type: 'image', url: newMemory.image }] : []),
      image: newMemory.image || (newMemory.media?.[0]?.url || ''),
      likes: newMemory.likes || 0,
      isFavorite: !!newMemory.isFavorite,
    };

    // 1. Immediately update UI state so it appears instantly on the timeline
    setMemories((prev) => [optimisticItem, ...prev.filter((m) => String(m.id) !== String(tempId))]);

    // 2. Persist to API and replace with confirmed server record
    try {
      const created = await apiService.addMemory(newMemory, rawFile);
      if (created) {
        setMemories((prev) =>
          prev.map((item) => (String(item.id) === String(tempId) ? created : item))
        );
      }
    } catch (err) {
      console.error('Error saving memory to backend:', err);
    }
  }, []);

  // Update memory
  const handleUpdateMemory = useCallback(async (id, updatedFields, rawFile = null) => {
    const updated = await apiService.updateMemory(id, updatedFields, rawFile);
    setMemories((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, ...updated } : item))
    );
  }, []);

  // Delete memory
  const handleDeleteMemory = useCallback(async (id) => {
    // Immediate optimistic update
    setMemories((prev) => prev.filter((item) => String(item.id) !== String(id)));
    try {
      await apiService.deleteMemory(id);
    } catch (err) {
      console.error('Error deleting memory:', err);
    }
  }, []);

  // Save couple profile settings
  const handleSaveCoupleData = useCallback(async (data) => {
    const saved = await apiService.saveCoupleData(data);
    setCouple(saved);
  }, []);

  // Reset to default starter memories
  const handleResetDefaults = useCallback(async () => {
    const defaults = await apiService.resetToDefaults();
    setCouple(defaults.couple);
    setMemories(defaults.memories);
  }, []);

  // Import backup
  const handleImportBackup = useCallback(async (jsonStr) => {
    const res = await apiService.importBackup(jsonStr);
    if (res.success) {
      await refreshData();
    }
    return res;
  }, [refreshData]);

  // Export backup
  const handleExportBackup = useCallback(async () => {
    return await apiService.exportBackup();
  }, []);

  // Verify PIN
  const handleVerifyPin = useCallback(async (pin) => {
    return await apiService.verifyPin(pin);
  }, []);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  // Lightbox handlers
  const handleOpenLightbox = (memory, items = null, initialIndex = 0) => {
    const index = memories.findIndex((m) => m.id === memory.id);
    setActiveLightboxIndex(index >= 0 ? index : 0);
    setActiveMediaIndex(initialIndex || 0);
  };

  const handleCloseLightbox = () => {
    setActiveLightboxIndex(null);
    setActiveMediaIndex(0);
  };

  const handleLightboxNavigate = (direction) => {
    if (activeLightboxIndex === null || memories.length === 0) return;
    setActiveMediaIndex(0);
    if (direction === 'prev') {
      setActiveLightboxIndex((prev) =>
        prev > 0 ? prev - 1 : memories.length - 1
      );
    } else {
      setActiveLightboxIndex((prev) =>
        prev < memories.length - 1 ? prev + 1 : 0
      );
    }
  };

  const activeLightboxMemory =
    activeLightboxIndex !== null ? memories[activeLightboxIndex] : null;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#281C22] relative selection:bg-[#F8E9EB] selection:text-[#682535]" dir="rtl">
      {/* Background Ambience & Particles */}
      <AmbientParticles />

      {/* Main Public Gift Content */}
      <div className="relative z-10">
        {/* Subtle Connection Status Badge */}
        <div className="pt-3 px-4 flex justify-center">
          <div
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-medium tracking-wide border transition-all bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs"
            title="متصل بالسحابة 24/7 - جميع التعديلات متزامنة ومحفوظة أونلاين وتفتح من أي موبايل يلمس بطاقة NFC"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Cloud className="w-3.5 h-3.5 text-emerald-600" />
            <span>متصل سحابياً 24/7 (مزامنة فورية للـ NFC)</span>
          </div>
        </div>

        <RomanticHeader
          couple={couple}
          onOpenAdmin={() => setIsPinModalOpen(true)}
        />

        <Timeline
          memories={memories}
          onOpenLightbox={handleOpenLightbox}
          onLikeMemory={handleLikeMemory}
          onOpenAdmin={() => setIsPinModalOpen(true)}
        />

        <RomanticFooter
          couple={couple}
          onOpenAdmin={() => setIsPinModalOpen(true)}
        />
      </div>

      {/* Lightbox Photo Preview */}
      <LightboxModal
        memory={activeLightboxMemory}
        memories={memories}
        initialMediaIndex={activeMediaIndex}
        onClose={handleCloseLightbox}
        onNavigate={handleLightboxNavigate}
      />

      {/* Secret PIN Modal */}
      <AdminPinModal
        isOpen={isPinModalOpen}
        correctPin={couple?.pin || '1314'}
        onVerifyCustom={handleVerifyPin}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => {
          setIsPinModalOpen(false);
          setIsAdminDashboardOpen(true);
        }}
      />

      {/* Full Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        couple={couple}
        memories={memories}
        onClose={() => setIsAdminDashboardOpen(false)}
        onAddMemory={handleAddMemory}
        onUpdateMemory={handleUpdateMemory}
        onDeleteMemory={handleDeleteMemory}
        onSaveCoupleData={handleSaveCoupleData}
        onResetDefaults={handleResetDefaults}
        onImportBackup={handleImportBackup}
        onExportBackup={handleExportBackup}
      />
    </div>
  );
}
