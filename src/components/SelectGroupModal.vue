<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>{{
          $t("groupDetails.selectTargetGroup", { name: studentName })
        }}</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="closeModal">
            {{ $t("common.cancel") }}
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Search Bar -->
      <ion-searchbar
        v-model="searchQuery"
        :placeholder="$t('groupDetails.searchGroups')"
        @ionInput="handleSearch"
      ></ion-searchbar>

      <!-- Loading -->
      <ion-spinner
        v-if="isLoading"
        name="crescent"
        class="loading-spinner"
      ></ion-spinner>

      <!-- Empty State -->
      <div v-else-if="filteredGroups.length === 0" class="empty-state">
        <ion-icon :icon="searchOutline" class="empty-icon"></ion-icon>
        <h3>{{ $t("groupDetails.noGroupsFound") }}</h3>
        <p>{{ $t("groupDetails.tryDifferentSearch") }}</p>
      </div>

      <!-- Groups List -->
      <ion-list v-else class="groups-list">
        <ion-item
          v-for="group in displayedGroups"
          :key="group.id"
          button
          @click="selectGroup(group)"
          class="group-item"
        >
          <ion-label>
            <h2>{{ group.name }}</h2>
            <p v-if="group.level">
              {{ group.level.level }} - {{ group.level.title }}
            </p>
            <p v-if="group.teacher">
              {{ $t("groupDetails.teacher") }}: {{ group.teacher.first_name }}
              {{ group.teacher.last_name }}
            </p>
          </ion-label>

          <ion-icon
            v-if="group.id === currentGroupId"
            :icon="checkmarkCircleOutline"
            color="medium"
            slot="end"
          ></ion-icon>
        </ion-item>
      </ion-list>

      <!-- Infinite Scroll -->
      <ion-infinite-scroll
        v-if="!isLoading && displayedGroups.length < filteredGroups.length"
        @ionInfinite="loadMore"
        threshold="100px"
      >
        <ion-infinite-scroll-content
          loading-spinner="crescent"
          :loading-text="$t('common.loading')"
        >
        </ion-infinite-scroll-content>
      </ion-infinite-scroll>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  modalController,
  toastController,
} from "@ionic/vue";
import { searchOutline, checkmarkCircleOutline } from "ionicons/icons";
// @ts-expect-error - API module doesn't have type definitions
import { groupsAPI } from "@/utils/api.js";

interface Props {
  studentName: string;
  currentGroupId: string;
}

const props = defineProps<Props>();
const { t } = useI18n();

const searchQuery = ref<string>("");
const allGroups = ref<any[]>([]);
const isLoading = ref(false);
const displayedCount = ref(20); // Initial number of items to display
const ITEMS_PER_PAGE = 20;

const filteredGroups = computed(() => {
  const groups = allGroups.value.filter((g) => g.id !== props.currentGroupId);

  if (!searchQuery.value) {
    return groups;
  }

  const query = searchQuery.value.toLowerCase();
  return groups.filter((group) => {
    const name = group.name?.toLowerCase() || "";
    const level = group.level?.level?.toLowerCase() || "";
    const title = group.level?.title?.toLowerCase() || "";
    const teacherName = group.teacher
      ? `${group.teacher.first_name} ${group.teacher.last_name}`.toLowerCase()
      : "";

    return (
      name.includes(query) ||
      level.includes(query) ||
      title.includes(query) ||
      teacherName.includes(query)
    );
  });
});

const displayedGroups = computed(() => {
  return filteredGroups.value.slice(0, displayedCount.value);
});

const loadGroups = async () => {
  isLoading.value = true;

  try {
    // Get all groups
    const groups = await groupsAPI.getAll();
    allGroups.value = groups || [];
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

const handleSearch = () => {
  // Reset displayed count when search changes
  displayedCount.value = ITEMS_PER_PAGE;
};

const loadMore = (event: any) => {
  setTimeout(() => {
    displayedCount.value += ITEMS_PER_PAGE;
    event.target.complete();
  }, 500);
};

const selectGroup = (group: any) => {
  modalController.dismiss({ selectedGroup: group });
};

const closeModal = () => {
  modalController.dismiss();
};

// Watch for search query changes to reset displayed count
watch(searchQuery, () => {
  displayedCount.value = ITEMS_PER_PAGE;
});

onMounted(() => {
  loadGroups();
});
</script>

<style scoped>
ion-searchbar {
  --background: var(--ion-color-light);
  padding: 16px;
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

.groups-list {
  background: transparent;
  padding: 0 16px;
}

.group-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;
}

.group-item h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--ion-color-dark);
}

.group-item p {
  font-size: 13px;
  color: var(--ion-color-medium);
  margin: 0 0 2px;
}
</style>
