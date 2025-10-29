'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { TaskComment } from '@/domain/projects/types';
import { useProjectCommentsStore } from '@/stores/projectCommentsStore';
import { useProjectFilesStore } from '@/stores/projectFilesStore';
import { useUI } from '@/stores/ui';

const ENABLED_VALUES = ['1', 'true', 'yes', 'on'];
const FEATURE_ENABLED = (() => {
  if (typeof process === 'undefined') {
    return false;
  }
  const value = process.env.NEXT_PUBLIC_FEATURE_PROJECT_ATTACHMENTS ?? '';
  return ENABLED_VALUES.includes(value.toLowerCase());
})();

const TABS = [
  { id: 'comments', label: 'Комментарии' },
  { id: 'attachments', label: 'Вложения' },
  { id: 'versions', label: 'Версии' },
  { id: 'activity', label: 'Активность' }
] as const;

type TabId = (typeof TABS)[number]['id'];

type MentionSuggestion = {
  id: string;
  name: string;
  email: string;
  title?: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]+/g, (match) => {
    switch (match) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return match;
    }
  });
}

function highlightMentions(value: string): string {
  return value.replace(/@([\w.\-а-яА-Я]+)/g, '<span class="text-indigo-300">@$1</span>');
}

function renderMarkdown(value: string): string {
  const escaped = escapeHtml(value);
  const withCode = escaped.replace(/`([^`]+)`/g, '<code class="rounded bg-neutral-800 px-1 py-0.5">$1</code>');
  const withBold = withCode.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const withItalic = withBold.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const withMentions = highlightMentions(withItalic);
  return withMentions.replace(/\n/g, '<br />');
}

function formatSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} Б`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} КБ`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function CommentItem({ comment }: { comment: TaskComment }) {
  return (
    <article className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">
            {comment.author?.name ?? comment.authorId}
            <span className="ml-2 text-xs text-neutral-500">{new Date(comment.createdAt).toLocaleString('ru-RU')}</span>
          </p>
          <p className="text-xs text-neutral-500">{comment.author?.title ?? comment.author?.email ?? ''}</p>
        </div>
      </header>
      <div
        className="prose prose-invert mt-3 max-w-none text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(comment.body) }}
      />
      {comment.attachmentsFiles.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {comment.attachmentsFiles.map((file) => (
            <li key={file.id} className="flex items-center justify-between rounded-xl border border-neutral-800/60 bg-neutral-950/80 px-3 py-2 text-xs text-neutral-300">
              <span className="truncate text-neutral-200">{file.filename}</span>
              <span className="text-neutral-500">{formatSize(file.sizeBytes)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {comment.children && comment.children.length > 0 ? (
        <div className="mt-4 space-y-3 border-l border-neutral-800/70 pl-4">
          {comment.children.map((child) => (
            <CommentItem key={child.id} comment={child} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

export default function TaskDrawer() {
  const drawer = useUI((state) => state.drawer);
  const closeDrawer = useUI((state) => state.closeDrawer);
  const taskContext = useUI((state) => state.taskContext);
  const isOpen = drawer === 'task';
  const [activeTab, setActiveTab] = useState<TabId>('comments');
  const [body, setBody] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionRange, setMentionRange] = useState<{ start: number; end: number } | null>(null);
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [isSubmitting, setSubmitting] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const commentFileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingCommentFiles, setPendingCommentFiles] = useState<{ id: string; filename: string }[]>([]);

  const attachments = useProjectFilesStore((state) => state.attachments);
  const documents = useProjectFilesStore((state) => state.documents);
  const hydrateFiles = useProjectFilesStore((state) => state.hydrate);
  const uploadTaskAttachment = useProjectFilesStore((state) => state.uploadAttachment);
  const removeAttachment = useProjectFilesStore((state) => state.removeAttachment);
  const createDocument = useProjectFilesStore((state) => state.createDocument);
  const uploadDocumentVersion = useProjectFilesStore((state) => state.uploadDocumentVersion);
  const refreshAttachments = useProjectFilesStore((state) => state.refreshAttachments);

  const comments = useProjectCommentsStore((state) => state.comments);
  const hydrateComments = useProjectCommentsStore((state) => state.hydrate);
  const createComment = useProjectCommentsStore((state) => state.createComment);
  const searchMentionsAction = useProjectCommentsStore((state) => state.searchMentions);
  const mentionResults = useProjectCommentsStore((state) => state.mentions);

  useEffect(() => {
    if (!isOpen || !FEATURE_ENABLED) {
      return;
    }
    const context = taskContext ?? { projectId: 'proj-admin-onboarding', taskId: 'task-admin-brief' };
    void hydrateFiles(context.projectId);
    void hydrateComments(context.projectId, context.taskId);
  }, [isOpen, taskContext, hydrateFiles, hydrateComments]);

  useEffect(() => {
    if (!isOpen) {
      setBody('');
      setMentionQuery(null);
      setMentionRange(null);
      setSelectedMentions([]);
      setPendingCommentFiles([]);
      setActiveTab('comments');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!mentionQuery || !FEATURE_ENABLED) {
      return;
    }
    const timeout = setTimeout(() => {
      void searchMentionsAction(mentionQuery);
    }, 200);
    return () => clearTimeout(timeout);
  }, [mentionQuery, searchMentionsAction]);

  const taskAttachments = useMemo(() => {
    if (!taskContext) {
      return attachments.filter((item) => item.linkedEntity === 'task');
    }
    return attachments.filter(
      (item) => item.linkedEntity === 'task' && item.entityId === taskContext.taskId
    );
  }, [attachments, taskContext]);

  const mentionsSuggestions = useMemo<MentionSuggestion[]>(() => mentionResults, [mentionResults]);

  const handleBodyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    const selectionStart = event.target.selectionStart ?? value.length;
    setBody(value);
    const beforeCursor = value.slice(0, selectionStart);
    const match = beforeCursor.match(/@([\w.\-а-яА-Я]+)$/);
    if (match) {
      const [, query] = match;
      if (query) {
        setMentionQuery(query);
        setMentionRange({ start: selectionStart - query.length - 1, end: selectionStart });
      } else {
        setMentionQuery(null);
        setMentionRange(null);
      }
    } else {
      setMentionQuery(null);
      setMentionRange(null);
    }
  };

  const insertMention = (suggestion: MentionSuggestion) => {
    if (!mentionRange) {
      return;
    }
    const prefix = body.slice(0, mentionRange.start);
    const suffix = body.slice(mentionRange.end);
    const mentionText = `@${suggestion.name}`;
    const nextValue = `${prefix}${mentionText} ${suffix}`;
    setBody(nextValue);
    setSelectedMentions((prev) => (prev.includes(suggestion.id) ? prev : [...prev, suggestion.id]));
    setMentionQuery(null);
    setMentionRange(null);
  };

  const handleAddAttachment = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !FEATURE_ENABLED) {
      return;
    }
    const context = taskContext ?? { projectId: 'proj-admin-onboarding', taskId: 'task-admin-brief' };
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    await uploadTaskAttachment(file, { entityType: 'task', entityId: context.taskId });
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDropActive(false);
    if (!FEATURE_ENABLED) {
      return;
    }
    const file = event.dataTransfer.files?.[0];
    if (!file) {
      return;
    }
    const context = taskContext ?? { projectId: 'proj-admin-onboarding', taskId: 'task-admin-brief' };
    await uploadTaskAttachment(file, { entityType: 'task', entityId: context.taskId });
  };

  const handleCommentAttachment = () => {
    commentFileInputRef.current?.click();
  };

  const handleCommentAttachmentSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !FEATURE_ENABLED) {
      return;
    }
    const context = taskContext ?? { projectId: 'proj-admin-onboarding', taskId: 'task-admin-brief' };
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.set('file', file);
    formData.set('projectId', context.projectId);
    const response = await fetch('/api/files', {
      method: 'POST',
      body: formData
    });
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as { file?: { id: string; filename: string } };
    if (data.file?.id) {
      setPendingCommentFiles((prev) => [...prev, { id: data.file!.id, filename: data.file!.filename }]);
    }
  };

  const handleSubmitComment = async () => {
    if (!body.trim()) {
      return;
    }
    const context = taskContext ?? { projectId: 'proj-admin-onboarding', taskId: 'task-admin-brief' };
    setSubmitting(true);
    try {
      await createComment({
        body,
        parentId: null,
        mentions: selectedMentions,
        attachments: pendingCommentFiles.map((file) => file.id)
      });
      setBody('');
      setSelectedMentions([]);
      setPendingCommentFiles([]);
      await refreshAttachments();
    } finally {
      setSubmitting(false);
    }
  };

  const renderComments = () => (
    <div className="space-y-4">
      <div className="rounded-2xl border border-neutral-800/70 bg-neutral-950/70 p-4">
        <label className="text-sm font-semibold text-white">Новый комментарий</label>
        <textarea
          value={body}
          onChange={handleBodyChange}
          className="mt-3 min-h-[120px] w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none"
          placeholder="Используйте markdown и @упоминания"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCommentAttachment}
              className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-indigo-500/40 hover:text-white"
            >
              Прикрепить файл
            </button>
            {pendingCommentFiles.length > 0 ? (
              <span className="text-xs text-neutral-400">
                {pendingCommentFiles.map((item) => item.filename).join(', ')}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleSubmitComment}
            disabled={isSubmitting || !body.trim()}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-neutral-700"
          >
            Отправить
          </button>
        </div>
        {mentionQuery && mentionsSuggestions.length > 0 ? (
          <div className="relative mt-3">
            <div className="absolute z-20 w-full rounded-xl border border-neutral-800 bg-neutral-900/95 p-2 shadow-xl">
              <p className="px-2 text-xs uppercase tracking-[0.2em] text-neutral-500">Упоминания</p>
              <ul className="mt-2 space-y-1 text-sm">
                {mentionsSuggestions.map((suggestion) => (
                  <li key={suggestion.id}>
                    <button
                      type="button"
                      onClick={() => insertMention(suggestion)}
                      className="w-full rounded-lg px-2 py-1 text-left text-neutral-200 transition hover:bg-neutral-800"
                    >
                      <span className="font-medium">{suggestion.name}</span>
                      <span className="ml-2 text-xs text-neutral-500">{suggestion.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/70 p-6 text-sm text-neutral-400">
            Пока нет обсуждений — станьте первым, кто оставит комментарий.
          </p>
        ) : (
          comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
        )}
      </div>
    </div>
  );

  const renderAttachments = () => (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDropActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDropActive(false);
        }}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-8 text-center text-sm transition ${
          dropActive ? 'border-indigo-500 bg-indigo-500/10 text-indigo-200' : 'border-neutral-800 text-neutral-400'
        }`}
      >
        <p>Перетащите файл сюда или</p>
        <button
          type="button"
          onClick={handleAddAttachment}
          className="mt-3 rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-2 text-sm text-neutral-200 transition hover:border-indigo-500/50 hover:text-white"
        >
          Выберите на устройстве
        </button>
      </div>
      <ul className="mt-6 space-y-3">
        {taskAttachments.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/70 p-6 text-sm text-neutral-400">
            Для задачи ещё не загружены вложения.
          </li>
        ) : (
          taskAttachments.map((attachment) => (
            <li key={attachment.id} className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950/70 px-4 py-3 text-sm text-neutral-200">
              <div>
                <p className="font-medium">{attachment.file?.filename ?? attachment.fileId}</p>
                <p className="text-xs text-neutral-500">
                  {attachment.file ? formatSize(attachment.file.sizeBytes) : '—'} • Загружено {new Date(attachment.createdAt).toLocaleString('ru-RU')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {attachment.file?.storageUrl ? (
                  <a
                    href={attachment.file.storageUrl}
                    className="rounded-lg border border-neutral-800 px-3 py-1 text-xs text-neutral-300 transition hover:border-indigo-500/40 hover:text-white"
                  >
                    Скачать
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => removeAttachment(attachment.id)}
                  className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-200 transition hover:bg-red-500/20"
                >
                  Удалить
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );

  const renderVersions = () => (
    <div className="space-y-4">
      <button
        type="button"
        className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-2 text-sm text-neutral-200 transition hover:border-indigo-500/50 hover:text-white"
        onClick={async () => {
          const title = prompt('Название документа', 'Новый документ');
          if (!title) {
            return;
          }
          await createDocument({ title });
        }}
      >
        Создать документ
      </button>
      {documents.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/70 p-6 text-sm text-neutral-400">
          Документы ещё не созданы — добавьте первый, чтобы отслеживать версии.
        </p>
      ) : (
        <ul className="space-y-4">
          {documents.map((document) => (
            <li key={document.id} className="rounded-2xl border border-neutral-800 bg-neutral-950/80 p-4">
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">{document.title}</h3>
                  <p className="text-xs text-neutral-500">Обновлено {new Date(document.updatedAt).toLocaleString('ru-RU')}</p>
                </div>
                <label className="rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-xs text-neutral-200 transition hover:border-indigo-500/40 hover:text-white">
                  Загрузить версию
                  <input
                    type="file"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) {
                        return;
                      }
                      await uploadDocumentVersion(document.id, { file });
                    }}
                  />
                </label>
              </header>
              {document.versions.length === 0 ? (
                <p className="mt-3 text-xs text-neutral-500">Версии ещё не добавлены</p>
              ) : (
                <ul className="mt-3 space-y-2 text-xs text-neutral-300">
                  {document.versions.map((version) => (
                    <li key={version.id} className="flex items-center justify-between rounded-xl border border-neutral-800 px-3 py-2">
                      <span>
                        v{version.version} • {new Date(version.createdAt).toLocaleString('ru-RU')}
                        {version.notes ? <span className="ml-2 text-neutral-500">{version.notes}</span> : null}
                      </span>
                      {version.file?.storageUrl ? (
                        <a
                          href={version.file.storageUrl}
                          className="rounded-lg border border-neutral-800 px-2 py-1 text-xs text-neutral-200 transition hover:border-indigo-500/40 hover:text-white"
                        >
                          Скачать
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const renderActivity = () => (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6 text-sm text-neutral-400">
      Лента активности появится позже — пока фиксируем базовые действия по комментариям, версиям и вложениям.
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'attachments':
        return renderAttachments();
      case 'versions':
        return renderVersions();
      case 'activity':
        return renderActivity();
      case 'comments':
      default:
        return renderComments();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(next) => (!next ? closeDrawer() : undefined)}>
      <SheetContent className="flex h-full w-full max-w-[520px] flex-col bg-neutral-950/95 p-0 text-neutral-50 shadow-2xl" side="right">
        <SheetHeader className="border-b border-neutral-900/60 px-6 py-4">
          <SheetTitle>Детали задачи</SheetTitle>
          <p className="text-xs text-neutral-400">
            {FEATURE_ENABLED
              ? 'Управляйте обсуждениями, вложениями и версиями документов внутри задачи.'
              : 'Для активации вложений включите флаг NEXT_PUBLIC_FEATURE_PROJECT_ATTACHMENTS.'}
          </p>
        </SheetHeader>
        {!FEATURE_ENABLED ? (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-neutral-400">
            Новые возможности вложений будут доступны после включения флага в окружении.
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <nav className="sticky top-0 z-10 border-b border-neutral-900/60 bg-neutral-950/95 px-6">
              <ul className="flex gap-2 py-4 text-sm">
                {TABS.map((tab) => (
                  <li key={tab.id}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`rounded-full px-4 py-2 transition ${
                        activeTab === tab.id
                          ? 'bg-indigo-500/20 text-indigo-200'
                          : 'border border-transparent text-neutral-400 hover:border-indigo-500/40 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {renderContent()}
            </div>
          </div>
        )}
        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelection} />
        <input ref={commentFileInputRef} type="file" className="hidden" onChange={handleCommentAttachmentSelection} />
      </SheetContent>
    </Sheet>
  );
}

