/*public/modal.js*/
const modal = document.getElementById("post-modal");
const closeBtn = document.getElementById("close-modal");

let lastFocusedElement = null;

/*OPEN*/
export function openModal() {
  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  document.body.style.overflow = "hidden";

  const focusable = getFocusableElements();
  if (focusable.length) focusable[0].focus();
}

/*CLOSE*/
export function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocusedElement) lastFocusedElement.focus();
}

/*FOCUSABLE*/
function getFocusableElements() {
  return modal.querySelectorAll(
    'button, textarea, input, a[href], [tabindex]:not([tabindex="-1"])'
  );
}

/*TRAP + ESC*/
document.addEventListener("keydown", (e) => {
  if (modal.hidden) return;

  if (e.key === "Escape") {
    closeModal();
  }

  if (e.key === "Tab") {
    const focusable = Array.from(getFocusableElements());
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

/*BUTTON*/
closeBtn.addEventListener("click", closeModal);
