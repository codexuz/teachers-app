<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="login-container">
        <div class="logo-container">
          <img :src="Logo" alt="Logo" class="logo" />
        </div>

        <h2 class="signin-text">{{ $t("auth.signInWithCredentials") }}</h2>

        <ion-list class="login-form">
          <ion-item>
            <ion-input
              v-model="username"
              :label="$t('auth.username')"
              label-placement="floating"
              type="text"
              :placeholder="$t('auth.enterUsername')"
              @keyup.enter="handleLogin"
            ></ion-input>
          </ion-item>

          <ion-item>
            <ion-input
              v-model="password"
              :label="$t('auth.password')"
              label-placement="floating"
              type="password"
              :placeholder="$t('auth.enterPassword')"
              @keyup.enter="handleLogin"
            >
              <ion-input-password-toggle slot="end"></ion-input-password-toggle>
            </ion-input>
          </ion-item>
        </ion-list>

        <ion-button
          expand="block"
          @click="handleLogin"
          :disabled="isLoading"
          class="login-button"
        >
          <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
          <span v-else>{{ $t("auth.signIn") }}</span>
        </ion-button>

        <ion-text color="danger" v-if="errorMessage" class="error-message">
          <p>{{ errorMessage }}</p>
        </ion-text>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonList,
  IonText,
  IonSpinner,
  toastController,
  IonInputPasswordToggle 
} from "@ionic/vue";
import { authAPI } from "@/utils/api.js";
import Logo from "@/assets/images/logo.png";

const router = useRouter();
const { t } = useI18n();
const username = ref("");
const password = ref("");
const isLoading = ref(false);
const errorMessage = ref("");

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = t("auth.enterBothFields");
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const credentials = {
      username: username.value,
      password: password.value,
    };

    const response = await authAPI.login(credentials);

    // Store tokens and user data
    if (response.access_token) {
      localStorage.setItem("token", response.access_token);
    }
    if (response.refresh_token) {
      localStorage.setItem("refresh_token", response.refresh_token);
    }
    if (response.session_id) {
      localStorage.setItem("session_id", response.session_id);
    }
    if (response.user) {
      localStorage.setItem("user", JSON.stringify(response.user));
    }

    const toast = await toastController.create({
      message: t("auth.loginSuccessful"),
      duration: 2000,
      color: "success",
    });
    await toast.present();

    // Navigate to main page
    router.replace("/tabs/main");
  } catch (error: any) {
    console.error("Login error:", error);
    errorMessage.value = error.message || t("auth.loginFailed");

    const toast = await toastController.create({
      message: errorMessage.value,
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
}

.logo-container {
  margin-bottom: 40px;
}

.logo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
}

.signin-text {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
  color: var(--ion-color-dark);
  text-align: center;
}

.login-form {
  width: 100%;
  max-width: 400px;
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  max-width: 400px;
  margin-top: 20px;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
}

.error-message {
  margin-top: 15px;
  text-align: center;
}

.error-message p {
  margin: 0;
  font-size: 14px;
}
</style>
