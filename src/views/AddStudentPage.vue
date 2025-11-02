<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
            :default-href="`/group/${groupId}`"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>{{ $t("addStudent.title") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="add-student-container">
        <!-- Search Bar -->
        <ion-searchbar
          v-model="searchQuery"
          :placeholder="$t('addStudent.searchPlaceholder')"
          @ionInput="handleSearch"
        ></ion-searchbar>

        <!-- Loading -->
        <ion-spinner
          v-if="isLoading"
          name="crescent"
          class="loading-spinner"
        ></ion-spinner>

        <!-- Empty State -->
        <div v-else-if="filteredStudents.length === 0" class="empty-state">
          <ion-icon :icon="searchOutline" class="empty-icon"></ion-icon>
          <h3>{{ $t("addStudent.noStudentsFound") }}</h3>
          <p>{{ $t("addStudent.tryDifferentSearch") }}</p>
        </div>

        <!-- Students List -->
        <ion-list v-else class="students-list">
          <ion-item
            v-for="student in filteredStudents"
            :key="student.id || student.user_id"
            button
            @click="selectStudent(student)"
            class="student-item"
          >
            <div class="student-avatar" slot="start">
              <img
                v-if="student.avatar_url"
                :src="student.avatar_url"
                :alt="student.first_name"
              />
              <ion-icon v-else :icon="personCircleOutline"></ion-icon>
            </div>

            <ion-label>
              <h2>{{ student.first_name }} {{ student.last_name }}</h2>
              <p>@{{ student.username }}</p>
              <p v-if="student.email">{{ student.email }}</p>
            </ion-label>

            <ion-icon
              v-if="isStudentInGroup(student.id || student.user_id)"
              :icon="checkmarkCircleOutline"
              color="success"
              slot="end"
            ></ion-icon>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonSpinner,
  toastController,
  alertController,
} from "@ionic/vue";
import {
  personCircleOutline,
  searchOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
// @ts-expect-error - API module doesn't have type definitions
import { studentsAPI, groupsAPI, groupStudentsAPI } from "@/utils/api.js";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const groupId = ref<string>("");
const searchQuery = ref<string>("");
const allStudents = ref<any[]>([]);
const groupStudents = ref<any[]>([]);
const isLoading = ref(false);

const filteredStudents = computed(() => {
  if (!searchQuery.value) {
    return allStudents.value;
  }

  const query = searchQuery.value.toLowerCase();
  return allStudents.value.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const username = student.username?.toLowerCase() || "";
    const email = student.email?.toLowerCase() || "";

    return (
      fullName.includes(query) ||
      username.includes(query) ||
      email.includes(query)
    );
  });
});

const loadStudents = async () => {
  isLoading.value = true;

  try {
    // Load all students
    const students = await studentsAPI.getAll();
    allStudents.value = students || [];

    // Load current group students
    const groupData = await groupsAPI.getStudents(groupId.value);
    groupStudents.value = groupData?.students || [];
  } catch (error: any) {
    console.error("Error loading students:", error);

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
  // Filtering is reactive via computed property
};

const isStudentInGroup = (studentId: string) => {
  return groupStudents.value.some((s) => s.user_id === studentId);
};

const selectStudent = async (student: any) => {
  const studentId = student.id || student.user_id;

  // Check if already in group
  if (isStudentInGroup(studentId)) {
    const toast = await toastController.create({
      message: t("addStudent.alreadyInGroup"),
      duration: 2000,
      color: "warning",
    });
    await toast.present();
    return;
  }

  // Confirm adding student
  const alert = await alertController.create({
    header: t("addStudent.addStudent"),
    message: t("addStudent.confirmAddStudent", {
      name: `${student.first_name} ${student.last_name}`,
    }),
    buttons: [
      {
        text: t("common.cancel"),
        role: "cancel",
      },
      {
        text: t("common.ok"),
        handler: () => {
          addStudentToGroup(studentId);
        },
      },
    ],
  });

  await alert.present();
};

const addStudentToGroup = async (studentId: string) => {
  try {
    const groupStudentData = {
      group_id: groupId.value,
      student_id: studentId,
      status: "active",
      enrolled_at: new Date().toISOString(),
    };

    await groupStudentsAPI.addToGroup(groupStudentData);

    const toast = await toastController.create({
      message: t("addStudent.studentAdded"),
      duration: 2000,
      color: "success",
    });
    await toast.present();

    // Reload students to update the checkmarks
    await loadStudents();
  } catch (error: any) {
    console.error("Error adding student to group:", error);

    const toast = await toastController.create({
      message: error.message || t("addStudent.failedToAdd"),
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  }
};

onMounted(() => {
  groupId.value = route.params.id as string;

  if (!groupId.value) {
    router.replace("/tabs/main");
    return;
  }

  loadStudents();
});
</script>

<style scoped>
.add-student-container {
  padding: 0;
  min-height: 100%;
}

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

.students-list {
  background: transparent;
  padding: 0 16px;
}

.student-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;
}

.student-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ion-color-light);
  margin-right: 12px;
}

.student-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.student-avatar ion-icon {
  font-size: 50px;
  color: var(--ion-color-medium);
}

.student-item h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--ion-color-dark);
}

.student-item p {
  font-size: 13px;
  color: var(--ion-color-medium);
  margin: 0 0 2px;
}
</style>
