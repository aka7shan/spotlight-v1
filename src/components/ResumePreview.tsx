import { motion, AnimatePresence } from 'framer-motion';

interface ResumePreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESUME_PATH = '/AkarshanSharma_Resume.pdf';

export default function ResumePreview({ isOpen, onClose }: ResumePreviewProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

          <motion.div
            className="relative w-full max-w-sm rounded-2xl border border-white/10 overflow-hidden"
            style={{ background: 'rgba(15,15,15,0.98)' }}
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-white text-lg font-semibold mb-1">Resume</h3>
              <p className="text-white/40 text-sm mb-6">Akarshan Sharma</p>

              <a
                href={RESUME_PATH}
                download
                className="inline-block w-full px-6 py-3 text-sm font-semibold text-black bg-white rounded-xl hover:bg-white/90 transition-colors mb-3"
              >
                Download PDF
              </a>

              <a
                href={RESUME_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full px-6 py-3 text-sm font-medium text-white/60 border border-white/10 rounded-xl hover:border-white/25 hover:text-white/80 transition-colors mb-3"
              >
                Open in New Tab
              </a>

              <button
                onClick={onClose}
                className="text-white/30 hover:text-white/60 text-sm transition-colors mt-2 cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
