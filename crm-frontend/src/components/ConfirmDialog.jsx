import Modal from './Modal';

/**
 * ConfirmDialog — hộp thoại xác nhận xóa / hành động nguy hiểm
 * Props: isOpen, onClose, onConfirm, title, message, confirmLabel, variant ('danger'|'warning')
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này không?',
  confirmLabel = 'Xác nhận',
  variant = 'danger',
}) {
  const confirmClass = variant === 'danger'
    ? 'bg-[#ba1a1a] text-white hover:bg-[#a51616]'
    : 'bg-[#C89A3D] text-white hover:bg-[#b08735]';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="p-6">
        <p className="text-sm text-[#4f4637] leading-relaxed mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#4f4637] border border-[#E3D7C8] hover:bg-[#f6ece2] transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
