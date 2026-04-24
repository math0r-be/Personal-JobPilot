'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';

const STATUS_ORDER = ['new', 'applied', 'interview', 'offer', 'rejected', 'archived'] as const;
type Status = (typeof STATUS_ORDER)[number];

const STATUS_META: Record<Status, { label: string; color: string }> = {
  new:       { label: 'NOUVELLE',   color: 'oklch(0.48 0.005 60)' },
  applied:   { label: 'POSTULÉ',    color: 'oklch(0.70 0.15 75)' },
  interview: { label: 'ENTRETIEN',  color: 'oklch(0.62 0.14 145)' },
  offer:     { label: 'OFFRE',      color: 'oklch(0.65 0.18 41)' },
  rejected:  { label: 'REJETÉ',     color: 'oklch(0.58 0.18 20)' },
  archived:  { label: 'ARCHIVÉ',    color: 'oklch(0.35 0.005 60)' },
};

export type KanbanJob = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  status: string;
  updatedAt: string;
  followUpDate?: string | null;
  _count: { cvs: number; emails: number };
};

const STALE_MS = 7 * 24 * 60 * 60 * 1000;

const menuBtnStyle: React.CSSProperties = {
  width: '100%', textAlign: 'left', background: 'none', border: 'none',
  padding: '6px 10px', borderRadius: 5, fontSize: 12, color: 'var(--text)',
  cursor: 'pointer',
};

function DraggableCard({
  job,
  menuOpenId,
  setMenuOpenId,
  onStatusChange,
  onDelete,
}: {
  job: KanbanJob;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: job.id });
  const isMenuOpen = menuOpenId === job.id;
  const isStale = Date.now() - new Date(job.updatedAt).getTime() > STALE_MS;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '12px 14px',
        cursor: isDragging ? 'grabbing' : 'pointer',
        opacity: isDragging ? 0.3 : 1,
        position: 'relative',
        userSelect: 'none',
        transition: 'border-color 140ms, box-shadow 140ms',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, marginBottom: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {job.title || 'Sans titre'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{job.company || 'Entreprise inconnue'}</div>
          {job.location && (
            <div style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 1 }}>{job.location}</div>
          )}
        </div>

        {/* 3-dot menu */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={e => { e.stopPropagation(); setMenuOpenId(isMenuOpen ? null : job.id); }}
            style={{
              width: 22, height: 22, borderRadius: 4, border: 'none',
              background: isMenuOpen ? 'var(--accent-dim)' : 'transparent',
              color: isMenuOpen ? 'var(--accent)' : 'var(--text-mute)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, letterSpacing: 1.5, lineHeight: 1,
              transition: 'all 100ms',
            }}
            title="Actions"
          >
            ···
          </button>

          {isMenuOpen && (
            <div style={{
              position: 'absolute', top: 26, right: 0, zIndex: 200,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: 4, minWidth: 170,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}>
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); setMenuOpenId(null); router.push(`/dashboard/jobs/${job.id}`); }}
                style={menuBtnStyle}
              >
                Ouvrir
              </button>
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <div style={{ padding: '2px 10px', fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-mute)' }}>
                Statut
              </div>
              {STATUS_ORDER.filter(s => s !== job.status).map(s => (
                <button
                  key={s}
                  onPointerDown={e => e.stopPropagation()}
                  onClick={e => { e.stopPropagation(); setMenuOpenId(null); onStatusChange(job.id, s); }}
                  style={menuBtnStyle}
                >
                  → {STATUS_META[s].label}
                </button>
              ))}
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <button
                onPointerDown={e => e.stopPropagation()}
                onClick={e => { e.stopPropagation(); setMenuOpenId(null); onDelete(job.id); }}
                style={{ ...menuBtnStyle, color: 'var(--danger)' }}
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {isStale && (
          <span style={{
            fontSize: 9, padding: '1px 5px', borderRadius: 3,
            background: 'rgba(128,128,128,0.15)', color: 'var(--text-mute)',
            fontFamily: 'var(--font-mono)', letterSpacing: 0.5,
          }}>
            7j+
          </span>
        )}
        {job.followUpDate && (() => {
          const diff = new Date(job.followUpDate).getTime() - Date.now();
          const daysLeft = Math.ceil(diff / 86_400_000);
          if (daysLeft <= 2) {
            return (
              <span style={{
                fontSize: 9, padding: '1px 5px', borderRadius: 3,
                background: 'var(--warn-dim)', color: 'var(--warn)',
                fontFamily: 'var(--font-mono)', letterSpacing: 0.5,
                border: '1px solid var(--warn)',
              }}>
                {daysLeft <= 0 ? 'Relance!' : `Relance J-${daysLeft}`}
              </span>
            );
          }
          return null;
        })()}
        {(job.status === 'applied' || job.status === 'interview') && (
          <a
            href={`/dashboard/emails/new?jobId=${job.id}`}
            onPointerDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            style={{
              fontSize: 9, padding: '1px 6px', borderRadius: 3,
              background: 'var(--accent-dim)', color: 'var(--accent)',
              fontFamily: 'var(--font-mono)', letterSpacing: 0.5,
              textDecoration: 'none',
            }}
          >
            ✉ email
          </a>
        )}
      </div>

      {/* Counts */}
      {(job._count.cvs > 0 || job._count.emails > 0) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
          {job._count.cvs > 0 && <span>{job._count.cvs} CV</span>}
          {job._count.emails > 0 && <span>{job._count.emails} email</span>}
        </div>
      )}
    </div>
  );
}

function CardPreview({ job }: { job: KanbanJob | undefined }) {
  if (!job) return null;
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--accent)',
      borderRadius: 8, padding: '12px 14px', width: 200,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {job.title || 'Sans titre'}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{job.company}</div>
    </div>
  );
}

function DroppableColumn({
  status, jobs, menuOpenId, setMenuOpenId, onStatusChange, onDelete,
}: {
  status: string;
  jobs: KanbanJob[];
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const meta = STATUS_META[status as Status];
  const { isOver, setNodeRef } = useDroppable({ id: status });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{ paddingBottom: 12, marginBottom: 10, borderBottom: `2px solid ${meta.color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: 1.8, textTransform: 'uppercase', color: meta.color, fontWeight: 600,
          }}>
            {meta.label}
          </div>
          <div style={{
            width: 20, height: 20, borderRadius: 10,
            background: `${meta.color}22`, border: `1px solid ${meta.color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 10, color: meta.color, fontWeight: 700,
          }}>
            {jobs.length}
          </div>
        </div>
      </div>

      <div
        ref={setNodeRef}
        style={{
          flex: 1, display: 'flex', flexDirection: 'column', gap: 8,
          minHeight: 80, borderRadius: 6, padding: 4,
          background: isOver ? `${meta.color}18` : 'transparent',
          transition: 'background 120ms',
        }}
      >
        {jobs.map(job => (
          <DraggableCard
            key={job.id}
            job={job}
            menuOpenId={menuOpenId}
            setMenuOpenId={setMenuOpenId}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}
        {jobs.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            flex: 1, gap: 6, fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--text-mute)', opacity: 0.5, padding: '20px 0',
          }}>
            <span>Aucun job ici</span>
            {status === 'new' && (
              <a href="/dashboard/jobs/new" onClick={e => e.stopPropagation()} style={{
                fontSize: 9, color: 'var(--accent)', textDecoration: 'none', cursor: 'pointer',
              }}>
                + Ajouter
              </a>
            )}
          </div>
        ) : null}
      </div>

      {jobs.length > 0 && (
        <div style={{
          marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)',
          display: 'flex', justifyContent: 'flex-end',
          fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-mute)', letterSpacing: 0.5,
        }}>
          {jobs.length} opp{jobs.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

export default function JobsKanban({ initialJobs }: { initialJobs: KanbanJob[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const prevRef = useRef(jobs);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string);
    setMenuOpenId(null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const jobId = active.id as string;
    const newStatus = over.id as string;
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.status === newStatus || !STATUS_ORDER.includes(newStatus as Status)) return;

    prevRef.current = jobs;
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    fetch(`/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => setJobs(prevRef.current));
  };

  const handleStatusChange = (jobId: string, newStatus: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.status === newStatus) return;
    prevRef.current = jobs;
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    fetch(`/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    }).catch(() => setJobs(prevRef.current));
  };

  const handleDelete = (jobId: string) => {
    if (!confirm('Supprimer cette candidature ?')) return;
    prevRef.current = jobs;
    setJobs(prev => prev.filter(j => j.id !== jobId));
    fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
      .then(r => { if (!r.ok) setJobs(prevRef.current); })
      .catch(() => setJobs(prevRef.current));
  };

  return (
    <>
      {menuOpenId && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 99 }}
          onClick={() => setMenuOpenId(null)}
        />
      )}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: 14,
          alignContent: 'start',
        }}>
          {STATUS_ORDER.map(status => (
            <DroppableColumn
              key={status}
              status={status}
              jobs={jobs.filter(j => j.status === status)}
              menuOpenId={menuOpenId}
              setMenuOpenId={setMenuOpenId}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
        <DragOverlay>
          {activeId ? <CardPreview job={jobs.find(j => j.id === activeId)} /> : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}
