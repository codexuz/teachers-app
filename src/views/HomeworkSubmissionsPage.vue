<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar class="custom-toolbar">
        <ion-buttons slot="start">
          <ion-back-button
            :default-href="`/group/${groupId}/homeworks`"
            class="custom-back-button"
          ></ion-back-button>
        </ion-buttons>
        <ion-title class="custom-title">{{
          $t("homeworkSubmissions.title")
        }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="custom-content">
      <div class="content-wrapper">
        <!-- Loading spinner -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-content">
            <ion-spinner name="crescent" class="loading-spinner"></ion-spinner>
            <p class="loading-text">{{ $t("common.loading") }}</p>
          </div>
        </div>

        <!-- Submissions content -->
        <div v-else class="submissions-content">
          <!-- Summary cards -->
          <div v-if="submissions.length > 0" class="summary-section">
            <div class="summary-grid">
              <div class="summary-card-item">
                <div class="card-icon submissions-icon">
                  <ion-icon :icon="peopleOutline"></ion-icon>
                </div>
                <div class="card-content">
                  <span class="card-number">{{ submissions.length }}</span>
                  <span class="card-label">{{
                    $t("homeworkSubmissions.totalSubmissions")
                  }}</span>
                </div>
              </div>

              <div class="summary-card-item">
                <div class="card-icon score-icon">
                  <ion-icon :icon="trophyOutline"></ion-icon>
                </div>
                <div class="card-content">
                  <span class="card-number"
                    >{{ averageScore.toFixed(1) }}%</span
                  >
                  <span class="card-label">{{
                    $t("homeworkSubmissions.averageScore")
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Students submissions -->
          <div class="submissions-list">
            <div
              v-for="(submission, index) in submissions"
              :key="submission.id"
              class="submission-card"
              :style="{ animationDelay: `${index * 0.1}s` }"
              @click="viewSubmission(submission)"
            >
              <div class="submission-rank">
                <span class="rank-number">#{{ index + 1 }}</span>
              </div>

              <div class="submission-info">
                <div class="student-details">
                  <h3 class="student-name">
                    {{ getStudentName(submission.student) }}
                  </h3>
                  <p class="student-username">
                    @{{ submission.student.username }}
                  </p>
                </div>

                <div class="submission-metrics">
                  <div class="metric-item">
                    <ion-icon
                      :icon="checkmarkCircleOutline"
                      class="metric-icon"
                    ></ion-icon>
                    <span
                      >{{ submission.sections.length }}
                      {{ $t("homeworkSubmissions.exercises") }}</span
                    >
                  </div>
                  <div class="metric-item">
                    <ion-icon
                      :icon="timeOutline"
                      class="metric-icon"
                    ></ion-icon>
                    <span>{{ formatDate(submission.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <div class="submission-score">
                <div
                  class="score-circle"
                  :class="getScoreColorClass(submission.overallScore)"
                >
                  <span class="score-value"
                    >{{ submission.overallScore.toFixed(0) }}%</span
                  >
                </div>
                <div class="score-label">
                  {{ getScoreLabel(submission.overallScore) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div v-if="!submissions.length && !isLoading" class="empty-state">
            <div class="empty-illustration">
              <ion-icon
                :icon="documentTextOutline"
                class="empty-icon"
              ></ion-icon>
            </div>
            <div class="empty-content">
              <h3 class="empty-title">
                {{ $t("homeworkSubmissions.noSubmissions") }}
              </h3>
              <p class="empty-description">
                {{ $t("homeworkSubmissions.noSubmissionsDescription") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonSpinner,
  toastController,
  modalController,
} from "@ionic/vue";
import {
  documentTextOutline,
  peopleOutline,
  trophyOutline,
  checkmarkCircleOutline,
  timeOutline,
} from "ionicons/icons";
// @ts-expect-error - API module doesn't have type definitions
import { homeworkSubmissionsAPI } from "@/utils/api.js";
import SubmissionDetailModal from "@/components/SubmissionDetailModal.vue";

const { t } = useI18n();
const route = useRoute();

const submissions = ref<any[]>([]);
const isLoading = ref(false);
const homeworkId = route.params.homeworkId as string;
const groupId = route.params.id as string;

const loadSubmissions = async () => {
  isLoading.value = true;

  try {
    // Fetch submissions for the homework
    const homeworkSubmissions = await homeworkSubmissionsAPI.getByHomeworkId(
      homeworkId
    );

    // Process submissions to calculate overall scores
    const processedSubmissions = (homeworkSubmissions || []).map(
      (submission: any) => {
        const overallScore = calculateOverallScore(submission.sections);
        return {
          ...submission,
          overallScore,
        };
      }
    );

    // Sort by overall score descending (highest scores first)
    submissions.value = processedSubmissions.sort(
      (a: any, b: any) => b.overallScore - a.overallScore
    );
  } catch (error: any) {
    console.error("Error loading submissions:", error);

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

const calculateOverallScore = (sections: any[]) => {
  if (!sections || sections.length === 0) return 0;

  const totalScore = sections.reduce(
    (sum, section) => sum + (section.score || 0),
    0
  );
  return totalScore / sections.length;
};

const averageScore = computed(() => {
  if (submissions.value.length === 0) return 0;

  const totalScore = submissions.value.reduce(
    (sum, submission) => sum + submission.overallScore,
    0
  );
  return totalScore / submissions.value.length;
});

const getStudentName = (student: any) => {
  return (
    `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
    student.username
  );
};

const getScoreColorClass = (score: number) => {
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "average";
  return "poor";
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return t("homeworkSubmissions.excellent");
  if (score >= 70) return t("homeworkSubmissions.good");
  if (score >= 50) return t("homeworkSubmissions.average");
  return t("homeworkSubmissions.needsWork");
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const viewSubmission = async (submission: any) => {
  const modal = await modalController.create({
    component: SubmissionDetailModal,
    componentProps: {
      submission: submission,
    },
    presentingElement: document.querySelector("ion-router-outlet") || undefined,
  });

  await modal.present();
};

onMounted(() => {
  loadSubmissions();
});
</script>

<style scoped>
/* Header Styling */
.custom-toolbar {
  --background: linear-gradient(
    135deg,
    var(--ion-color-primary) 0%,
    var(--ion-color-primary-shade) 100%
  );
  --color: white;
}

.custom-title {
  font-weight: 600;
  color: white;
}

.custom-back-button {
  --color: white;
}

/* Content Layout */
.custom-content {
  --background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
}

.content-wrapper {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  --color: var(--ion-color-primary);
}

.loading-text {
  color: var(--ion-color-medium);
  font-size: 16px;
  margin: 0;
}

/* Summary Section */
.summary-section {
  margin-bottom: 32px;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.summary-card-item {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(var(--ion-color-primary-rgb), 0.1);
  transition: all 0.3s ease;
}

.summary-card-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.submissions-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.score-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.card-content {
  display: flex;
  flex-direction: column;
}

.card-number {
  font-size: 24px;
  font-weight: bold;
  color: var(--ion-color-primary);
  line-height: 1;
}

.card-label {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 4px;
  font-weight: 500;
}

/* Submissions List */
.submissions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.submission-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: grid;
  grid-template-columns: auto auto 1fr auto auto;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(var(--ion-color-primary-rgb), 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  animation: slideInUp 0.5s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.submission-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-color: var(--ion-color-primary);
}

.submission-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(
    135deg,
    var(--ion-color-tertiary),
    var(--ion-color-tertiary-shade)
  );
  border-radius: 8px;
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.student-avatar {
  position: relative;
  width: 56px;
  height: 56px;
}

.avatar-image,
.avatar-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  object-fit: cover;
}

.avatar-placeholder {
  background: linear-gradient(
    135deg,
    var(--ion-color-primary),
    var(--ion-color-primary-shade)
  );
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 20px;
}

.status-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.excellent {
  background: #22c55e;
}

.status-indicator.good {
  background: #f59e0b;
}

.status-indicator.average {
  background: #6b7280;
}

.status-indicator.poor {
  background: #ef4444;
}

.submission-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.student-details {
  margin: 0;
}

.student-name {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.student-username {
  margin: 0;
  font-size: 14px;
  color: var(--ion-color-medium);
}

.submission-metrics {
  display: flex;
  gap: 16px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.metric-icon {
  font-size: 16px;
  color: var(--ion-color-primary);
}

.submission-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 3px solid;
}

.score-circle.excellent {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
  color: #22c55e;
}

.score-circle.good {
  background: rgba(245, 158, 11, 0.1);
  border-color: #f59e0b;
  color: #f59e0b;
}

.score-circle.average {
  background: rgba(107, 114, 128, 0.1);
  border-color: #6b7280;
  color: #6b7280;
}

.score-circle.poor {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.score-value {
  font-size: 16px;
  font-weight: bold;
}

.score-label {
  font-size: 10px;
  color: var(--ion-color-medium);
  text-align: center;
  font-weight: 500;
}

.submission-chevron {
  color: var(--ion-color-medium);
  font-size: 20px;
  transition: transform 0.2s ease;
}

.submission-card:hover .submission-chevron {
  transform: translateX(4px);
  color: var(--ion-color-primary);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  color: var(--ion-color-medium);
  min-height: 50vh;
}

.empty-illustration {
  position: relative;
  margin-bottom: 32px;
}

.empty-icon {
  font-size: 80px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.empty-content {
  max-width: 300px;
}

.empty-title {
  margin: 0 0 8px 0;
  font-weight: 600;
  font-size: 20px;
  color: var(--ion-color-dark);
}

.empty-description {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ion-color-medium);
}

/* Responsive Design */
@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .submission-card {
    grid-template-columns: auto 1fr auto;
    gap: 12px;
  }

  .submission-rank {
    order: -1;
    grid-column: span 3;
    width: 24px;
    height: 24px;
    font-size: 12px;
    justify-self: start;
  }

  .student-avatar {
    width: 48px;
    height: 48px;
  }

  .avatar-image,
  .avatar-placeholder {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }

  .avatar-placeholder {
    font-size: 16px;
  }

  .submission-metrics {
    flex-direction: column;
    gap: 4px;
  }

  .score-circle {
    width: 48px;
    height: 48px;
  }

  .score-value {
    font-size: 14px;
  }
}
</style>
