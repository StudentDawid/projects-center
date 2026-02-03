<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="handleCancel">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">Usuń kartę</h2>
        <button class="modal-close" @click="handleCancel">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="modal-content">
        <div class="modal-icon">
          <span class="material-symbols-outlined">warning</span>
        </div>
        <p class="modal-message">
          Czy na pewno chcesz usunąć kartę <strong>"{{ cardName }}"</strong>?
        </p>
        <p class="modal-warning">
          Ta operacja jest nieodwracalna.
        </p>
      </div>

      <div class="modal-footer">
        <button class="modal-btn modal-btn-cancel" @click="handleCancel">
          Anuluj
        </button>
        <button class="modal-btn modal-btn-delete" @click="handleConfirm">
          Usuń
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    cardName: string;
  }>(),
  {
    isOpen: false,
    cardName: '',
  }
);

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();

function handleConfirm(): void {
  emit('confirm');
}

function handleCancel(): void {
  emit('cancel');
}

// Close on Escape key
function handleEscape(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.isOpen) {
    handleCancel();
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .material-symbols-outlined {
    font-size: 20px;
  }
}

.modal-content {
  padding: 2rem 1.5rem;
  text-align: center;
}

.modal-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fef2f2;
  border-radius: 50%;
  color: #ef4444;

  .material-symbols-outlined {
    font-size: 32px;
  }
}

.modal-message {
  font-size: 1rem;
  color: #1e293b;
  margin: 0 0 0.75rem;
  line-height: 1.6;

  strong {
    font-weight: 700;
    color: #296a6a;
  }
}

.modal-warning {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 100px;

  &.modal-btn-cancel {
    background: #f1f5f9;
    color: #475569;

    &:hover {
      background: #e2e8f0;
    }
  }

  &.modal-btn-delete {
    background: #ef4444;
    color: white;

    &:hover {
      background: #dc2626;
    }
  }
}
</style>

