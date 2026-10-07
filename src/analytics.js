// ── FocusMode — Google Analytics 4 Utility ─────────────────────────────
// Measurement ID: G-MB8B9DZ03B
// All tracking calls go through this file for easy maintenance.

/** Safe wrapper — only calls gtag if it's available (avoids errors in dev/offline) */
const gtag = (...args) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
};

// ── Page / Screen Views ────────────────────────────────────────────────────────
export const trackPageView = (pageName) => {
  gtag('event', 'page_view', {
    page_title: pageName,
    page_location: window.location.href,
  });
};

// ── Auth Events ────────────────────────────────────────────────────────────────
export const trackSignUp = (method = 'email') => {
  gtag('event', 'sign_up', { method });
};

export const trackLogin = (method = 'email') => {
  gtag('event', 'login', { method });
};

export const trackLogout = () => {
  gtag('event', 'logout');
};

export const trackGuestSession = () => {
  gtag('event', 'guest_session_started');
};

// ── Onboarding ─────────────────────────────────────────────────────────────────
export const trackOnboarding = (prepType, targetYear) => {
  gtag('event', 'onboarding_complete', {
    prep_type: prepType,
    target_year: targetYear,
  });
};

// ── Navigation ─────────────────────────────────────────────────────────────────
export const trackTabChange = (tabName) => {
  gtag('event', 'tab_view', { tab_name: tabName });
  gtag('event', 'page_view', {
    page_title: `FocusMode — ${tabName}`,
    page_location: `${window.location.origin}/#${tabName}`,
  });
};

// ── Dashboard / Tasks ─────────────────────────────────────────────────────────
export const trackTaskAdded = (subject) => {
  gtag('event', 'task_added', { subject });
};

export const trackSubtaskCompleted = (subject) => {
  gtag('event', 'subtask_completed', { subject });
};

export const trackModuleCompleted = (subject) => {
  gtag('event', 'module_completed', {
    subject,
    achievement_id: `module_${subject}`,
  });
};

// ── Focus Timer ───────────────────────────────────────────────────────────────
export const trackTimerStarted = (sessionType) => {
  gtag('event', 'timer_started', { session_type: sessionType });
};

export const trackTimerCompleted = (sessionType) => {
  gtag('event', 'timer_completed', {
    session_type: sessionType,
    achievement_id: `timer_${sessionType}_complete`,
  });
};

// ── Lectures ──────────────────────────────────────────────────────────────────
export const trackVideoAdded = (videoTitle) => {
  gtag('event', 'video_added', { video_title: videoTitle });
};

export const trackVideoPlayed = (videoTitle, videoId) => {
  gtag('event', 'video_start', {
    video_title: videoTitle,
    video_id: videoId,
    video_provider: 'youtube',
  });
};

export const trackNoteDownloaded = (videoTitle) => {
  gtag('event', 'file_download', {
    file_name: `notes_${videoTitle}`,
    file_extension: 'txt',
  });
};

// ── Journal ───────────────────────────────────────────────────────────────────
export const trackJournalSaved = () => {
  gtag('event', 'journal_entry_saved');
};

// ── Community ─────────────────────────────────────────────────────────────────
export const trackPostCreated = () => {
  gtag('event', 'post_created');
};

export const trackPostLiked = () => {
  gtag('event', 'post_liked');
};

export const trackCommentPosted = () => {
  gtag('event', 'comment_posted');
};

// ── Study Connect ─────────────────────────────────────────────────────────────
export const trackRoomJoined = (roomId) => {
  gtag('event', 'study_room_joined', { room_id: roomId });
};

// ── AI Assistant ──────────────────────────────────────────────────────────────
export const trackAIOpened = () => {
  gtag('event', 'ai_assistant_opened');
};

export const trackAIQuestion = (questionLength) => {
  gtag('event', 'ai_question_asked', { question_length: questionLength });
};

// ── PWA Install ───────────────────────────────────────────────────────────────
export const trackPWAInstallPromptShown = (showCount) => {
  gtag('event', 'pwa_install_prompt_shown', { show_count: showCount });
};

export const trackPWAInstalled = () => {
  gtag('event', 'pwa_installed');
};

export const trackPWADismissed = (showCount) => {
  gtag('event', 'pwa_install_dismissed', { show_count: showCount });
};

// ── XP / Engagement ──────────────────────────────────────────────────────────
export const trackXPEarned = (amount, reason) => {
  gtag('event', 'earn_virtual_currency', {
    virtual_currency_name: 'XP',
    value: amount,
    item_name: reason,
  });
};
