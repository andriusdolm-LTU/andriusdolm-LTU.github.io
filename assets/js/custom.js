document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cv-contact-form");
  if (!form) return;

  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const addressInput = document.getElementById("address");
  const ratingInputs = [
    document.getElementById("rating1"),
    document.getElementById("rating2"),
    document.getElementById("rating3")
  ];

  const submitBtn = document.getElementById("submit-btn");
  const submitWrapper = document.getElementById("submit-wrapper");
  const clearBtn = document.getElementById("clear-btn");
  const resultBox = document.getElementById("form-result");

  const lettersOnlyRegex = /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const ltPhoneRegex = /^\+370 6\d{2} \d{5}$/;

  function setFieldError(input, message) {
    const errorEl = document.getElementById(`err-${input.id}`);
    if (message) {
      input.classList.add("input-error");
      input.classList.remove("input-valid");
      if (errorEl) errorEl.textContent = message;
      return false;
    } else {
      input.classList.remove("input-error");
      input.classList.add("input-valid");
      if (errorEl) errorEl.textContent = "";
      return true;
    }
  }

  function clearFieldState(input) {
    input.classList.remove("input-error", "input-valid");
    const errorEl = document.getElementById(`err-${input.id}`);
    if (errorEl) errorEl.textContent = "";
  }

  // Tik lietuviško telefono numerio (+370 6xx xxxxx) formatavimas realiu laiku
  function formatLithuanianPhone(rawValue, isDeleting = false) {
    let digits = rawValue.replace(/\D/g, "");

    if (digits.length === 0) {
      return "";
    }

    // Jei vartotojas trina simbolius ir liko tik šalies kodas "370", išvalome lauką
    if (isDeleting && digits === "370") {
      return "";
    }

    // Leidžiame natūraliai suvesti pradžią "3", "37"
    if (!rawValue.startsWith("+370") && (digits === "3" || digits === "37")) {
      return "+" + digits;
    }

    // Nuimame šalies kodą 370 arba vietinį prefiksą 8 / 0
    if (digits.startsWith("370")) {
      digits = digits.slice(3);
    } else if (digits.startsWith("8") || digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    if (digits.length === 0) {
      return "+370 ";
    }

    // Pirmasis mobiliojo numerio skaitmuo po +370 turi būti 6
    if (digits[0] !== "6") {
      digits = "6" + digits.slice(1);
    }

    // Apribojame iki 8 skaitmenų po +370 (6xx xxxxx)
    digits = digits.slice(0, 8);

    if (digits.length <= 3) {
      return `+370 ${digits}`;
    }
    return `+370 ${digits.slice(0, 3)} ${digits.slice(3, 8)}`;
  }

  function validatePhone() {
    const val = phoneInput.value.trim();
    if (!val) {
      return setFieldError(phoneInput, "Telefono numeris yra privalomas.");
    }
    if (!ltPhoneRegex.test(val)) {
      return setFieldError(phoneInput, "Numeris turi atitikti formatą +370 6xx xxxxx.");
    }
    return setFieldError(phoneInput, "");
  }

  function validateTextField(input, label) {
    const val = input.value.trim();
    if (!val) {
      return setFieldError(input, `${label} yra privalomas.`);
    }
    if (!lettersOnlyRegex.test(val)) {
      return setFieldError(input, `${label} gali sudaryti tik raidės.`);
    }
    return setFieldError(input, "");
  }

  function validateEmail(showRequired = false) {
    const val = emailInput.value.trim();
    if (!val) {
      if (showRequired) {
        return setFieldError(emailInput, "El. paštas yra privalomas.");
      }
      clearFieldState(emailInput);
      return false;
    }
    if (!emailRegex.test(val)) {
      return setFieldError(emailInput, "Neteisingas el. pašto formatas.");
    }
    return setFieldError(emailInput, "");
  }

  function validateAddress() {
    const val = addressInput.value.trim();
    if (!val) {
      return setFieldError(addressInput, "Adresas yra privalomas.");
    }
    return setFieldError(addressInput, "");
  }

  function validateRating(input, index) {
    const raw = input.value.trim();
    if (raw === "") {
      return setFieldError(input, `Įveskite ${index + 1} įvertinimą (1–10).`);
    }
    const num = Number(raw);
    if (!Number.isInteger(num) || num < 1 || num > 10) {
      return setFieldError(input, "Reikšmė turi būti sveikas skaičius nuo 1 iki 10.");
    }
    return setFieldError(input, "");
  }

  function isFormValidSilent() {
    const firstNameOk = firstNameInput.value.trim() !== "" && lettersOnlyRegex.test(firstNameInput.value.trim());
    const lastNameOk = lastNameInput.value.trim() !== "" && lettersOnlyRegex.test(lastNameInput.value.trim());
    const emailOk = emailRegex.test(emailInput.value.trim());
    const phoneOk = ltPhoneRegex.test(phoneInput.value.trim());
    const addressOk = addressInput.value.trim() !== "";
    const ratingsOk = ratingInputs.every((inp) => {
      const val = inp.value.trim();
      const num = Number(val);
      return val !== "" && Number.isInteger(num) && num >= 1 && num <= 10;
    });

    return firstNameOk && lastNameOk && emailOk && phoneOk && addressOk && ratingsOk;
  }

  function updateSubmitButtonState() {
    submitBtn.disabled = !isFormValidSilent();
  }

  firstNameInput.addEventListener("input", () => {
    validateTextField(firstNameInput, "Vardas");
    updateSubmitButtonState();
  });

  lastNameInput.addEventListener("input", () => {
    validateTextField(lastNameInput, "Pavardė");
    updateSubmitButtonState();
  });

  emailInput.addEventListener("input", () => {
    const val = emailInput.value.trim();
    if (emailRegex.test(val)) {
      setFieldError(emailInput, "");
    } else {
      emailInput.classList.remove("input-valid");
    }
    updateSubmitButtonState();
  });

  emailInput.addEventListener("blur", () => {
    if (emailInput.value.trim() !== "") {
      validateEmail(false);
    }
  });

  phoneInput.addEventListener("input", (event) => {
    const isDeleting = event.inputType && event.inputType.startsWith("delete");
    phoneInput.value = formatLithuanianPhone(phoneInput.value, isDeleting);
    validatePhone();
    updateSubmitButtonState();
  });

  addressInput.addEventListener("input", () => {
    validateAddress();
    updateSubmitButtonState();
  });

  ratingInputs.forEach((input, idx) => {
    input.addEventListener("input", () => {
      validateRating(input, idx);
      updateSubmitButtonState();
    });
  });

  if (submitWrapper) {
    submitWrapper.addEventListener("click", () => {
      if (submitBtn.disabled && emailInput.value.trim() === "") {
        validateEmail(true);
      }
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const valid =
      validateTextField(firstNameInput, "Vardas") &
      validateTextField(lastNameInput, "Pavardė") &
      validateEmail(true) &
      validatePhone() &
      validateAddress() &
      validateRating(ratingInputs[0], 0) &
      validateRating(ratingInputs[1], 1) &
      validateRating(ratingInputs[2], 2);

    updateSubmitButtonState();
    if (!valid) return;

    const r1 = Number(ratingInputs[0].value);
    const r2 = Number(ratingInputs[1].value);
    const r3 = Number(ratingInputs[2].value);
    const average = ((r1 + r2 + r3) / 3).toFixed(1);

    const formDataObj = {
      vardas: firstNameInput.value.trim(),
      pavarde: lastNameInput.value.trim(),
      elPastas: emailInput.value.trim(),
      telefonas: phoneInput.value.trim(),
      adresas: addressInput.value.trim(),
      ivertinimai: [r1, r2, r3],
      vidurkis: Number(average)
    };

    console.log("Pateikti formos duomenys:", formDataObj);

    resultBox.innerHTML = `
      <p><strong>Vardas:</strong> ${formDataObj.vardas}</p>
      <p><strong>Pavardė:</strong> ${formDataObj.pavarde}</p>
      <p><strong>El. paštas:</strong> <a href="mailto:${formDataObj.elPastas}">${formDataObj.elPastas}</a></p>
      <p><strong>Tel. Numeris:</strong> ${formDataObj.telefonas}</p>
      <p><strong>Adresas:</strong> ${formDataObj.adresas}</p>
      <p><strong>Įvertinimai:</strong> ${r1}, ${r2}, ${r3}</p>
      <p class="mt-3"><strong>${formDataObj.vardas} ${formDataObj.pavarde}: ${average}</strong></p>
    `;
    resultBox.classList.add("visible");
  });

  clearBtn.addEventListener("click", () => {
    form.reset();
    resultBox.innerHTML = "";
    resultBox.classList.remove("visible");

    [firstNameInput, lastNameInput, emailInput, phoneInput, addressInput, ...ratingInputs].forEach((input) => {
      clearFieldState(input);
    });

    submitBtn.disabled = true;
  });
});