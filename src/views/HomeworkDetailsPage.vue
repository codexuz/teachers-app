<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/homeworks"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ groupName || $t("homeworkDetails.title") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-grid>
        <ion-row class="ion-justify-content-center">
          <ion-col
            size-lg="8"
            offset-lg="2"
            size-md="10"
            offset-md="1"
            size-sm="12"
          >
            <!-- Loading spinner -->
            <div v-if="isLoading" class="loading-container">
              <ion-spinner
                name="crescent"
                class="loading-spinner"
              ></ion-spinner>
            </div>

            <!-- Homeworks list -->
            <div v-else>

              <!-- Homeworks list -->
              <ion-list>
                <ion-item
                  v-for="homework in homeworks"
                  :key="homework.id"
                  button
                  @click="viewHomework(homework)"
                >
                  <div class="homework-item">
                    <div class="homework-header">
                      <h3 class="homework-title">{{ homework.title }}</h3>
                      <ion-chip :color="getStatusColor(homework)" size="small">
                        {{ getStatusText(homework) }}
                      </ion-chip>
                    </div>
                    <div class="homework-meta">
                      <ion-icon
                        :icon="calendarOutline"
                        class="meta-icon"
                      ></ion-icon>
                      <span class="due-date">{{
                        formatDate(homework.deadline)
                      }}</span>
                    </div>
                  </div>
                </ion-item>
              </ion-list>

              <!-- Empty state -->
              <div v-if="!homeworks.length && !isLoading" class="empty-state">
                <ion-icon :icon="libraryOutline" class="empty-icon"></ion-icon>
                <h3>{{ $t("homeworkDetails.noHomeworks") }}</h3>
                <p>{{ $t("homeworkDetails.noHomeworksDescription") }}</p>
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
import { useRoute, useRouter } from "vue-router";
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
  IonButtons,
  IonBackButton,
  IonIcon,
  IonSpinner,
  IonChip,
  toastController,
} from "@ionic/vue";
import { libraryOutline, calendarOutline } from "ionicons/icons";
// @ts-expect-error - API module doesn't have type definitions
import { groupHomeworksAPI, groupsAPI } from "@/utils/api.js";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const homeworks = ref<any[]>([]);
const isLoading = ref(false);
const groupName = ref("");
const groupId = route.params.id as string;

const loadHomeworks = async () => {
  isLoading.value = true;

  try {
    // Fetch homeworks for the group
    const groupHomeworks = await groupHomeworksAPI.getByGroupId(groupId);

    // Sort by deadline (earliest deadline first)
    const sortedHomeworks = (groupHomeworks || []).sort((a: any, b: any) => {
      const dateA = new Date(a.deadline);
      const dateB = new Date(b.deadline);
      return dateA.getTime() - dateB.getTime();
    });

    homeworks.value = sortedHomeworks;

    // Also fetch group info to get the name
    const group = await groupsAPI.getById(groupId);
    groupName.value = group?.name || "";
  } catch (error: any) {
    console.error("Error loading homeworks:", error);

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


const viewHomework = (homework: any) => {
  // Navigate to homework submissions page
  router.push(`/group/${groupId}/homework/${homework.id}/submissions`);
};

const getStatusColor = (homework: any) => {
  const today = new Date();
  const deadline = new Date(homework.deadline);

  if (deadline < today) {
    return "danger"; // expired
  } else {
    return "primary"; // active
  }
};

const getStatusText = (homework: any) => {
  const today = new Date();
  const deadline = new Date(homework.deadline);

  if (deadline < today) {
    return t("homeworkDetails.status.expired");
  } else {
    return t("homeworkDetails.status.active");
  }
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

onMounted(() => {
  loadHomeworks();
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

.add-homework-btn {
  margin-bottom: 16px;
}

.homework-item {
  width: 100%;
  padding: 8px 0;
}

.homework-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.homework-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.homework-meta {
  display: flex;
  align-items: center;
  color: var(--ion-color-medium);
  font-size: 14px;
}

.meta-icon {
  margin-right: 6px;
  font-size: 16px;
}

.due-date {
  font-weight: 500;
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
  margin: 0 0 20px 0;
  font-size: 14px;
  line-height: 1.4;
}
</style>
