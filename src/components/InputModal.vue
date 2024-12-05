<script setup lang="ts">
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonTextarea, IonButton, IonFooter } from '@ionic/vue';


defineProps({
  isOpen: Boolean, 
  toy: Object, 
  editingId: String 
});


defineEmits(['update:isOpen', 'submit']); 
</script>

<template>
  <ion-modal :is-open="isOpen" @didDismiss="$emit('update:isOpen', false)">
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ editingId ? 'Edit' : 'Tambah' }} Mainan</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <form @submit.prevent="$emit('submit', { ...toy })">
        <ion-item>
          <ion-input
            v-model="toy.name"
            placeholder="Masukkan nama mainan"
            label="Nama Mainan"
            required
          ></ion-input>
        </ion-item>

        
        <ion-item>
          <ion-textarea
            v-model="toy.description"
            placeholder="Masukkan Cerita mainan"
            label="Cerita"
          ></ion-textarea>
        </ion-item>

        <ion-footer>
          <ion-button expand="full" type="submit">
            Simpan
          </ion-button>
          <ion-button expand="full" color="light" @click="$emit('update:isOpen', false)">
            Batal
          </ion-button>
        </ion-footer>
      </form>
    </ion-content>
  </ion-modal>
</template>

<style scoped>
ion-footer {
  margin-top: 1rem;
}
</style>
