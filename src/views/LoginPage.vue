<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Background gradient -->
      <div class="gradient-background"></div>
      
      <div id="container">
        <!-- Cloud decorative elements -->
        <div class="cloud cloud-1"></div>
        <div class="cloud cloud-2"></div>

        <!-- Logo and Title Area -->
        <div class="logo-container">
          <ion-avatar>
            <img alt="Toy Story Logo" src="/images/toy-story-logo.png" />
          </ion-avatar>
          <ion-text color="light">
            <h1 class="title">Toy Story APP</h1>
            <p class="subtitle">Welcome to the adventure!</p>
          </ion-text>
        </div>

        <!-- Sign In Button -->
        <ion-button @click="login" class="login-button" size="large">
          <ion-icon :icon="logoGoogle" slot="start"></ion-icon>
          <ion-label>Sign In with Google</ion-label>
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonText,
  IonLabel,
  IonAvatar,
} from "@ionic/vue";
import { logoGoogle } from "ionicons/icons";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

const login = async () => {
  await authStore.loginWithGoogle();
};
</script>

<style scoped>
.gradient-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #4c8dff 0%, #3171e0 100%);
  z-index: -1;
}

#container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  position: relative;
  padding: 2rem;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3rem;
  text-align: center;
}

ion-avatar {
  width: 120px;
  height: 120px;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0.5rem 0;
  color: white;
}

.subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.login-button {
  --background: white;
  --color: #4c8dff;
  --border-radius: 12px;
  --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  --padding-start: 2rem;
  --padding-end: 2rem;
  font-weight: 600;
  margin-top: 1rem;
  min-width: 280px;
}

.cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  filter: blur(20px);
}

.cloud-1 {
  width: 150px;
  height: 150px;
  top: 10%;
  left: 10%;
}

.cloud-2 {
  width: 180px;
  height: 180px;
  bottom: 15%;
  right: 10%;
}

@media (max-width: 480px) {
  .title {
    font-size: 2rem;
  }
  
  ion-avatar {
    width: 100px;
    height: 100px;
  }
  
  .login-button {
    min-width: 240px;
  }
}
</style>