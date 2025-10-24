const themeButtons = document.querySelectorAll('.theme-button');

  // Add click event to each button
  themeButtons.forEach(button => {
      button.addEventListener('click', function() {
          // Get the theme name from data-theme attribute
          const theme = this.getAttribute('data-theme');

          // Switch the stylesheet
          document.getElementById('theme-style').href =
  `styles/${theme}.css`;

          // Update active button
          themeButtons.forEach(btn => btn.classList.remove('active'));
          this.classList.add('active');

          // Save to localStorage
          localStorage.setItem('selectedTheme', theme);
      });
  });

  // Load saved theme on page load
  window.addEventListener('load', function() {
      const savedTheme = localStorage.getItem('selectedTheme');
      if (savedTheme) {
          document.getElementById('theme-style').href =
  `styles/${savedTheme}.css`;

          // Update active button
          themeButtons.forEach(btn => {
              if (btn.getAttribute('data-theme') === savedTheme) {
                  btn.classList.add('active');
              } else {
                  btn.classList.remove('active');
              }
          });
      }
  });