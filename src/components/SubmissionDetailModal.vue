<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="dismiss">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ $t("submissionDetails.title") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="submission-detail-content">
        <!-- Student Header -->
        <div class="student-header">
          <div class="student-avatar">
            <img
              v-if="submission.student.avatar_url"
              :src="submission.student.avatar_url"
              :alt="getStudentName(submission.student)"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              {{ getStudentInitials(submission.student) }}
            </div>
          </div>

          <div class="student-info">
            <h2 class="student-name">
              {{ getStudentName(submission.student) }}
            </h2>
            <p class="student-username">@{{ submission.student.username }}</p>
            <p class="student-phone">{{ submission.student.phone }}</p>
          </div>

          <div class="overall-score">
            <div class="score-circle" :class="getScoreColorClass(overallScore)">
              <span class="score-value">{{ overallScore.toFixed(0) }}%</span>
            </div>
            <div class="score-label">{{ getScoreLabel(overallScore) }}</div>
          </div>
        </div>

        <!-- Submission Info -->
        <div class="submission-meta">
          <div class="meta-card">
            <ion-icon :icon="calendarOutline" class="meta-icon"></ion-icon>
            <div class="meta-content">
              <span class="meta-label">{{
                $t("submissionDetails.submittedOn")
              }}</span>
              <span class="meta-value">{{
                formatDate(submission.createdAt)
              }}</span>
            </div>
          </div>

          <div class="meta-card">
            <ion-icon
              :icon="checkmarkCircleOutline"
              class="meta-icon"
            ></ion-icon>
            <div class="meta-content">
              <span class="meta-label">{{
                $t("submissionDetails.exercisesCompleted")
              }}</span>
              <span class="meta-value">{{ submission.sections.length }}</span>
            </div>
          </div>
        </div>

        <!-- Sections List -->
        <div class="sections-container">
          <h3 class="sections-title">
            {{ $t("submissionDetails.exerciseResults") }}
          </h3>

          <ion-list class="sections-list">
            <ion-item
              v-for="(section, index) in submission.sections"
              :key="section.id"
              class="section-item"
            >
              <div class="section-number" slot="start">
                {{ index + 1 }}
              </div>

              <ion-label>
                <div class="section-header">
                  <h4 class="section-title">
                    {{ $t(`submissionDetails.sections.${section.section}`) }}
                  </h4>
                  <ion-chip
                    :color="getSectionScoreColor(section.score)"
                    size="small"
                    class="section-chip"
                  >
                    {{ section.score.toFixed(1) }}%
                  </ion-chip>
                </div>

                <div class="section-meta">
                  <span class="exercise-id"
                    >{{ $t("submissionDetails.exerciseId") }}:
                    {{ section.exercise_id.slice(0, 8) }}...</span
                  >
                  <span class="section-date">{{
                    formatDate(section.updatedAt)
                  }}</span>
                </div>
              </ion-label>

              <div class="section-score" slot="end">
                <div class="section-actions">
                  <ion-button
                    v-if="section.section === 'writing'"
                    fill="clear"
                    size="small"
                    @click="viewWritingAssessment(section)"
                    class="assessment-button"
                  >
                    <ion-icon
                      :icon="documentTextOutline"
                      slot="icon-only"
                    ></ion-icon>
                  </ion-button>
                </div>
                <div class="score-bar">
                  <div
                    class="score-fill"
                    :style="{ width: `${section.score}%` }"
                    :class="getSectionScoreColorClass(section.score)"
                  ></div>
                </div>
              </div>
            </ion-item>
          </ion-list>
        </div>

        <!-- Summary Stats -->
        <div class="summary-stats">
          <div class="stat-card">
            <div class="stat-value">{{ averageScore.toFixed(1) }}%</div>
            <div class="stat-label">
              {{ $t("submissionDetails.averageScore") }}
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-value">{{ highestScore.toFixed(1) }}%</div>
            <div class="stat-label">
              {{ $t("submissionDetails.highestScore") }}
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-value">{{ lowestScore.toFixed(1) }}%</div>
            <div class="stat-label">
              {{ $t("submissionDetails.lowestScore") }}
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  modalController,
} from "@ionic/vue";
import {
  closeOutline,
  calendarOutline,
  checkmarkCircleOutline,
  documentTextOutline,
} from "ionicons/icons";

interface Props {
  submission: any;
}

const props = defineProps<Props>();
const { t } = useI18n();
const router = useRouter();

const overallScore = computed(() => {
  if (!props.submission.sections || props.submission.sections.length === 0)
    return 0;
  const totalScore = props.submission.sections.reduce(
    (sum: number, section: any) => sum + (section.score || 0),
    0
  );
  return totalScore / props.submission.sections.length;
});

const averageScore = computed(() => overallScore.value);

const highestScore = computed(() => {
  if (!props.submission.sections || props.submission.sections.length === 0)
    return 0;
  return Math.max(
    ...props.submission.sections.map((section: any) => section.score || 0)
  );
});

const lowestScore = computed(() => {
  if (!props.submission.sections || props.submission.sections.length === 0)
    return 0;
  return Math.min(
    ...props.submission.sections.map((section: any) => section.score || 0)
  );
});

const getStudentName = (student: any) => {
  return (
    `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
    student.username
  );
};

const getStudentInitials = (student: any) => {
  const firstName = student.first_name || "";
  const lastName = student.last_name || "";

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase();
  } else if (student.username) {
    return student.username.charAt(0).toUpperCase();
  }
  return "?";
};

const getScoreColorClass = (score: number) => {
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "average";
  return "poor";
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return t("submissionDetails.excellent");
  if (score >= 70) return t("submissionDetails.good");
  if (score >= 50) return t("submissionDetails.average");
  return t("submissionDetails.needsWork");
};

const getSectionScoreColor = (score: number) => {
  if (score >= 90) return "success";
  if (score >= 70) return "warning";
  if (score >= 50) return "medium";
  return "danger";
};

const getSectionScoreColorClass = (score: number) => {
  if (score >= 90) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "average";
  return "poor";
};

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
};

const dismiss = () => {
  modalController.dismiss();
};

const viewWritingAssessment = async (section: any) => {
  // Dismiss the current modal first
  await modalController.dismiss();

  // Navigate to the writing assessment page with complete section data
  router.push({
    path: "/writing-assessment",
    query: {
      section: JSON.stringify(section),
      student: JSON.stringify(props.submission.student),
      submission: JSON.stringify(props.submission),
    },
  });
};
</script>

<style scoped>
.submission-detail-content {
  padding: 20px;
}

/* Student Header */
.student-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.student-avatar {
  position: relative;
}

.avatar-image,
.avatar-placeholder {
  width: 64px;
  height: 64px;
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
  font-size: 24px;
}

.student-info {
  flex: 1;
}

.student-name {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.student-username {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: var(--ion-color-medium);
}

.student-phone {
  margin: 0;
  font-size: 14px;
  color: var(--ion-color-medium);
}

.overall-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.score-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid;
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
  font-size: 20px;
  font-weight: bold;
}

.score-label {
  font-size: 12px;
  color: var(--ion-color-medium);
  text-align: center;
  font-weight: 500;
}

/* Submission Meta */
.submission-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.meta-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.meta-icon {
  font-size: 24px;
  color: var(--ion-color-primary);
}

.meta-content {
  display: flex;
  flex-direction: column;
}

.meta-label {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-bottom: 2px;
}

.meta-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

/* Sections */
.sections-container {
  margin-bottom: 24px;
}

.sections-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.sections-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
}

.section-item {
  border-bottom: 1px solid var(--ion-color-light);
}

.section-item:last-child {
  border-bottom: none;
}

.section-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--ion-color-primary);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 14px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ion-color-dark);
  text-transform: capitalize;
}

.section-chip {
  font-weight: 600;
}

.section-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--ion-color-medium);
}

.section-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  gap: 8px;
}

.section-actions {
  display: flex;
  justify-content: center;
}

.assessment-button {
  --color: var(--ion-color-primary);
  --padding-start: 8px;
  --padding-end: 8px;
  --padding-top: 4px;
  --padding-bottom: 4px;
  font-size: 18px;
}

.assessment-button:hover {
  --color: var(--ion-color-primary-shade);
}

.score-bar {
  width: 60px;
  height: 8px;
  background: var(--ion-color-light);
  border-radius: 4px;
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.score-fill.excellent {
  background: #22c55e;
}

.score-fill.good {
  background: #f59e0b;
}

.score-fill.average {
  background: #6b7280;
}

.score-fill.poor {
  background: #ef4444;
}

/* Summary Stats */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  padding: 20px;
  background: white;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--ion-color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: var(--ion-color-medium);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .student-header {
    flex-direction: column;
    text-align: center;
  }

  .submission-meta {
    grid-template-columns: 1fr;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .section-meta {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
