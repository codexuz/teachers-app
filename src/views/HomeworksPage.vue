<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ $t("tabs.homeworks") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col size-lg="8" size-md="10" size-sm="12">
            <!-- Loading spinner -->
            <div v-if="isLoading" class="loading-container">
              <ion-spinner
                name="crescent"
                class="loading-spinner"
              ></ion-spinner>
            </div>

            <!-- Groups list -->
            <div v-else>
              <ion-list lines="none">
                <ion-item
                  v-for="group in groups"
                  :key="group.id"
                  button
                  @click="viewHomeworks(group.id)"
                  class="group-item"
                >
                  <ion-icon
                    :icon="libraryOutline"
                    slot="start"
                    class="group-icon"
                  ></ion-icon>
                  <ion-label>
                    <h2>{{ group.name }}</h2>
                    <p>{{ group.level?.title || group.level?.level }}</p>
                  </ion-label>
                </ion-item>
              </ion-list>

              <!-- Empty state -->
              <div v-if="!groups.length && !isLoading" class="empty-state">
                <ion-icon :icon="libraryOutline" class="empty-icon"></ion-icon>
                <h3>{{ $t("homeworks.noGroups") }}</h3>
                <p>{{ $t("homeworks.noGroupsDescription") }}</p>
              </div>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonSpinner,
  toastController,
} from "@ionic/vue";
import { libraryOutline } from "ionicons/icons";
// @ts-expect-error - API module doesn't have type definitions
import { groupsAPI } from "@/utils/api.js";

const { t } = useI18n();
const router = useRouter();

const groups = ref<any[]>([]);
const isLoading = ref(false);

const loadGroups = async () => {
  isLoading.value = true;

  try {
    // Get user from localStorage to get teacher ID
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      throw new Error(t("common.userNotFound"));
    }

    const user = JSON.parse(userStr);
    const teacherId = user.id;

    // Fetch teacher's groups
    const teacherGroups = await groupsAPI.getByTeacherId(teacherId);
    groups.value = teacherGroups || [];
  } catch (error: any) {
    console.error("Error loading groups:", error);

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

const viewHomeworks = (groupId: string) => {
  // Navigate to group homeworks view (we'll implement this route later)
  router.push(`/group/${groupId}/homeworks`);
};

onMounted(() => {
  loadGroups();
});
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
}

.group-item {
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  margin-bottom: 8px;
  border-radius: 12px;
  --background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.group-item:hover {
  --background: var(--ion-color-light);
}

.group-icon {
  color: var(--ion-color-primary);
  font-size: 24px;
  margin-right: 8px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  color: var(--ion-color-medium);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}
</style>
