<template>
  <ion-page>
    <ion-content :fullscreen="true" class="ion-padding">
      <div class="language-container">
        <div class="language-header">
          <div class="logo-container">
            <img :src="Logo" alt="Logo" class="logo" />
          </div>

          <h1>{{ t("language.title") }}</h1>
          <p>{{ t("language.subtitle") }}</p>
        </div>

        <div class="language-options">
          <div
            v-for="lang in languages"
            :key="lang.code"
            class="language-card"
            :class="{ selected: selectedLanguage === lang.code }"
            @click="selectLanguage(lang.code)"
          >
            <div class="language-flag">{{ lang.flag }}</div>
            <div class="language-info">
              <h3>{{ lang.name }}</h3>
              <p>{{ lang.nativeName }}</p>
            </div>
            <ion-icon
              v-if="selectedLanguage === lang.code"
              :icon="checkmarkCircle"
              class="check-icon"
            ></ion-icon>
          </div>
        </div>

        <ion-button
          expand="block"
          @click="confirmLanguage"
          :disabled="!selectedLanguage"
          class="continue-button"
        >
          {{ t("language.continue") }}
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { IonPage, IonContent, IonButton, IonIcon } from "@ionic/vue";
import { checkmarkCircle } from "ionicons/icons";
import Logo from "@/assets/images/logo.png";
const router = useRouter();
const { t, locale } = useI18n();

const selectedLanguage = ref(localStorage.getItem("language") || "");

const languages = [
  {
    code: "en",
    name: t("language.english"),
    nativeName: "English",
    flag: "🇬🇧",
  },
  {
    code: "uz",
    name: t("language.uzbek"),
    nativeName: "O'zbekcha",
    flag: "🇺🇿",
  },
  {
    code: "ru",
    name: t("language.russian"),
    nativeName: "Русский",
    flag: "🇷🇺",
  },
];

const selectLanguage = (code: string) => {
  selectedLanguage.value = code;
  locale.value = code;
};

const confirmLanguage = () => {
  if (selectedLanguage.value) {
    localStorage.setItem("language", selectedLanguage.value);
    localStorage.setItem("languageSelected", "true");

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/tabs/main");
    } else {
      router.replace("/login");
    }
  }
};
</script>

<style scoped>
.language-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100%;
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.language-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-container {
  margin-bottom: 30px;
}

.logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.language-header h1 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 10px;
  color: var(--ion-color-dark);
}

.language-header p {
  font-size: 16px;
  color: var(--ion-color-medium);
  margin: 0;
}

.language-options {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.language-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid var(--ion-color-light-shade);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--ion-color-light);
}

.language-card:hover {
  border-color: var(--ion-color-primary-tint);
  transform: translateY(-2px);
}

.language-card.selected {
  border-color: var(--ion-color-primary);
  background: rgba(var(--ion-color-primary-rgb), 0.1);
}

.language-flag {
  font-size: 40px;
  margin-right: 16px;
}

.language-info {
  flex: 1;
}

.language-info h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--ion-color-dark);
}

.language-info p {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin: 0;
}

.check-icon {
  font-size: 28px;
  color: var(--ion-color-primary);
}

.continue-button {
  width: 100%;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  margin-top: auto;
}
</style>
