const modal = document.querySelector(".modal");
const modalCourseSelect = document.querySelector(".modal-form select[name='course']");
const openModalButtons = document.querySelectorAll("[data-open-modal]");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const quickForm = document.querySelector(".quick-lead-form");
const modalForm = document.querySelector(".modal-form");
const successMessage = document.querySelector(".modal-form .success-message");
const tabs = document.querySelectorAll(".tab");
const courses = document.querySelectorAll(".course-card");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const teachersTrack = document.querySelector(".teachers-track");
const teachersPrev = document.querySelector("[data-teachers-prev]");
const teachersNext = document.querySelector("[data-teachers-next]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const loader = document.querySelector(".page-loader");
const revealItems = document.querySelectorAll(".reveal");
const partnersContent = document.querySelector(".partners-content");
const partnersMotionTrack = document.querySelector(".partners-motion-track");
const partnerButtons = document.querySelectorAll("[data-partner-target]");
const partnerDetails = document.querySelectorAll("[data-partner-id]");

document.body.classList.add("is-loading");

function finishLoading() {
  loader?.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
}

window.addEventListener("load", () => {
  window.setTimeout(finishLoading, prefersReducedMotion.matches ? 0 : 650);
});

window.setTimeout(finishLoading, 2200);

if (revealItems.length) {
  if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-visible", entry.isIntersecting);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }
}

if (partnersContent && partnerButtons.length && partnerDetails.length) {
  const activatePartner = (partnerId) => {
    partnerButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.partnerTarget === partnerId);
    });

    partnerDetails.forEach((detail) => {
      detail.classList.toggle("is-active", detail.dataset.partnerId === partnerId);
    });
  };

  partnerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const partnerId = button.dataset.partnerTarget;
      const detail = document.querySelector(`[data-partner-id="${partnerId}"]`);

      activatePartner(partnerId);
      partnersContent.scrollTo({
        top: detail ? detail.offsetTop - partnersContent.offsetTop : 0,
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      });
    });
  });

  if ("IntersectionObserver" in window) {
    const partnerObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry) {
          activatePartner(visibleEntry.target.dataset.partnerId);
        }
      },
      {
        root: partnersContent,
        threshold: [0.35, 0.55, 0.75],
      }
    );

    partnerDetails.forEach((detail) => partnerObserver.observe(detail));
  }

  activatePartner(partnerDetails[0].dataset.partnerId);
}

if (partnersContent && partnersMotionTrack) {
  let partnersAnimationFrame;
  let partnersLastTime;
  let partnersPaused = false;
  let partnersResumeTimer;
  let partnersOffset = 0;
  let pointerStartX = 0;
  let pointerStartOffset = 0;
  let isDraggingPartners = false;
  const originalCards = Array.from(partnersMotionTrack.querySelectorAll(".partner-detail"));

  originalCards.forEach((card) => {
    const clone = card.cloneNode(true);
    clone.removeAttribute("id");
    clone.removeAttribute("data-partner-id");
    clone.setAttribute("aria-hidden", "true");
    partnersMotionTrack.appendChild(clone);
  });

  const getPartnerStep = () => {
    const firstCard = partnersMotionTrack.querySelector(".partner-detail");
    const gap = Number.parseFloat(getComputedStyle(partnersMotionTrack).columnGap) || 20;
    return firstCard ? firstCard.offsetWidth + gap : partnersContent.clientWidth;
  };

  const getLoopWidth = () => originalCards.length * getPartnerStep();

  const normalizePartnersPosition = () => {
    const loopWidth = getLoopWidth();

    if (!loopWidth) {
      return;
    }

    while (partnersOffset >= loopWidth) {
      partnersOffset -= loopWidth;
    }

    while (partnersOffset < 0) {
      partnersOffset += loopWidth;
    }
  };

  const renderPartners = () => {
    partnersMotionTrack.style.transform = `translate3d(${-partnersOffset}px, 0, 0)`;
  };

  const animatePartners = (time) => {
    if (!partnersLastTime) {
      partnersLastTime = time;
    }

    const elapsed = Math.min(time - partnersLastTime, 40);
    partnersLastTime = time;

    if (!partnersPaused && !prefersReducedMotion.matches) {
      partnersOffset += elapsed * 0.028;
      normalizePartnersPosition();
      renderPartners();
    }

    partnersAnimationFrame = window.requestAnimationFrame(animatePartners);
  };

  const pausePartners = () => {
    partnersPaused = true;
  };

  const resumePartners = () => {
    partnersPaused = false;
    partnersLastTime = performance.now();
  };

  const pausePartnersThenResume = () => {
    pausePartners();
    window.clearTimeout(partnersResumeTimer);
    partnersResumeTimer = window.setTimeout(resumePartners, 1600);
  };

  partnersContent.addEventListener("mouseenter", pausePartners);
  partnersContent.addEventListener("mouseleave", resumePartners);
  partnersContent.addEventListener("focusin", pausePartners);
  partnersContent.addEventListener("focusout", resumePartners);

  partnersContent.addEventListener("pointerdown", (event) => {
    isDraggingPartners = true;
    pointerStartX = event.clientX;
    pointerStartOffset = partnersOffset;
    pausePartners();
    partnersContent.setPointerCapture?.(event.pointerId);
  });

  partnersContent.addEventListener("pointermove", (event) => {
    if (!isDraggingPartners) {
      return;
    }

    partnersOffset = pointerStartOffset - (event.clientX - pointerStartX);
    normalizePartnersPosition();
    renderPartners();
  });

  const finishPartnersDrag = () => {
    if (!isDraggingPartners) {
      return;
    }

    isDraggingPartners = false;
    pausePartnersThenResume();
  };

  partnersContent.addEventListener("pointerup", finishPartnersDrag);
  partnersContent.addEventListener("pointercancel", finishPartnersDrag);
  partnersContent.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
        return;
      }

      event.preventDefault();
      partnersOffset += event.deltaX;
      normalizePartnersPosition();
      renderPartners();
      pausePartnersThenResume();
    },
    { passive: false }
  );

  renderPartners();
  partnersAnimationFrame = window.requestAnimationFrame(animatePartners);
}

function openModal(course, draft = {}) {
  if (successMessage) {
    successMessage.textContent = "";
  }

  if (modalForm) {
    const nameInput = modalForm.elements.name;
    const phoneInput = modalForm.elements.phone;

    if (draft.name && nameInput) {
      nameInput.value = draft.name;
    }

    if (draft.phone && phoneInput) {
      phoneInput.value = draft.phone;
    }
  }

  if (course && modalCourseSelect) {
    modalCourseSelect.value = course;
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

openModalButtons.forEach((button) => {
  button.addEventListener("click", () => openModal(button.dataset.course));
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeModal();
  }
});

quickForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  openModal(quickForm.elements.course?.value, {
    name: quickForm.elements.name?.value.trim(),
    phone: quickForm.elements.phone?.value.trim(),
  });
});

modalForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (successMessage) {
    successMessage.textContent = "Спасибо! Заявка принята. Мы скоро свяжемся с вами.";
  }
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.dataset.filter;

    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");

    courses.forEach((course) => {
      const categories = course.dataset.category.split(" ");
      course.classList.toggle("hidden", filter !== "all" && !categories.includes(filter));
    });
  });
});

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

if (teachersTrack && teachersPrev && teachersNext) {
  let autoplayTimer;
  let resumeTimer;
  let manualScrollTimer;

  const getScrollStep = () => {
    const firstCard = teachersTrack.querySelector(".teacher-card");
    if (!firstCard) {
      return teachersTrack.clientWidth;
    }

    const gap = Number.parseFloat(getComputedStyle(teachersTrack).columnGap) || 20;
    return firstCard.offsetWidth + gap;
  };

  const isAtStart = () => teachersTrack.scrollLeft <= 4;

  const isAtEnd = () =>
    teachersTrack.scrollLeft + teachersTrack.clientWidth >= teachersTrack.scrollWidth - 4;

  const updateTeacherButtons = () => {
    teachersPrev.disabled = isAtStart();
    teachersNext.disabled = teachersTrack.scrollWidth <= teachersTrack.clientWidth + 4;
  };

  const scrollTeachers = (direction = 1) => {
    teachersTrack.scrollBy({
      left: getScrollStep() * direction,
      behavior: "smooth",
    });
  };

  const autoplayStep = () => {
    if (isAtEnd()) {
      teachersTrack.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    scrollTeachers(1);
  };

  const stopAutoplay = () => {
    window.clearInterval(autoplayTimer);
  };

  const startAutoplay = () => {
    if (prefersReducedMotion.matches) {
      return;
    }

    stopAutoplay();
    autoplayTimer = window.setInterval(autoplayStep, 3600);
  };

  const pauseThenResume = () => {
    stopAutoplay();
    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(startAutoplay, 2600);
  };

  teachersPrev.addEventListener("click", () => {
    pauseThenResume();
    scrollTeachers(-1);
  });

  teachersNext.addEventListener("click", () => {
    pauseThenResume();
    if (isAtEnd()) {
      teachersTrack.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      scrollTeachers(1);
    }
  });

  teachersTrack.addEventListener("scroll", () => {
    updateTeacherButtons();
    window.clearTimeout(manualScrollTimer);
    manualScrollTimer = window.setTimeout(pauseThenResume, 120);
  });

  teachersTrack.addEventListener("mouseenter", stopAutoplay);
  teachersTrack.addEventListener("mouseleave", startAutoplay);
  teachersTrack.addEventListener("focusin", stopAutoplay);
  teachersTrack.addEventListener("focusout", startAutoplay);
  teachersTrack.addEventListener("touchstart", stopAutoplay, { passive: true });
  teachersTrack.addEventListener("touchend", pauseThenResume, { passive: true });
  teachersTrack.addEventListener("pointerdown", stopAutoplay);
  teachersTrack.addEventListener("pointerup", pauseThenResume);

  prefersReducedMotion.addEventListener("change", () => {
    if (prefersReducedMotion.matches) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  updateTeacherButtons();
  startAutoplay();
}
