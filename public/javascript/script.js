( () => {
  'use strict'
  var forms = document.querySelectorAll('.needs-validation')

  // Loop over each form and prevent submission if validation fails
  Array.prototype.slice.call(forms)
      .forEach(function (form) {
          form.addEventListener('submit', function (event) {
              if (!form.checkValidity()) {
                  event.preventDefault() // Prevent submission if validation fails
                  event.stopPropagation()
              }
              form.classList.add('was-validated') // Add Bootstrap validation class
          }, false)
      })
})()