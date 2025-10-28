const themeButtons = document.querySelectorAll('.theme-button');
const themes = Array.from(themeButtons).map(btn => ({
    element: btn,
    theme: btn.getAttribute('data-theme'),
    name: btn.textContent.trim()
}));

let currentThemeIndex = 0;

// Function to switch theme
function switchToTheme(index) {
    currentThemeIndex = index;
    const themeData = themes[currentThemeIndex];

    // Switch the stylesheet
    document.getElementById('theme-style').href = `styles/${themeData.theme}.css`;

    // Update active button
    themeButtons.forEach(btn => btn.classList.remove('active'));
    themeData.element.classList.add('active');

    // Save to localStorage
    localStorage.setItem('selectedTheme', themeData.theme);
}

// Function to go to next theme
function nextTheme() {
    const nextIndex = (currentThemeIndex + 1) % themes.length;
    switchToTheme(nextIndex);
}

// Function to go to previous theme
function previousTheme() {
    const prevIndex = (currentThemeIndex - 1 + themes.length) % themes.length;
    switchToTheme(prevIndex);
}

// Add arrow navigation
document.addEventListener('DOMContentLoaded', function() {
    const themeButtonsContainer = document.querySelector('.theme-buttons');

    // Create navigation arrows
    const prevArrow = document.createElement('button');
    prevArrow.className = 'theme-nav-btn prev-btn';
    prevArrow.innerHTML = '‹';
    prevArrow.setAttribute('aria-label', 'Previous theme');

    const nextArrow = document.createElement('button');
    nextArrow.className = 'theme-nav-btn next-btn';
    nextArrow.innerHTML = '›';
    nextArrow.setAttribute('aria-label', 'Next theme');

    // Insert arrows
    themeButtonsContainer.insertBefore(prevArrow, themeButtonsContainer.firstChild);
    themeButtonsContainer.appendChild(nextArrow);

    // Add click events
    prevArrow.addEventListener('click', previousTheme);
    nextArrow.addEventListener('click', nextTheme);
});

// Load saved theme on page load
window.addEventListener('load', function() {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        const savedIndex = themes.findIndex(t => t.theme === savedTheme);
        if (savedIndex !== -1) {
            switchToTheme(savedIndex);
        }
    } else {
        switchToTheme(0);
    }
});

  // Navbar scroll behavior - stop sticky at About section
  window.addEventListener('scroll', function() {
      const navbar = document.querySelector('.headnav');
      const aboutSection = document.getElementById('About');

      if (navbar && aboutSection) {
          const aboutTop = aboutSection.offsetTop;
          const scrollPosition = window.scrollY;

          if (scrollPosition >= aboutTop - navbar.offsetHeight) {
              navbar.classList.add('nav-static');
          } else {
              navbar.classList.remove('nav-static');
          }
      }
  });