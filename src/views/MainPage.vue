<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ $t("main.myGroups") }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="openCreateGroupModal">
            <ion-icon :icon="addOutline"></ion-icon>
          </ion-button>
          <ion-button @click="loadGroups">
            <ion-icon :icon="refresh"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-grid class="groups-container">
        <ion-row>
          <ion-col size-lg="8" size-md="10" size-sm="12" offset-lg="2" offset-md="1">
        <!-- Teacher Stats Card -->
        <ion-card v-if="!isLoading" class="stats-card">
          <ion-card-content>
            <div class="stats-content">
              <div class="stat-item">
                <ion-icon :icon="peopleOutline" class="stat-icon"></ion-icon>
                <div class="stat-info">
                  <p class="stat-label">{{ $t("main.totalStudents") }}</p>
                  <h2 class="stat-value">{{ totalStudentCount }}</h2>
                </div>
              </div>
              <div class="stat-item">
                <ion-icon :icon="schoolOutline" class="stat-icon"></ion-icon>
                <div class="stat-info">
                  <p class="stat-label">{{ $t("main.totalGroups") }}</p>
                  <h2 class="stat-value">{{ groups.length }}</h2>
                </div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-spinner
          v-if="isLoading"
          name="crescent"
          class="loading-spinner"
        ></ion-spinner>

        <div v-else-if="groups.length === 0" class="empty-state">
          <ion-icon :icon="peopleOutline" class="empty-icon"></ion-icon>
          <h3>{{ $t("main.noGroups") }}</h3>
          <p>{{ $t("main.groupsWillAppear") }}</p>
        </div>

        <div v-else class="groups-grid">
          <ion-card
            v-for="group in groups"
            :key="group.id"
            class="group-card shadow-none"
            @click="openGroup(group)"
          >
            <ion-card-header>
              <div class="card-header-wrapper">
                <div class="title-section">
                  <ion-card-title>{{ group.name }}</ion-card-title>
                  <ion-card-subtitle>{{
                    `${group.level?.level} - ${group.level?.title}` ||
                    "No Course"
                  }}</ion-card-subtitle>
                </div>
                <ion-button
                  fill="clear"
                  color="danger"
                  size="small"
                  class="delete-btn"
                  @click.stop="confirmDeleteGroup(group)"
                >
                  <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
                </ion-button>
              </div>
            </ion-card-header>

            <ion-card-content>
              <div class="group-info">
                <div class="info-item">
                  <ion-icon :icon="peopleOutline"></ion-icon>
                  <span
                    >{{ group.studentCount || 0 }}
                    {{ $t("main.students") }}</span
                  >
                </div>

                <div class="info-item" v-if="group.room">
                  <ion-icon :icon="locationOutline"></ion-icon>
                  <span>{{ $t("main.room") }} {{ group.room }}</span>
                </div>
              </div>

              <div class="group-status" :class="getStatusClass(group.status)">
                {{ group.status || "Active" }}
              </div>
            </ion-card-content>
          </ion-card>
        </div>
        </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonButton,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  toastController,
  modalController,
  alertController,
  IonGrid,
  IonRow,
  IOnCol
} from "@ionic/vue";
import {
  peopleOutline,
  locationOutline,
  refresh,
  schoolOutline,
  addOutline,
  trashOutline,
} from "ionicons/icons";
// @ts-expect-error - API module uses CommonJS
import { groupsAPI, groupStudentsAPI } from "@/utils/api.js";
import CreateGroupModal from "@/components/CreateGroupModal.vue";

const router = useRouter();
const { t } = useI18n();
const groups = ref<any[]>([]);
const isLoading = ref(false);
const totalStudentCount = ref(0);

const loadGroups = async () => {
  isLoading.value = true;

  try {
    const userString = localStorage.getItem("user");
    if (!userString) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(userString);
    const teacherId = user.id;

    const response = await groupsAPI.getByTeacherId(teacherId);
    groups.value = response || [];

    // Get total student count for teacher
    try {
      const studentCountData = await groupStudentsAPI.getTeacherStudentCount(
        teacherId
      );
      totalStudentCount.value = studentCountData?.count || 0;
    } catch (error) {
      console.error("Error loading student count:", error);
      totalStudentCount.value = 0;
    }

    // Load student count for each group
    for (const group of groups.value) {
      try {
        const studentsData = await groupsAPI.getStudents(group.id);
        group.studentCount = studentsData?.students?.length || 0;
      } catch (error) {
        console.error("Error loading students for group:", error);
        group.studentCount = 0;
      }
    }
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

const handleRefresh = async (event: any) => {
  await loadGroups();
  event.target.complete();
};

const openGroup = (group: any) => {
  // Navigate to group details page
  router.push(`/group/${group.id}`);
};

const confirmDeleteGroup = async (group: any) => {
  const alert = await alertController.create({
    header: t("main.deleteGroup"),
    message: t("main.confirmDeleteGroup", { name: group.name }),
    buttons: [
      {
        text: t("common.cancel"),
        role: "cancel",
      },
      {
        text: t("common.delete"),
        role: "destructive",
        handler: async () => {
          await deleteGroup(group.id);
        },
      },
    ],
  });

  await alert.present();
};

const deleteGroup = async (groupId: string) => {
  try {
    await groupsAPI.delete(groupId);

    const toast = await toastController.create({
      message: t("main.groupDeleted"),
      duration: 2000,
      color: "success",
    });
    await toast.present();

    // Reload groups
    await loadGroups();
  } catch (error: any) {
    console.error("Error deleting group:", error);

    const toast = await toastController.create({
      message: error.message || t("common.error"),
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  }
};

const openCreateGroupModal = async () => {
  const modal = await modalController.create({
    component: CreateGroupModal,
  });

  await modal.present();

  const { data } = await modal.onWillDismiss();

  if (data?.created) {
    // Reload groups after successful creation
    await loadGroups();
  }
};

const getStatusClass = (status: string) => {
  if (!status) return "status-active";

  switch (status.toLowerCase()) {
    case "active":
      return "status-active";
    case "completed":
      return "status-completed";
    case "paused":
      return "status-paused";
    default:
      return "status-active";
  }
};

onMounted(() => {
  loadGroups();
});
</script>

<style scoped>
.groups-container {
  padding: 16px;
  min-height: 100%;
}

.stats-card {
  background: linear-gradient(
    135deg,
    var(--ion-color-primary),
    var(--ion-color-primary-shade)
  );
  color: white;
  margin: 0;
  margin-bottom: 24px;
}

.stats-card ion-card-content {
  padding: 20px;
}

.stats-content {
  display: flex;
  gap: 24px;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.stat-icon {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 10px;
  margin: 0 0 4px;
  opacity: 0.9;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 25px;
  font-weight: 700;
  margin: 0;
  line-height: 1;
}

.loading-spinner {
  display: block;
  margin: 100px auto;
  width: 50px;
  height: 50px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 80px;
  color: var(--ion-color-medium);
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--ion-color-dark);
}

.empty-state p {
  font-size: 14px;
  color: var(--ion-color-medium);
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.group-card {
  margin: 0;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  border-radius: 18px;
}

.card-header-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.title-section {
  flex: 1;
  min-width: 0;
}

.delete-btn {
  flex-shrink: 0;
  margin: -8px -8px 0 0;
}

.group-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.group-card ion-card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.group-card ion-card-subtitle {
  font-size: 14px;
  margin-top: 4px;
}

.group-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--ion-color-medium-shade);
}

.info-item ion-icon {
  font-size: 18px;
  color: var(--ion-color-primary);
}

.group-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-active {
  background-color: rgba(var(--ion-color-success-rgb), 0.1);
  color: var(--ion-color-success);
}

.status-completed {
  background-color: rgba(var(--ion-color-medium-rgb), 0.1);
  color: var(--ion-color-medium);
}

.status-paused {
  background-color: rgba(var(--ion-color-warning-rgb), 0.1);
  color: var(--ion-color-warning);
}

@media (max-width: 768px) {
  .groups-grid {
    grid-template-columns: 1fr;
  }
}
</style>
