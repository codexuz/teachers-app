<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ $t("main.createGroup") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">
            {{ $t("common.cancel") }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form @submit.prevent="createGroup">
        <ion-item>
          <ion-label position="stacked">{{ $t("main.groupName") }} *</ion-label>
          <ion-input
            v-model="formData.name"
            type="text"
            :placeholder="$t('main.groupNamePlaceholder')"
            required
          ></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">{{ $t("main.level") }} *</ion-label>
          <ion-select
            v-model="formData.level_id"
            :placeholder="$t('main.selectLevel')"
            required
          >
            <ion-select-option
              v-for="level in levels"
              :key="level.id"
              :value="level.id"
            >
              {{ level.level }} - {{ level.title }}
            </ion-select-option>
          </ion-select>
        </ion-item>

        <ion-button
          expand="block"
          type="submit"
          class="ion-margin-top"
          :disabled="isLoading || !formData.name || !formData.level_id"
        >
          <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
          <span v-else>{{ $t("main.createGroup") }}</span>
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  modalController,
  toastController,
} from "@ionic/vue";
import { useI18n } from "vue-i18n";
// @ts-expect-error - API module uses CommonJS
import { groupsAPI, courseAPI } from "@/utils/api.js";

const { t } = useI18n();

const formData = ref({
  name: "",
  teacher_id: "",
  level_id: "",
});

const levels = ref<any[]>([]);
const isLoading = ref(false);

const loadLevels = async () => {
  try {
    const response = await courseAPI.getAll();
    levels.value = response || [];
  } catch (error) {
    console.error("Error loading levels:", error);
    const toast = await toastController.create({
      message: t("common.error"),
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  }
};

const createGroup = async () => {
  isLoading.value = true;

  try {
    const userString = localStorage.getItem("user");
    if (!userString) {
      throw new Error("User not found");
    }

    const user = JSON.parse(userString);
    formData.value.teacher_id = user.id;

    const payload: any = {
      name: formData.value.name,
      teacher_id: formData.value.teacher_id,
      level_id: formData.value.level_id,
    };



    await groupsAPI.create(payload);

    const toast = await toastController.create({
      message: t("main.groupCreated"),
      duration: 2000,
      color: "success",
    });
    await toast.present();

    modalController.dismiss({ created: true });
  } catch (error: any) {
    console.error("Error creating group:", error);

    const toast = await toastController.create({
      message: error.message || t("common.error"),
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  modalController.dismiss();
};

onMounted(() => {
  loadLevels();
});
</script>

<style scoped>
ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 16px;
}

ion-label {
  margin-bottom: 8px;
  font-weight: 500;
}

ion-input,
ion-select {
  --padding-start: 12px;
  border: 1px solid var(--ion-color-light-shade);
  border-radius: 8px;
  margin-top: 4px;
}

ion-button[type="submit"] {
  margin-top: 24px;
  height: 48px;
}
</style>
