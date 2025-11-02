<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/tabs/main"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ groupName }}</ion-title>
        <ion-buttons slot="end">
          <ion-button
            v-if="selectedSegment === 'students'"
            @click="goToAddStudent"
          >
            <ion-icon :icon="addOutline"></ion-icon>
          </ion-button>
          <ion-button @click="loadGroupData">
            <ion-icon :icon="refresh"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>

      <ion-toolbar>
        <ion-segment v-model="selectedSegment" @ionChange="segmentChanged">
          <ion-segment-button value="students">
            <ion-label>{{ $t("groupDetails.students") }}</ion-label>
          </ion-segment-button>
          <ion-segment-button value="attendance">
            <ion-label>{{ $t("groupDetails.attendance") }}</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Students Segment -->
      <div v-show="selectedSegment === 'students'" class="segment-content">
        <ion-spinner
          v-if="isLoading"
          name="crescent"
          class="loading-spinner"
        ></ion-spinner>

        <div v-else-if="students.length === 0" class="empty-state">
          <ion-icon :icon="peopleOutline" class="empty-icon"></ion-icon>
          <h3>{{ $t("groupDetails.noStudents") }}</h3>
          <p>{{ $t("groupDetails.noStudentsEnrolled") }}</p>
        </div>

        <ion-list v-else class="students-list">
          <ion-item
            v-for="student in students"
            :key="student.user_id"
            button
            @click="showStudentOptions(student)"
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
            </ion-label>

            <div slot="end" class="student-status">
              <ion-badge
                :color="
                  student.GroupStudent?.status === 'active'
                    ? 'success'
                    : 'medium'
                "
              >
                {{ student.GroupStudent?.status || "active" }}
              </ion-badge>
            </div>
          </ion-item>
        </ion-list>
      </div>

      <!-- Attendance Segment -->
      <div v-show="selectedSegment === 'attendance'" class="segment-content">
        <div class="attendance-controls">
          <ion-button
            @click="showDatePicker"
            fill="outline"
            size="small"
            class="date-picker-button"
          >
            <ion-icon :icon="calendarOutline" slot="start"></ion-icon>
            {{ formatDateDisplay(selectedDate) }}
          </ion-button>

          <ion-button
            @click="saveAttendance"
            color="primary"
            size="small"
            :disabled="!hasAttendanceChanges"
          >
            <ion-icon :icon="saveOutline" slot="start"></ion-icon>
            {{ $t("groupDetails.save") }}
          </ion-button>
        </div>

        <ion-spinner
          v-if="isLoadingAttendance"
          name="crescent"
          class="loading-spinner"
        ></ion-spinner>

        <div v-else-if="students.length === 0" class="empty-state">
          <ion-icon :icon="calendarOutline" class="empty-icon"></ion-icon>
          <h3>{{ $t("groupDetails.noStudents") }}</h3>
          <p>{{ $t("groupDetails.addStudentsToMark") }}</p>
        </div>

        <ion-list v-else class="attendance-list">
          <ion-item
            v-for="student in students"
            :key="student.user_id"
            class="attendance-item"
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
              <h3>{{ student.first_name }} {{ student.last_name }}</h3>
              <p>{{ student.username }}</p>
            </ion-label>

            <div slot="end" class="attendance-buttons">
              <ion-button
                :color="
                  getAttendanceStatus(student.user_id) === 'present'
                    ? 'success'
                    : 'light'
                "
                size="small"
                @click="markAttendance(student.user_id, 'present')"
              >
                <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
              </ion-button>

              <ion-button
                :color="
                  getAttendanceStatus(student.user_id) === 'absent'
                    ? 'danger'
                    : 'light'
                "
                size="small"
                @click="markAttendance(student.user_id, 'absent')"
              >
                <ion-icon :icon="closeCircleOutline"></ion-icon>
              </ion-button>
            </div>
          </ion-item>
        </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonBackButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonBadge,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  toastController,
  alertController,
  actionSheetController,
} from "@ionic/vue";
import {
  peopleOutline,
  personCircleOutline,
  calendarOutline,
  refresh,
  checkmarkCircleOutline,
  closeCircleOutline,
  saveOutline,
  addOutline,
} from "ionicons/icons";
// @ts-expect-error - API module doesn't have type definitions
import { groupsAPI, attendanceAPI, groupStudentsAPI } from "@/utils/api.js";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const groupId = ref<string>("");
const groupName = ref<string>(t("groupDetails.groupDetails"));
const selectedSegment = ref<string>("students");
const students = ref<any[]>([]);
const isLoading = ref(false);
const isLoadingAttendance = ref(false);

// Attendance data
const selectedDate = ref<string>(new Date().toISOString().split("T")[0]);
const attendanceRecords = ref<Map<string, string>>(new Map());
const originalAttendance = ref<Map<string, string>>(new Map());

const hasAttendanceChanges = computed(() => {
  if (attendanceRecords.value.size !== originalAttendance.value.size) {
    return true;
  }
  for (const [key, value] of attendanceRecords.value) {
    if (originalAttendance.value.get(key) !== value) {
      return true;
    }
  }
  return false;
});

const loadGroupData = async () => {
  isLoading.value = true;

  try {
    // Load group details
    const group = await groupsAPI.getById(groupId.value);
    groupName.value = group?.name || t("groupDetails.groupDetails");

    // Load students
    const studentsData = await groupsAPI.getStudents(groupId.value);
    students.value = studentsData?.students || [];
  } catch (error: any) {
    console.error("Error loading group data:", error);

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

const loadAttendance = async () => {
  isLoadingAttendance.value = true;

  try {
    const startDate = selectedDate.value;
    const endDate = selectedDate.value;

    const attendanceData = await attendanceAPI.getByGroupIdAndDateRange(
      groupId.value,
      startDate,
      endDate
    );

    // Clear existing records
    attendanceRecords.value.clear();
    originalAttendance.value.clear();

    // Populate attendance records
    if (attendanceData && attendanceData.length > 0) {
      attendanceData.forEach((record: any) => {
        attendanceRecords.value.set(record.student_id, record.status);
        originalAttendance.value.set(record.student_id, record.status);
      });
    }
  } catch (error: any) {
    console.error("Error loading attendance:", error);
  } finally {
    isLoadingAttendance.value = false;
  }
};

const segmentChanged = (event: any) => {
  selectedSegment.value = event.detail.value;

  if (selectedSegment.value === "attendance") {
    loadAttendance();
  }
};

const handleRefresh = async (event: any) => {
  await loadGroupData();

  if (selectedSegment.value === "attendance") {
    await loadAttendance();
  }

  event.target.complete();
};

const getAttendanceStatus = (studentId: string) => {
  return attendanceRecords.value.get(studentId) || null;
};

const markAttendance = (studentId: string, status: string) => {
  const currentStatus = attendanceRecords.value.get(studentId);

  if (currentStatus === status) {
    // Toggle off if clicking the same status
    attendanceRecords.value.delete(studentId);
  } else {
    attendanceRecords.value.set(studentId, status);
  }

  // Force reactivity update
  attendanceRecords.value = new Map(attendanceRecords.value);
};

const saveAttendance = async () => {
  try {
    const userString = localStorage.getItem("user");
    if (!userString) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(userString);
    const teacherId = user.id;

    const attendanceData = Array.from(attendanceRecords.value.entries()).map(
      ([studentId, status]) => ({
        group_id: groupId.value,
        student_id: studentId,
        teacher_id: teacherId,
        date: selectedDate.value,
        status: status,
      })
    );

    if (attendanceData.length === 0) {
      const toast = await toastController.create({
        message: "No attendance records to save",
        duration: 2000,
        color: "warning",
      });
      await toast.present();
      return;
    }

    await attendanceAPI.createBulk(attendanceData);

    // Update original records
    originalAttendance.value = new Map(attendanceRecords.value);

    const toast = await toastController.create({
      message: t("groupDetails.attendanceSaved"),
      duration: 2000,
      color: "success",
    });
    await toast.present();
  } catch (error: any) {
    console.error("Error saving attendance:", error);

    const toast = await toastController.create({
      message: error.message || t("groupDetails.failedToSave"),
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  }
};

const showDatePicker = async () => {
  const alert = await alertController.create({
    header: t("groupDetails.selectDate"),
    inputs: [
      {
        name: "date",
        type: "date",
        value: selectedDate.value,
        attributes: {
          max: new Date().toISOString().split("T")[0],
        },
      },
    ],
    buttons: [
      {
        text: t("common.cancel"),
        role: "cancel",
      },
      {
        text: t("groupDetails.select"),
        handler: (data) => {
          if (data.date) {
            selectedDate.value = data.date;
            loadAttendance();
          }
        },
      },
    ],
  });

  await alert.present();
};

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return t("groupDetails.selectDate");

  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDateObj = new Date(date);
  selectedDateObj.setHours(0, 0, 0, 0);

  if (selectedDateObj.getTime() === today.getTime()) {
    return t("groupDetails.today");
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const goToAddStudent = () => {
  router.push(`/group/${groupId.value}/add-student`);
};

const showStudentOptions = async (student: any) => {
  const groupStudent = student.GroupStudent;

  if (!groupStudent) {
    const toast = await toastController.create({
      message: t("common.error"),
      duration: 2000,
      color: "danger",
    });
    await toast.present();
    return;
  }

  const buttons = [];

  // Status update buttons
  if (groupStudent.status !== "active") {
    buttons.push({
      text: t("groupDetails.setActive"),
      handler: () => {
        updateStudentStatus(groupStudent.id, "active");
      },
    });
  }

  if (groupStudent.status !== "frozen") {
    buttons.push({
      text: t("groupDetails.setFrozen"),
      handler: () => {
        updateStudentStatus(groupStudent.id, "frozen");
      },
    });
  }


  // Delete button
  buttons.push({
    text: t("groupDetails.deleteFromGroup"),
    role: "destructive",
    handler: () => {
      confirmDeleteStudent(
        groupStudent.id,
        student.first_name + " " + student.last_name
      );
    },
  });

  // Cancel button
  buttons.push({
    text: t("common.cancel"),
    role: "cancel",
  });

  const actionSheet = await actionSheetController.create({
    header: `${student.first_name} ${student.last_name}`,
    subHeader: t("groupDetails.manageStudent"),
    buttons,
  });

  await actionSheet.present();
};

const updateStudentStatus = async (groupStudentId: string, status: string) => {
  try {
    await groupStudentsAPI.updateStatus(groupStudentId, status);

    const toast = await toastController.create({
      message: t("groupDetails.statusUpdated"),
      duration: 2000,
      color: "success",
    });
    await toast.present();

    // Reload students
    await loadGroupData();
  } catch (error: any) {
    console.error("Error updating student status:", error);

    const toast = await toastController.create({
      message: error.message || t("common.error"),
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  }
};

const confirmDeleteStudent = async (
  groupStudentId: string,
  studentName: string
) => {
  const alert = await alertController.create({
    header: t("groupDetails.deleteStudent"),
    message: t("groupDetails.confirmDeleteStudent", { name: studentName }),
    buttons: [
      {
        text: t("common.cancel"),
        role: "cancel",
      },
      {
        text: t("common.delete"),
        role: "destructive",
        handler: () => {
          deleteStudent(groupStudentId);
        },
      },
    ],
  });

  await alert.present();
};

const deleteStudent = async (groupStudentId: string) => {
  try {
    await groupStudentsAPI.removeFromGroup(groupStudentId);

    const toast = await toastController.create({
      message: t("groupDetails.studentDeleted"),
      duration: 2000,
      color: "success",
    });
    await toast.present();

    // Reload students
    await loadGroupData();
  } catch (error: any) {
    console.error("Error deleting student:", error);

    const toast = await toastController.create({
      message: error.message || t("common.error"),
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

  loadGroupData();
});
</script>

<style scoped>
.segment-content {
  padding: 16px;
  min-height: calc(100vh - 112px);
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

/* Students List Styles */
.students-list {
  background: transparent;
  padding: 0;
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
  margin: 0;
}

.student-phone {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px !important;
}

.student-phone ion-icon {
  font-size: 14px;
}

.student-status {
  display: flex;
  align-items: center;
}

/* Attendance Styles */
.attendance-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}

.date-picker-button {
  flex: 1;
}

.attendance-list {
  background: transparent;
  padding: 0;
}

.attendance-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  margin-bottom: 12px;
  border-radius: 12px;
  overflow: hidden;
}

.attendance-item h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--ion-color-dark);
}

.attendance-buttons {
  display: flex;
  gap: 8px;
}

.attendance-buttons ion-button {
  --padding-start: 8px;
  --padding-end: 8px;
  margin: 0;
  min-width: 42px;
}

.attendance-buttons ion-icon {
  font-size: 20px;
}

@media (max-width: 576px) {
  .attendance-buttons {
    gap: 4px;
  }

  .attendance-buttons ion-button {
    --padding-start: 6px;
    --padding-end: 6px;
    min-width: 38px;
  }

  .attendance-buttons ion-icon {
    font-size: 18px;
  }
}
</style>
