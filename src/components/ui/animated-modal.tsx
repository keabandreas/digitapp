"use client"

import React, { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { IconX } from '@tabler/icons-react'

interface AnimatedModalProps {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  title: string
  children: React.ReactNode
  triggerText?: string
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({ 
  isOpen, 
  onOpen,
  onClose, 
  title, 
  children,
  triggerText = "Open Modal"
}) => {
  const [isClosing, setIsClosing] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen])

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300)
  }

  return (
    <>
      <button
        onClick={onOpen}
        className="bg-black dark:bg-white dark:text-black text-white flex justify-center items-center relative overflow-hidden group/modal-btn px-6 py-3 rounded-md w-64 h-12 text-base font-medium"
      >
        <span className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover/modal-btn:translate-x-full">
          {triggerText}
        </span>
        <span className="absolute inset-0 flex items-center justify-center -translate-x-full group-hover/modal-btn:translate-x-0 transition-transform duration-500 text-2xl">
          ✈️
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">{title}</h2>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <IconX size={20} />
                </Button>
              </div>
              <div className="p-4">
                {children}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
