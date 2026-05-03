'use client'
import { useState } from 'react'
import { Bold, Italic, List, Heading2, Link as LinkIcon } from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter content...',
  maxLength = 5000
}: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(false)

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea[data-editor]') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = value.substring(start, end)
    const newValue = value.substring(0, start) + before + selected + after + value.substring(end)

    onChange(newValue)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length)
    }, 0)
  }

  const formatMarkdown = (type: string) => {
    switch (type) {
      case 'bold':
        insertMarkdown('**', '**')
        break
      case 'italic':
        insertMarkdown('*', '*')
        break
      case 'heading':
        insertMarkdown('## ', '')
        break
      case 'list':
        insertMarkdown('- ', '')
        break
      case 'link':
        insertMarkdown('[', '](url)')
        break
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => formatMarkdown('bold')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatMarkdown('italic')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatMarkdown('heading')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="Heading"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatMarkdown('list')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="List"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => formatMarkdown('link')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {showPreview ? (
        <div className="input p-4 min-h-[200px] bg-gray-50 dark:bg-gray-900 rounded-lg whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {value || placeholder}
        </div>
      ) : (
        <textarea
          data-editor
          className="input resize-none"
          rows={6}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          maxLength={maxLength}
        />
      )}

      <p className="text-xs text-gray-400">{value.length}/{maxLength}</p>
    </div>
  )
}
