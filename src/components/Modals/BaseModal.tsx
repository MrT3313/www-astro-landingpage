import React from 'react'
import cx from 'classnames'
import { IoClose } from 'react-icons/io5'

type BaseModalProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  maxWidth?: string
}

export const BaseModal = ({ isOpen, onClose, children, title, maxWidth = 'max-w-2xl' }: BaseModalProps) => {
  if (!isOpen) return null

  return (
    <div
      className={cx(
        'fixed inset-0 z-[100]',
        'bg-black/50',
        'flex items-center justify-center',
        'pointer-events-auto',
        'transition-all duration-300 ease-in-out',
        {
          'opacity-100': isOpen,
          'opacity-0 pointer-events-none': !isOpen
        }
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className={cx(
          'bg-white rounded-lg shadow-xl',
          maxWidth,
          'w-full mx-10',
          'max-h-[90vh]',
          'relative',
          'overflow-hidden',
          'flex flex-col',
          'transition-all duration-300 ease-in-out',
          {
            'opacity-100 scale-100': isOpen,
            'opacity-0 scale-95': !isOpen
          }
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={cx(
            'absolute top-4 right-4',
            'p-2 rounded-full',
            'hover:bg-gray-100',
            'transition-colors duration-150',
            'z-10'
          )}
          aria-label="Close modal"
        >
          <IoClose size={24} />
        </button>

        {title && (
          <div className="px-6 pt-6 pb-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
        )}

        <div className={cx('p-6 overflow-y-auto flex-1', { 'pt-6': !title })}>
          {children}
        </div>
      </div>
    </div>
  )
}
