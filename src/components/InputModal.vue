<script setup lang="ts">
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonTextarea,
  IonTitle,
  IonToolbar,
  IonIcon
} from '@ionic/vue';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';

interface TodoForm {
  title: string;
  description: string;
}

const props = defineProps<{
  isOpen: boolean;
  todo: TodoForm;
  editingId: string | null;
}>();

const emit = defineEmits<{
  'update:isOpen': [value: boolean];
  'update:todo': [value: TodoForm];
  'submit': [todo: TodoForm];
}>();

const handleCancel = () => {
  emit('update:isOpen', false);
};

const handleSubmit = () => {
  if (props.todo.title.trim()) {
    emit('submit', props.todo);
  }
};
</script>

<template>
  <ion-modal :is-open="isOpen" @didDismiss="handleCancel">
    <ion-header>
      <ion-toolbar color="light">
        <ion-buttons slot="start">
          <ion-button color="danger" @click="handleCancel">
            <ion-icon :icon="closeCircle" slot="start"></ion-icon>
            Cancel
          </ion-button>
        </ion-buttons>
        <ion-title>{{ editingId ? 'Edit Task' : 'New Task' }}</ion-title>
        <ion-buttons slot="end">
          <ion-button color="primary" @click="handleSubmit" :disabled="!todo.title.trim()">
            <ion-icon :icon="checkmarkCircle" slot="start"></ion-icon>
            {{ editingId ? 'Update' : 'Create' }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="form-container">
        <ion-item class="input-item">
          <ion-label position="stacked">Title <span class="required">*</span></ion-label>
          <ion-input
            v-model="todo.title"
            placeholder="Enter task title"
            class="title-input"
            required
          ></ion-input>
        </ion-item>

        <ion-item class="input-item">
          <ion-label position="stacked">Description</ion-label>
          <ion-textarea
            v-model="todo.description"
            placeholder="Enter task description"
            :rows="4"
            class="description-input"
          ></ion-textarea>
        </ion-item>
      </div>
    </ion-content>
  </ion-modal>
</template>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
}

.input-item {
  margin-bottom: 16px;
  --padding-start: 0;
  --border-color: transparent;
  --highlight-height: 0;
}

.input-item::part(native) {
  padding: 0;
}

ion-label {
  margin-bottom: 8px;
  font-weight: 500;
}

.required {
  color: var(--ion-color-danger);
}

.title-input,
.description-input {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  --border-radius: 8px;
  --background: var(--ion-color-light);
  margin-top: 4px;
}

ion-textarea {
  --background: var(--ion-color-light);
  border-radius: 8px;
}

ion-button {
  text-transform: none;
  font-weight: 500;
}
</style>