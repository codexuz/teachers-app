<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/profile"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ $t("profileUpdate.title") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-grid>
        <ion-row>
          <ion-col
            size-lg="8"
            size-md="10"
            size-sm="12"
            offset-lg="2"
            offset-md="1"
          >
            <div class="profile-update-container">
              <!-- Loading -->
              <ion-spinner
                v-if="isLoading"
                name="crescent"
                class="loading-spinner"
              ></ion-spinner>

              <!-- Update Form -->
              <div v-else class="update-form">
                <div class="avatar-section">
                  <div class="avatar">
                    <ion-icon :icon="personCircleOutline"></ion-icon>
                  </div>
                </div>

                <ion-list>
                  <!-- First Name -->
                  <ion-item>
                    <ion-label position="stacked">{{
                      $t("profileUpdate.firstName")
                    }}</ion-label>
                    <ion-input
                      v-model="formData.first_name"
                      type="text"
                      :placeholder="$t('profileUpdate.enterFirstName')"
                    ></ion-input>
                  </ion-item>

                  <!-- Last Name -->
                  <ion-item>
                    <ion-label position="stacked">{{
                      $t("profileUpdate.lastName")
                    }}</ion-label>
                    <ion-input
                      v-model="formData.last_name"
                      type="text"
                      :placeholder="$t('profileUpdate.enterLastName')"
                    ></ion-input>
                  </ion-item>

                  <!-- Username -->
                  <ion-item>
                    <ion-label position="stacked">{{
                      $t("profileUpdate.username")
                    }}</ion-label>
                    <ion-input
                      v-model="formData.username"
                      type="text"
                      :placeholder="$t('profileUpdate.enterUsername')"
                      :disabled="true"
                    ></ion-input>
                  </ion-item>

                  <!-- Phone Number -->
                  <ion-item>
                    <ion-label position="stacked">{{
                      $t("profileUpdate.phoneNumber")
                    }}</ion-label>
                    <ion-input
                      v-model="formData.phone"
                      type="tel"
                      :placeholder="$t('profileUpdate.enterPhoneNumber')"
                    ></ion-input>
                  </ion-item>
                </ion-list>

                <!-- Save Button -->
                <div class="button-container">
                  <ion-button
                    expand="block"
                    @click="saveProfile"
                    :disabled="isSaving || !isFormValid"
                  >
                    <ion-icon
                      v-if="!isSaving"
                      :icon="saveOutline"
                      slot="start"
                    ></ion-icon>
                    <ion-spinner v-if="isSaving" slot="start"></ion-spinner>
                    {{ isSaving ? $t("common.saving") : $t("common.save") }}
                  </ion-button>
                </div>
              </div>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonSpinner,
  toastController,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/vue";
import { personCircleOutline, saveOutline } from "ionicons/icons";
// @ts-expect-error - API module doesn't have type definitions
import { teacherAPI } from "@/utils/api.js";

const router = useRouter();
const { t } = useI18n();

const isLoading = ref(false);
const isSaving = ref(false);
const teacherId = ref<string>("");

const formData = ref({
  first_name: "",
  last_name: "",
  username: "",
  phone: "",
});

const isFormValid = computed(() => {
  return (
    formData.value.first_name.trim() !== "" &&
    formData.value.last_name.trim() !== ""
  );
});

const loadTeacherData = async () => {
  isLoading.value = true;

  try {
    const teacher = await teacherAPI.getById(teacherId.value);

    if (teacher) {
      formData.value = {
        first_name: teacher.first_name || "",
        last_name: teacher.last_name || "",
        username: teacher.username || "",
        phone: teacher.phone || "",
      };
    }
  } catch (error: any) {
    console.error("Error loading teacher data:", error);

    const toast = await toastController.create({
      message: error.message || t("profileUpdate.failedToLoad"),
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

const saveProfile = async () => {
  if (!isFormValid.value) {
    const toast = await toastController.create({
      message: t("profileUpdate.fillRequired"),
      duration: 2000,
      color: "warning",
    });
    await toast.present();
    return;
  }

  isSaving.value = true;

  try {
    const updateData = {
      first_name: formData.value.first_name.trim(),
      last_name: formData.value.last_name.trim(),
      phone: formData.value.phone.trim(),
    };

    await teacherAPI.updateProfile(teacherId.value, updateData);

    // Update localStorage user data
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        const updatedUser = {
          ...user,
          first_name: updateData.first_name,
          last_name: updateData.last_name,
          phone: updateData.phone,
          fullName: `${updateData.first_name} ${updateData.last_name}`,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } catch (error) {
        console.error("Error updating localStorage:", error);
      }
    }

    const toast = await toastController.create({
      message: t("profileUpdate.updateSuccess"),
      duration: 2000,
      color: "success",
    });
    await toast.present();

    // Navigate back to profile
    router.back();
  } catch (error: any) {
    console.error("Error updating profile:", error);

    const toast = await toastController.create({
      message: error.message || t("profileUpdate.updateFailed"),
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  // Get teacher ID from localStorage
  const userString = localStorage.getItem("user");
  if (userString) {
    try {
      const user = JSON.parse(userString);
      teacherId.value = user.id || user.user_id;

      if (!teacherId.value) {
        router.replace("/tabs/profile");
        return;
      }

      loadTeacherData();
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.replace("/tabs/profile");
    }
  } else {
    router.replace("/login");
  }
});
</script>

<style scoped>
ion-grid {
  padding: 0;
  height: 100%;
}

ion-row {
  height: 100%;
}

.profile-update-container {
  padding: 0;
  min-height: 100%;
}

.loading-spinner {
  display: block;
  margin: 100px auto;
  width: 50px;
  height: 50px;
}

.update-form {
  padding: 0;
}

.avatar-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 16px;
  background: var(--ion-color-light);
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--ion-color-primary-tint);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid var(--ion-color-primary);
}

.avatar ion-icon {
  font-size: 120px;
  color: var(--ion-color-primary);
}

ion-list {
  padding: 16px 0;
}

ion-item {
  --padding-start: 16px;
  --inner-padding-end: 16px;
  margin-bottom: 8px;
}

ion-label[position="stacked"] {
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-dark);
  margin-bottom: 8px;
}

ion-input,
ion-textarea {
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 10px;
  --padding-bottom: 10px;
  border: 1px solid var(--ion-color-light-shade);
  border-radius: 8px;
  margin-top: 4px;
}

ion-input[disabled] {
  opacity: 0.6;
  background: var(--ion-color-light);
}

.button-container {
  padding: 24px 16px;
}

ion-button {
  --border-radius: 12px;
  height: 48px;
  font-weight: 600;
  text-transform: none;
}

ion-spinner[slot="start"] {
  margin-right: 8px;
}
</style>
