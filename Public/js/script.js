// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false,
    );
  });
})();

(() => {
  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const navbar = document.querySelector(".navbar");
  if (navbar) {
    const toggleShadow = () => {
      if (window.scrollY > 10) {
        navbar.classList.add("shadow-sm");
      } else {
        navbar.classList.remove("shadow-sm");
      }
    };
    toggleShadow();
    window.addEventListener("scroll", toggleShadow);
  }
})();

(() => {
  const images = document.querySelectorAll(".listing-image");
  images.forEach((img) => {
    img.addEventListener("error", () => {
      const fallback = img.getAttribute("data-fallback");
      if (fallback && img.src !== fallback) {
        img.src = fallback;
      }
    });
  });
})();
