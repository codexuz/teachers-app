<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button
            :default-href="'/'"
            class="custom-back-button"
          ></ion-back-button>
        </ion-buttons>
        <ion-title>{{ $t("writingAssessment.title") }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="assessment-container">
        <!-- Student Header -->
        <div class="student-header">
          <div class="student-avatar">
            <img
              v-if="student.avatar_url"
              :src="student.avatar_url"
              :alt="getStudentName(student)"
              class="avatar-image"
            />
            <div v-else class="avatar-placeholder">
              {{ getStudentInitials(student) }}
            </div>
          </div>

          <div class="student-info">
            <h2 class="student-name">{{ getStudentName(student) }}</h2>
            <p class="student-username">@{{ student.username }}</p>
          </div>

          <div class="overall-score">
            <div
              class="score-circle"
              :class="
                getScoreColorClass(
                  answers.assessment?.score || section.score || 0
                )
              "
            >
              <span class="score-value"
                >{{
                  (answers.assessment?.score || section.score || 0).toFixed(0)
                }}%</span
              >
            </div>
            <div class="score-label">
              {{
                getScoreLabel(answers.assessment?.score || section.score || 0)
              }}
            </div>
          </div>
        </div>

        <!-- Section Info -->
        <div class="section-info" v-if="section.id">
          <div class="info-grid">
            <div class="info-card">
              <ion-icon :icon="documentsOutline" class="info-icon"></ion-icon>
              <div class="info-content">
                <span class="info-label">{{
                  $t("writingAssessment.sectionType")
                }}</span>
                <span class="info-value">{{
                  $t(`submissionDetails.sections.${section.section}`)
                }}</span>
              </div>
            </div>

            <div class="info-card">
              <ion-icon
                :icon="checkmarkCircleOutline"
                class="info-icon"
              ></ion-icon>
              <div class="info-content">
                <span class="info-label">{{
                  $t("writingAssessment.sectionScore")
                }}</span>
                <span class="info-value"
                  >{{
                    (answers.assessment?.score || section.score || 0).toFixed(
                      1
                    )
                  }}%</span
                >
              </div>
            </div>

            <div class="info-card">
              <ion-icon :icon="timeOutline" class="info-icon"></ion-icon>
              <div class="info-content">
                <span class="info-label">{{
                  $t("writingAssessment.completedAt")
                }}</span>
                <span class="info-value">{{
                  formatDate(section.updatedAt)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Writing Content -->
        <div class="writing-section">
          <h3 class="section-title">
            {{ $t("writingAssessment.studentWriting") }}
          </h3>
          <div class="writing-content">
            <div class="original-text">
              <h4 class="content-label">
                {{ $t("writingAssessment.originalText") }}
              </h4>
              <div class="text-content">
                {{ answers.writing }}
              </div>
            </div>

            <div
              v-if="answers.assessment?.correctedText"
              class="corrected-text"
            >
              <h4 class="content-label">
                {{ $t("writingAssessment.correctedText") }}
              </h4>
              <div class="text-content corrected">
                {{ answers.assessment.correctedText }}
              </div>
            </div>
          </div>
        </div>

        <!-- Assessment Details -->
        <div v-if="answers.assessment" class="assessment-section">
          <h3 class="section-title">
            {{ $t("writingAssessment.assessmentDetails") }}
          </h3>

          <!-- Score Breakdown -->
          <div class="scores-grid">
            <div class="score-item">
              <div class="score-header">
                <ion-icon
                  :icon="checkmarkCircleOutline"
                  class="score-icon"
                ></ion-icon>
                <span class="score-name">{{
                  $t("writingAssessment.taskResponse")
                }}</span>
              </div>
              <div class="score-value">
                {{ answers.assessment.taskResponseScore || 0 }}%
              </div>
            </div>

            <div class="score-item">
              <div class="score-header">
                <ion-icon :icon="sparklesOutline" class="score-icon"></ion-icon>
                <span class="score-name">{{
                  $t("writingAssessment.coherence")
                }}</span>
              </div>
              <div class="score-value">
                {{ answers.assessment.coherenceScore || 0 }}%
              </div>
            </div>

            <div class="score-item">
              <div class="score-header">
                <ion-icon :icon="libraryOutline" class="score-icon"></ion-icon>
                <span class="score-name">{{
                  $t("writingAssessment.vocabulary")
                }}</span>
              </div>
              <div class="score-value">
                {{ answers.assessment.vocabularyScore || 0 }}%
              </div>
            </div>

            <div class="score-item">
              <div class="score-header">
                <ion-icon
                  :icon="constructOutline"
                  class="score-icon"
                ></ion-icon>
                <span class="score-name">{{
                  $t("writingAssessment.grammar")
                }}</span>
              </div>
              <div class="score-value">
                {{ answers.assessment.grammarScore || 0 }}%
              </div>
            </div>
          </div>

          <!-- Feedback Section -->
          <div class="feedback-section">
            <div
              v-if="answers.assessment.overallFeedback"
              class="feedback-item"
            >
              <h4 class="feedback-title">
                {{ $t("writingAssessment.overallFeedback") }}
              </h4>
              <div class="feedback-content">
                {{ answers.assessment.overallFeedback }}
              </div>
            </div>

            <div
              v-if="answers.assessment.taskResponseFeedback"
              class="feedback-item"
            >
              <h4 class="feedback-title">
                {{ $t("writingAssessment.taskResponseFeedback") }}
              </h4>
              <div class="feedback-content">
                {{ answers.assessment.taskResponseFeedback }}
              </div>
            </div>

            <div
              v-if="answers.assessment.coherenceFeedback"
              class="feedback-item"
            >
              <h4 class="feedback-title">
                {{ $t("writingAssessment.coherenceFeedback") }}
              </h4>
              <div class="feedback-content">
                {{ answers.assessment.coherenceFeedback }}
              </div>
            </div>

            <div
              v-if="answers.assessment.vocabularyFeedback"
              class="feedback-item"
            >
              <h4 class="feedback-title">
                {{ $t("writingAssessment.vocabularyFeedback") }}
              </h4>
              <div class="feedback-content">
                {{ answers.assessment.vocabularyFeedback }}
              </div>
            </div>

            <div
              v-if="answers.assessment.grammarFeedback"
              class="feedback-item"
            >
              <h4 class="feedback-title">
                {{ $t("writingAssessment.grammarFeedback") }}
              </h4>
              <div class="feedback-content">
                {{ answers.assessment.grammarFeedback }}
              </div>
            </div>
          </div>

          <!-- Assessment Info -->
          <div class="assessment-info">
            <div class="info-item">
              <ion-icon :icon="documentsOutline" class="info-icon"></ion-icon>
              <span
                >{{ $t("writingAssessment.taskType") }}:
                {{ answers.assessment.taskType || "N/A" }}</span
              >
            </div>
            <div class="info-item">
              <ion-icon :icon="timeOutline" class="info-icon"></ion-icon>
              <span
                >{{ $t("writingAssessment.assessedAt") }}:
                {{ formatDate(answers.assessment.assessedAt) }}</span
              >
            </div>
          </div>
        </div>

        <!-- No Assessment Placeholder -->
        <div
          v-else-if="
            !answers.assessment || Object.keys(answers.assessment).length === 0
          "
          class="no-assessment-section"
        >
          <div class="no-assessment-content">
            <ion-icon
              :icon="sparklesOutline"
              class="no-assessment-icon"
            ></ion-icon>
            <h3 class="no-assessment-title">
              {{ $t("writingAssessment.noAssessmentYet") }}
            </h3>
            <p class="no-assessment-description">
              {{ $t("writingAssessment.noAssessmentDescription") }}
            </p>
          </div>
        </div>

        <!-- Assessment Actions -->
        <div class="action-section">
          <!-- Assess Button (when no assessment exists) -->
          <ion-button
            v-if="
              !answers.assessment ||
              Object.keys(answers.assessment).length === 0
            "
            expand="block"
            fill="solid"
            color="primary"
            @click="assessWriting"
            class="assess-button"
            :disabled="isAssessing"
          >
            <ion-icon :icon="sparklesOutline" slot="start"></ion-icon>
            {{
              isAssessing
                ? $t("writingAssessment.assessing")
                : $t("writingAssessment.assessWriting")
            }}
          </ion-button>

          <!-- Edit Assessment Button (when assessment exists) -->
          <ion-button
            v-else
            expand="block"
            fill="outline"
            color="primary"
            @click="editAssessment"
            class="edit-button"
          >
            <ion-icon :icon="createOutline" slot="start"></ion-icon>
            {{ $t("writingAssessment.editAssessment") }}
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter, useRoute } from "vue-router";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  toastController,
} from "@ionic/vue";
import {
  checkmarkCircleOutline,
  sparklesOutline,
  libraryOutline,
  constructOutline,
  documentsOutline,
  timeOutline,
  createOutline,
} from "ionicons/icons";
// @ts-expect-error - API module doesn't have type definitions
import { homeworkSubmissionsAPI } from "@/utils/api.js";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

const answers = ref<any>({});
const student = ref<any>({});
const section = ref<any>({});
const submission = ref<any>({});
const isAssessing = ref(false);

onMounted(() => {
  try {
    if (route.query.section) {
      section.value = JSON.parse(route.query.section as string);
      // Extract answers from section for backward compatibility
      answers.value = section.value.answers || {};
    }
    if (route.query.student) {
      student.value = JSON.parse(route.query.student as string);
    }
    if (route.query.submission) {
      submission.value = JSON.parse(route.query.submission as string);
    }
  } catch (error) {
    console.error("Error parsing route parameters:", error);
    router.back();
  }
});

const getStudentName = (studentData: any) => {
  return (
    `${studentData.first_name || ""} ${studentData.last_name || ""}`.trim() ||
    studentData.username
  );
};

const getStudentInitials = (studentData: any) => {
  const firstName = studentData.first_name || "";
  const lastName = studentData.last_name || "";

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  } else if (firstName) {
    return firstName.charAt(0).toUpperCase();
  } else if (studentData.username) {
    return studentData.username.charAt(0).toUpperCase();
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
  if (score >= 90) return t("writingAssessment.excellent");
  if (score >= 70) return t("writingAssessment.good");
  if (score >= 50) return t("writingAssessment.average");
  return t("writingAssessment.needsWork");
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

const assessWriting = async () => {
  if (!section.value.id) {
    const toast = await toastController.create({
      message: t("writingAssessment.noSectionData"),
      duration: 3000,
      color: "danger",
    });
    await toast.present();
    return;
  }

  isAssessing.value = true;

  try {
    // Call the grading API
    const taskType =
      answers.value.assessment?.taskType || "IELTS Writing Task 2";
    const result = await homeworkSubmissionsAPI.grade(
      section.value.id,
      taskType
    );

    // Update with the complete response data
    if (result) {
      // Update the section with the complete response
      section.value = {
        ...section.value,
        ...result,
        // Ensure we preserve the original section type
        section: section.value.section,
      };

      // Update answers from the response
      answers.value = result.answers || {};

      const toast = await toastController.create({
        message: t("writingAssessment.assessmentComplete"),
        duration: 3000,
        color: "success",
      });
      await toast.present();
    } else {
      throw new Error("No assessment data received");
    }
  } catch (error: any) {
    console.error("Error assessing writing:", error);

    const toast = await toastController.create({
      message: error.message || t("writingAssessment.assessmentFailed"),
      duration: 3000,
      color: "danger",
    });
    await toast.present();
  } finally {
    isAssessing.value = false;
  }
};

const editAssessment = async () => {
  const toast = await toastController.create({
    message: t("writingAssessment.editFeatureComingSoon"),
    duration: 2000,
    color: "primary",
  });
  await toast.present();
};
</script>

<style scoped>
.assessment-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
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

/* Section Info */
.section-info {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--ion-color-light);
  border-radius: 12px;
}

.info-icon {
  font-size: 20px;
  color: var(--ion-color-primary);
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-bottom: 2px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

/* Section Titles */
.section-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

/* Writing Section */
.writing-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
}

.writing-content {
  display: grid;
  gap: 20px;
}

.content-label {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.text-content {
  padding: 16px;
  background: var(--ion-color-light);
  border-radius: 12px;
  border-left: 4px solid var(--ion-color-primary);
  line-height: 1.6;
  color: var(--ion-color-dark);
  white-space: pre-wrap;
}

.text-content.corrected {
  border-left-color: var(--ion-color-success);
  background: rgba(34, 197, 94, 0.05);
}

/* Assessment Section */
.assessment-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
}

/* No Assessment Section */
.no-assessment-section {
  background: white;
  border-radius: 16px;
  padding: 40px 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.no-assessment-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.no-assessment-icon {
  font-size: 64px;
  color: var(--ion-color-medium);
  opacity: 0.6;
}

.no-assessment-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--ion-color-dark);
}

.no-assessment-description {
  margin: 0;
  font-size: 14px;
  color: var(--ion-color-medium);
  line-height: 1.5;
  max-width: 400px;
}

/* Scores Grid */
.scores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.score-item {
  background: var(--ion-color-light);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-icon {
  font-size: 20px;
  color: var(--ion-color-primary);
}

.score-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--ion-color-dark);
}

.score-value {
  font-size: 18px;
  font-weight: bold;
  color: var(--ion-color-primary);
}

/* Feedback Section */
.feedback-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.feedback-item {
  background: var(--ion-color-light);
  border-radius: 12px;
  padding: 16px;
}

.feedback-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--ion-color-primary);
}

.feedback-content {
  font-size: 14px;
  line-height: 1.5;
  color: var(--ion-color-dark);
}

/* Assessment Info */
.assessment-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--ion-color-light);
  border-radius: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--ion-color-medium);
}

.info-icon {
  font-size: 16px;
  color: var(--ion-color-primary);
}

/* Action Section */
.action-section {
  margin-top: 24px;
}

.assess-button {
  --border-radius: 12px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  font-weight: 600;
}

.assess-button[disabled] {
  opacity: 0.6;
}

.edit-button {
  --border-radius: 12px;
  --padding-top: 16px;
  --padding-bottom: 16px;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .student-header {
    flex-direction: column;
    text-align: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .scores-grid {
    grid-template-columns: 1fr;
  }

  .writing-content {
    grid-template-columns: 1fr;
  }
}
</style>
