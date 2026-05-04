import Swal from 'sweetalert2';

const BlinkSwal = Swal.mixin({
  customClass: {
    popup: 'panel',
    confirmButton: 'primary-button',
    cancelButton: 'secondary-button'
  },
  buttonsStyling: false,
  background: 'var(--bg-modal)',
  color: 'var(--text-primary)',
  confirmButtonText: 'Confirm',
  cancelButtonText: 'Cancel',
  showCancelButton: true,
  reverseButtons: true
});

// Helper for quick success/error alerts
export const showAlert = (title, text, icon = 'info') => {
  return BlinkSwal.fire({
    title,
    text,
    icon,
    showCancelButton: false
  });
};

// Helper for confirmations
export const showConfirm = (title, text, confirmText = 'Confirm') => {
  return BlinkSwal.fire({
    title,
    text,
    confirmButtonText: confirmText
  });
};

// Helper for themed toasts
export const showToast = (title, icon = 'success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: 'var(--bg-panel)',
    color: 'var(--text-primary)',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  Toast.fire({
    icon,
    title
  });
};

export default BlinkSwal;
