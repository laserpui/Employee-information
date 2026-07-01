const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby99r96u7OyVmDnNh1WmMQaCElcydHWtSTtvZK7b9lNv6j1QAqzboHVgRhlS-YG29k9/exec";

const FIELD_LABELS = {
  fullNameTh: "ชื่อ - นามสกุล (ภาษาไทย)",
  fullNameEn: "ชื่อ - นามสกุล (ภาษาอังกฤษ)",
  birthDate: "วัน เดือน ปีเกิด",
  nationalId: "เลขบัตรประชาชน",
  phone: "หมายเลขโทรศัพท์",
  bankAccount: "เลขบัญชีธนาคาร",
  companyEmail: "อีเมล",
  emergencyContactName: "ชื่อผู้ติดต่อกรณีฉุกเฉิน",
  emergencyContactPhone: "เบอร์ผู้ติดต่อกรณีฉุกเฉิน",
};

const form = document.querySelector("#employee-form");
const submitButton = document.querySelector("#submit-button");
const formMessage = document.querySelector("#form-message");
const connectionStatus = document.querySelector("#connection-status");
const successModal = document.querySelector("#success-modal");
const successModalClose = document.querySelector("#success-modal-close");

const validators = {
  fullNameTh: (value) => (/^[\u0E00-\u0E7F\s.'-]+$/u.test(value) ? "" : "กรุณากรอกชื่อภาษาไทย"),
  fullNameEn: (value) => (/^[A-Za-z\s.'-]+$/.test(value) ? "" : "กรุณากรอกชื่อภาษาอังกฤษ"),
  birthDate: (value) => {
    if (!value) return "กรุณาเลือกวันเกิด";
    const birthDate = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return birthDate < today ? "" : "วันเกิดต้องเป็นวันที่ผ่านมาแล้ว";
  },
  nationalId: (value) => (/^\d{13}$/.test(value) ? "" : "กรุณากรอกเลขบัตรประชาชน 13 หลัก"),
  phone: (value) => (/^[0-9+\-\s()]{8,20}$/.test(value) ? "" : "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง"),
  bankAccount: (value) => (/^[0-9\-\s]{6,24}$/.test(value) ? "" : "กรุณากรอกเลขบัญชีธนาคารให้ถูกต้อง"),
  companyEmail: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "กรุณากรอกอีเมลให้ถูกต้อง"),
  emergencyContactName: (value) => (value.length >= 2 ? "" : "กรุณากรอกชื่อผู้ติดต่อ"),
  emergencyContactPhone: (value) => (/^[0-9+\-\s()]{8,20}$/.test(value) ? "" : "กรุณากรอกเบอร์ผู้ติดต่อให้ถูกต้อง"),
};

function showSuccessPopup() {
  successModal.classList.add("show");
  successModal.setAttribute("aria-hidden", "false");
  successModalClose.focus();
}

function closeSuccessPopup() {
  successModal.classList.remove("show");
  successModal.setAttribute("aria-hidden", "true");
}

function setMessage(text, type = "") {
  formMessage.textContent = text;
  formMessage.className = `form-message ${type}`.trim();
}

function normalizeValue(name, value) {
  const trimmed = value.trim();
  if (["nationalId", "bankAccount"].includes(name)) {
    return trimmed.replace(/[^\d]/g, "");
  }
  if (["phone", "emergencyContactPhone"].includes(name)) {
    return trimmed.replace(/\s+/g, " ");
  }
  return trimmed;
}

function getPayload() {
  const formData = new FormData(form);
  const payload = {};
  Object.keys(FIELD_LABELS).forEach((name) => {
    payload[name] = normalizeValue(name, String(formData.get(name) || ""));
  });
  payload.submittedAt = new Date().toISOString();
  return payload;
}

function validateField(input) {
  const value = normalizeValue(input.name, input.value);
  const field = input.closest(".field");
  const error = field.querySelector(".error");
  const requiredMessage = value ? "" : `กรุณากรอก${FIELD_LABELS[input.name]}`;
  const customMessage = requiredMessage || validators[input.name](value);

  field.classList.toggle("invalid", Boolean(customMessage));
  error.textContent = customMessage;
  return !customMessage;
}

function validateForm() {
  const inputs = [...form.querySelectorAll("input[required]")];
  return inputs.map(validateField).every(Boolean);
}

async function submitPayload(payload) {
  if (!APPS_SCRIPT_URL) {
    throw new Error("ยังไม่ได้ตั้งค่า APPS_SCRIPT_URL ในไฟล์ app.js");
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.message || "ส่งข้อมูลไม่สำเร็จ");
  }
  return result;
}

successModalClose.addEventListener("click", closeSuccessPopup);
successModal.addEventListener("click", (event) => {
  if (event.target === successModal) closeSuccessPopup();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && successModal.classList.contains("show")) closeSuccessPopup();
});

form.addEventListener("input", (event) => {
  if (event.target.matches("input")) {
    validateField(event.target);
  }
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    form.querySelectorAll(".field").forEach((field) => {
      field.classList.remove("invalid");
      field.querySelector(".error").textContent = "";
    });
    setMessage("");
    connectionStatus.textContent = "พร้อมกรอกข้อมูล";
  }, 0);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");

  if (!validateForm()) {
    setMessage("กรุณาตรวจสอบข้อมูลที่กรอกอีกครั้ง", "error");
    return;
  }

  const payload = getPayload();
  submitButton.disabled = true;
  submitButton.textContent = "กำลังส่ง...";
  connectionStatus.textContent = "กำลังบันทึก";

  try {
    await submitPayload(payload);
    form.reset();
    setMessage("บันทึกข้อมูลเรียบร้อยแล้ว", "success");
    connectionStatus.textContent = "บันทึกสำเร็จ";
    showSuccessPopup();
  } catch (error) {
    setMessage(error.message, "error");
    connectionStatus.textContent = "บันทึกไม่สำเร็จ";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "ส่งข้อมูล";
  }
});
