<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="transparent-toolbar">
        <div class="header-content">
          <ion-title class="modern-title">Koleksi Mainan</ion-title>
          <ion-searchbar
            placeholder="Cari mainan..."
            class="custom-searchbar"
            v-model="searchQuery"
          ></ion-searchbar>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="ion-padding">
        <!-- Loading State -->
        <ion-loading :is-open="isLoading" message="Memuat data..."></ion-loading>

        <!-- Error Message -->
        <ion-toast
          :is-open="!!errorMessage"
          :message="errorMessage"
          duration={3000}
          color="danger"
        ></ion-toast>

        <!-- Grid Layout for Cards -->
        <ion-grid>
          <ion-row>
            <ion-col size="12" size-md="6" v-for="toy in filteredToys" :key="toy.id">
              <ion-card class="toy-card">
                <ion-card-header>
                  <ion-card-title class="toy-title">{{ toy.name }}</ion-card-title>
                </ion-card-header>

                <ion-card-content>
                  <p class="toy-description">{{ toy.description }}</p>
                  
                  <!-- Status Toggle -->
                  <ion-chip 
                    :color="toy.status ? 'success' : 'medium'"
                    @click="toggleStatus(toy.id, !toy.status)"
                  >
                    <ion-icon :icon="toy.status ? checkmark : close"></ion-icon>
                    <ion-label>{{ toy.status ? 'Aktif' : 'Nonaktif' }}</ion-label>
                  </ion-chip>
                  
                  <div class="action-buttons">
                    <ion-button 
                      fill="clear" 
                      class="edit-button"
                      @click="openEditModal(toy)"
                    >
                      <ion-icon :icon="pencil" slot="start"></ion-icon>
                      Edit
                    </ion-button>
                    
                    <ion-button 
                      fill="clear" 
                      class="delete-button"
                      @click="confirmDelete(toy.id)"
                    >
                      <ion-icon :icon="trash" slot="start"></ion-icon>
                      Hapus
                    </ion-button>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>
      </div>

      <!-- Modern Floating Action Button -->
      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button class="custom-fab" @click="openAddModal">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <!-- Enhanced Modal -->
      <input-modal
        :isOpen="isOpen"
        :toy="toy"
        :editingId="editingId"
        @update:isOpen="isOpen = $event"
        @submit="handleSave"
      />

      <!-- Alert Dialog for Delete Confirmation -->
      <ion-alert
        :is-open="showDeleteAlert"
        header="Konfirmasi Hapus"
        message="Apakah Anda yakin ingin menghapus mainan ini?"
        :buttons="[
          {
            text: 'Batal',
            role: 'cancel',
          },
          {
            text: 'Hapus',
            role: 'confirm',
            handler: () => deleteToy(toyToDelete),
          },
        ]"
        @didDismiss="showDeleteAlert = false"
      ></ion-alert>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonAlert,
  IonLoading,
  IonToast,
  IonChip,
  IonLabel,
} from '@ionic/vue';
import { ref, computed, onMounted } from 'vue';
import { add, pencil, trash, checkmark, close } from 'ionicons/icons';
import InputModal from '@/components/InputModal.vue';
import { auth, db } from '@/utils/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

// Interface for Toy
interface Toy {
  id?: string;
  name: string;
  description: string;
  status: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore Service
const firestoreService = {
  getToyRef() {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('User not authenticated');
    return collection(db, 'users', uid, 'toys');
  },

  async getToys(): Promise<Toy[]> {
    const ref = this.getToyRef();
    const q = query(ref, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Toy),
    }));
  },

  async addToy(toy: Omit<Toy, 'id' | 'createdAt' | 'updatedAt'>) {
    const ref = this.getToyRef();
    await addDoc(ref, {
      ...toy,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  },

  async updateToy(id: string, toy: Partial<Omit<Toy, 'id'>>) {
    const ref = doc(this.getToyRef(), id);
    await updateDoc(ref, {
      ...toy,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteToy(id: string) {
    const ref = doc(this.getToyRef(), id);
    await deleteDoc(ref);
  },

  async updateStatus(id: string, status: boolean) {
    const ref = doc(this.getToyRef(), id);
    await updateDoc(ref, {
      status,
      updatedAt: Timestamp.now(),
    });
  },
};

// State
const isOpen = ref(false);
const editingId = ref<string | null>(null);
const toy = ref<Partial<Toy>>({ name: '', description: '', status: true });
const toys = ref<Toy[]>([]);
const searchQuery = ref('');
const showDeleteAlert = ref(false);
const toyToDelete = ref<string | null>(null);
const isLoading = ref(false);
const errorMessage = ref('');

// Computed property for filtered toys
const filteredToys = computed(() => {
  return toys.value.filter(toy => 
    toy.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    toy.description.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Fetch toys from Firestore
const fetchToys = async () => {
  try {
    isLoading.value = true;
    toys.value = await firestoreService.getToys();
  } catch (error) {
    errorMessage.value = 'Gagal memuat data mainan';
    console.error('Error fetching toys:', error);
  } finally {
    isLoading.value = false;
  }
};

// Methods
const openAddModal = () => {
  toy.value = { name: '', description: '', status: true };
  editingId.value = null;
  isOpen.value = true;
};

const openEditModal = (selectedToy: Toy) => {
  toy.value = { ...selectedToy };
  editingId.value = selectedToy.id;
  isOpen.value = true;
};

const handleSave = async (newToy: Partial<Toy>) => {
  try {
    isLoading.value = true;
    if (editingId.value) {
      await firestoreService.updateToy(editingId.value, newToy);
    } else {
      await firestoreService.addToy({
        name: newToy.name || '',
        description: newToy.description || '',
        status: newToy.status || true
      });
    }
    await fetchToys(); // Refresh the list
    isOpen.value = false;
  } catch (error) {
    errorMessage.value = 'Gagal menyimpan data mainan';
    console.error('Error saving toy:', error);
  } finally {
    isLoading.value = false;
  }
};

const toggleStatus = async (id: string | undefined, status: boolean) => {
  if (!id) return;
  try {
    isLoading.value = true;
    await firestoreService.updateStatus(id, status);
    await fetchToys();
  } catch (error) {
    errorMessage.value = 'Gagal mengubah status mainan';
    console.error('Error updating status:', error);
  } finally {
    isLoading.value = false;
  }
};

const confirmDelete = (id: string | undefined) => {
  if (!id) return;
  toyToDelete.value = id;
  showDeleteAlert.value = true;
};

const deleteToy = async (id: string | null) => {
  if (!id) return;
  try {
    isLoading.value = true;
    await firestoreService.deleteToy(id);
    await fetchToys(); // Refresh the list
    toyToDelete.value = null;
  } catch (error) {
    errorMessage.value = 'Gagal menghapus mainan';
    console.error('Error deleting toy:', error);
  } finally {
    isLoading.value = false;
  }
};

// Fetch data on component mount
onMounted(() => {
  fetchToys();
});
</script>

<style scoped>
.transparent-toolbar {
  --background: transparent;
  --border-width: 0;
}

.header-content {
  background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
  padding: 1rem;
  border-radius: 0 0 1.5rem 1.5rem;
}

.modern-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.custom-searchbar {
  --background: rgba(255, 255, 255, 0.1);
  --color: white;
  --placeholder-color: rgba(255, 255, 255, 0.8);
  --border-radius: 1rem;
  --box-shadow: none;
}

.toy-card {
  border-radius: 1rem;
  margin: 0.5rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.toy-card:hover {
  transform: translateY(-2px);
}

.toy-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.toy-description {
  color: var(--ion-color-medium);
  margin: 0.5rem 0 1rem 0;
  line-height: 1.5;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.edit-button {
  --color: var(--ion-color-primary);
}

.delete-button {
  --color: var(--ion-color-danger);
}

.custom-fab {
  --background: linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary));
  --box-shadow: 0 4px 12px rgba(var(--ion-color-primary-rgb), 0.4);
}

ion-chip {
  margin-top: 0.5rem;
  cursor: pointer;
}

@media (min-width: 768px) {
  ion-grid {
    padding: 1rem;
  }
}
</style>