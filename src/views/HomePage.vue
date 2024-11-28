<script setup lang="ts">
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonBadge,
  IonIcon,
  IonFab,
  IonFabButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  loadingController,
  IonRefresher,
  IonRefresherContent,
  toastController,
  IonSpinner
} from '@ionic/vue';
import {
  add,
  checkmarkCircle,
  timeOutline,
  create,
  trash,
  closeCircle,
  warningOutline
} from 'ionicons/icons';
import InputModal from '@/components/InputModal.vue';
import { onMounted, ref, computed, onUnmounted } from 'vue';
import { firestoreService, type Todo } from '@/utils/firestore';
import { formatDistanceToNow } from 'date-fns';
import TabsMenu from '@/components/TabsMenu.vue';

// Types
interface TodoForm {
  title: string;
  description: string;
}

// State management
const isOpen = ref(false);
const editingId = ref<string | null>(null);
const todos = ref<Todo[]>([]);
const todo = ref<TodoForm>({
  title: '',
  description: '',
});
const selectedSegment = ref('active');
const isLoading = ref(false);

// Computed properties
const activeTodos = computed(() => todos.value.filter(todo => !todo.status));
const completedTodos = computed(() => todos.value.filter(todo => todo.status));
const displayTodos = computed(() => selectedSegment.value === 'active' ? activeTodos.value : completedTodos.value);

// Utils
const showToast = async (message: string, color: string = 'success', icon: string = checkmarkCircle) => {
  const toast = await toastController.create({
    message,
    duration: 2000,
    color,
    position: 'top',
    icon
  });
  await toast.present();
};

const getRelativeTime = (date: Date | { toDate: () => Date }) => {
  try {
    const jsDate = date?.toDate ? date.toDate() : new Date(date);
    return formatDistanceToNow(jsDate, { addSuffix: true });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
};

// Data loading
const loadTodos = async (showLoading = true) => {
  if (showLoading) {
    isLoading.value = true;
  }

  try {
    todos.value = await firestoreService.getTodos();
  } catch (error) {
    console.error('Error loading todos:', error);
    showToast('Failed to load todos', 'danger', closeCircle);
  } finally {
    isLoading.value = false;
  }
};

// Event handlers
const handleRefresh = async (event: CustomEvent) => {
  try {
    await loadTodos(false);
    showToast('Tasks refreshed successfully');
  } catch (error) {
    console.error('Error refreshing:', error);
    showToast('Failed to refresh tasks', 'danger', warningOutline);
  } finally {
    event.target.complete();
  }
};

const handleSegmentChange = (event: CustomEvent) => {
  selectedSegment.value = event.detail.value;
};

const handleSubmit = async (formData: TodoForm) => {
  if (!formData.title?.trim()) {
    await showToast('Title is required', 'warning', warningOutline);
    return;
  }

  const loading = await loadingController.create({
    message: editingId.value ? 'Updating task...' : 'Creating task...'
  });

  try {
    await loading.present();
    
    if (editingId.value) {
      await firestoreService.updateTodo(editingId.value, {
        title: formData.title.trim(),
        description: formData.description?.trim() || ''
      });
      showToast('Task updated successfully');
    } else {
      await firestoreService.addTodo({
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        status: false
      });
      showToast('Task created successfully');
    }

    isOpen.value = false;
    todo.value = { title: '', description: '' };
    await loadTodos(false);
  } catch (error) {
    console.error('Submit error:', error);
    showToast('Failed to save task', 'danger', warningOutline);
  } finally {
    loading.dismiss();
    editingId.value = null;
  }
};

const handleEdit = async (editTodo: Todo) => {
  editingId.value = editTodo.id!;
  todo.value = {
    title: editTodo.title,
    description: editTodo.description,
  }
  isOpen.value = true;
};

const handleDelete = async (deleteTodo: Todo) => {
  try {
    await firestoreService.deleteTodo(deleteTodo.id!);
    await showToast('Task deleted successfully');
    await loadTodos(false);
  } catch (error) {
    console.error('Delete error:', error);
    await showToast('Failed to delete task', 'danger', closeCircle);
  }
};

const handleStatus = async (statusTodo: Todo) => {
  try {
    await firestoreService.updateStatus(statusTodo.id!, !statusTodo.status);
    await showToast(
      `Task marked as ${!statusTodo.status ? 'completed' : 'active'}`,
      'success',
      !statusTodo.status ? checkmarkCircle : timeOutline
    );
    await loadTodos(false);
  } catch (error) {
    console.error('Status update error:', error);
    await showToast('Failed to update status', 'danger', closeCircle);
  }
};

// Lifecycle hooks
onMounted(() => {
  loadTodos();
});
</script>

<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Tasks</ion-title>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment v-model="selectedSegment" @ionChange="handleSegmentChange">
          <ion-segment-button value="active">
            <ion-label>Active ({{ activeTodos.length }})</ion-label>
          </ion-segment-button>
          <ion-segment-button value="completed">
            <ion-label>Completed ({{ completedTodos.length }})</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <div class="task-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-container">
          <ion-spinner name="circular"></ion-spinner>
          <p>Loading tasks...</p>
        </div>

        <!-- Task List -->
        <ion-list v-else>
          <ion-item-sliding v-for="todo in displayTodos" :key="todo.id">
            <!-- Delete Option -->
            <ion-item-options side="start">
              <ion-item-option color="danger" @click="handleDelete(todo)">
                <div class="option-content">
                  <ion-icon :icon="trash"></ion-icon>
                  <span>Delete</span>
                </div>
              </ion-item-option>
            </ion-item-options>

            <!-- Task Item -->
            <ion-item lines="none" class="task-item">
              <div class="task-content" :class="{ 'completed': todo.status }">
                <div class="task-header">
                  <h2>{{ todo.title }}</h2>
                  <ion-badge :color="todo.status ? 'success' : 'warning'">
                    {{ todo.status ? 'Completed' : 'Active' }}
                  </ion-badge>
                </div>
                <p v-if="todo.description">{{ todo.description }}</p>
                <div class="task-footer">
                  <ion-badge color="medium">
                    {{ getRelativeTime(todo.updatedAt) }}
                  </ion-badge>
                </div>
              </div>
            </ion-item>

            <!-- Action Options -->
            <ion-item-options side="end">
              <ion-item-option color="primary" @click="handleEdit(todo)">
                <div class="option-content">
                  <ion-icon :icon="create"></ion-icon>
                  <span>Edit</span>
                </div>
              </ion-item-option>
              <ion-item-option 
                :color="todo.status ? 'warning' : 'success'" 
                @click="handleStatus(todo)"
              >
                <div class="option-content">
                  <ion-icon :icon="todo.status ? timeOutline : checkmarkCircle"></ion-icon>
                  <span>{{ todo.status ? 'Undone' : 'Done' }}</span>
                </div>
              </ion-item-option>
            </ion-item-options>
          </ion-item-sliding>

          <!-- Empty State -->
          <ion-item v-if="displayTodos.length === 0" class="empty-state">
            <div class="empty-content">
              <h3>No {{ selectedSegment }} tasks</h3>
              <p>{{ selectedSegment === 'active' ? 'Add a new task using the + button below' : 'Complete some tasks to see them here' }}</p>
            </div>
          </ion-item>
        </ion-list>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button @click="isOpen = true">
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>

      <InputModal
        v-model:is-open="isOpen"
        v-model:todo="todo"
        :editing-id="editingId"
        @submit="handleSubmit"
      />
    </ion-content>
  </ion-page>
</template>

<style scoped>
.task-container {
  padding: 16px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: var(--ion-color-medium);
}

.task-item {
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
  margin-bottom: 8px;
}

.task-content {
  width: 100%;
  background: var(--ion-color-light);
  border-radius: 8px;
  padding: 16px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.task-content p {
  margin: 8px 0;
  color: var(--ion-color-medium);
}

.task-footer {
  margin-top: 8px;
}

.completed {
  opacity: 0.7;
}

.completed h2 {
  text-decoration: line-through;
}

.option-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

ion-item-option {
  --padding-top: 8px;
  --padding-bottom: 8px;
  min-width: 80px;
}

.empty-state {
  --padding-start: 0;
  --padding-end: 0;
}

.empty-content {
  width: 100%;
  text-align: center;
  padding: 32px 16px;
}

.empty-content h3 {
  margin: 0 0 8px;
  color: var(--ion-color-dark);
}

.empty-content p {
  margin: 0;
  color: var(--ion-color-medium);
}

ion-badge {
  padding: 6px 12px;
  border-radius: 16px;
}

ion-segment {
  padding: 8px;
}

ion-fab {
  margin: 16px;
}
</style>