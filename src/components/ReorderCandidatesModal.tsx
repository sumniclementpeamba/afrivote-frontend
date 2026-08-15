'use client';
import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { X, GripVertical, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Candidate {
  id: string;
  name: string;
  order: number;
  photo?: string;
}

interface ReorderCandidatesModalProps {
  positionId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReorderCandidatesModal({
  positionId,
  isOpen,
  onClose,
}: ReorderCandidatesModalProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const fetchCandidates = async () => {
      try {
        const res = await api.get(`/api/candidates/?position_id=${positionId}`);
        const list = (res.data.results || res.data).sort((a: any, b: any) => a.order - b.order);
        setCandidates(list);
      } catch (err) {
        toast.error('Failed to load candidates');
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, [positionId, isOpen]);

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const items = Array.from(candidates);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    setCandidates(items);

    try {
      const updates = items.map((c, idx) =>
        api.patch(`/api/candidates/${c.id}/`, { order: idx })
      );
      await Promise.all(updates);
      toast.success('Order updated successfully');
    } catch (err) {
      toast.error('Failed to save order');
      const res = await api.get(`/api/candidates/?position_id=${positionId}`);
      const list = (res.data.results || res.data).sort((a: any, b: any) => a.order - b.order);
      setCandidates(list);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md overflow-hidden p-6"
          >
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reorder Candidates</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Drag items to reorder priority on ballot</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span className="text-xs font-medium">Loading candidates...</span>
              </div>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="candidates">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
                      {candidates.map((candidate, index) => (
                        <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center gap-3 p-3 rounded-2xl border bg-white dark:bg-slate-800/80 transition-all ${snapshot.isDragging
                                  ? 'shadow-xl ring-2 ring-indigo-500 border-transparent z-10'
                                  : 'border-slate-100 dark:border-slate-700/60 hover:border-indigo-100'
                                }`}
                            >
                              <div {...provided.dragHandleProps} className="p-1 cursor-grab active:cursor-grabbing hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <GripVertical className="w-4 h-4 text-slate-400" />
                              </div>
                              {candidate.photo ? (
                                <img
                                  src={candidate.photo}
                                  alt={candidate.name}
                                  className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-50 dark:ring-indigo-950"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                                  {candidate.name.charAt(0)}
                                </div>
                              )}
                              <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {candidate.name}
                              </span>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}