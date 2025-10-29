let themeButtons;
let themes;
let currentThemeIndex = 0;

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create and add navigation arrows FIRST
    const themeButtonsContainer = document.querySelector('.theme-buttons');

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

    // NOW query theme buttons (after arrows are in place)
    themeButtons = document.querySelectorAll('.theme-button');
    themes = Array.from(themeButtons).map(btn => ({
        element: btn,
        theme: btn.getAttribute('data-theme'),
        name: btn.textContent.trim()
    }));

    console.log('Themes loaded:', themes); // Debug log

    // Add click event listeners to all theme buttons
    themeButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            console.log('Button clicked:', themes[index].name); // Debug log
            switchToTheme(index);
        });
    });

    // Add click events to arrows
    prevArrow.addEventListener('click', previousTheme);
    nextArrow.addEventListener('click', nextTheme);

    // Initialize the first theme
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        const savedIndex = themes.findIndex(t => t.theme === savedTheme);
        if (savedIndex !== -1) {
            switchToTheme(savedIndex);
        } else {
            switchToTheme(0);
        }
    } else {
        switchToTheme(0);
    }
});

// Function to switch theme
function switchToTheme(index) {
    if (!themes || !themes[index]) {
        console.error('Invalid theme index:', index);
        return;
    }

    currentThemeIndex = index;
    const themeData = themes[currentThemeIndex];

    console.log('Switching to theme:', themeData.name); // Debug log

    // Switch the stylesheet
    document.getElementById('theme-style').href = `styles/${themeData.theme}.css`;

    // Update active button
    themeButtons.forEach(btn => btn.classList.remove('active'));
    themeData.element.classList.add('active');

    // Update theme switcher heading to show current theme name
    const themeSwitcherHeading = document.querySelector('.theme-switcher h3');
    if (themeSwitcherHeading) {
        themeSwitcherHeading.textContent = themeData.name;
        console.log('Heading updated to:', themeData.name); // Debug log
    } else {
        console.error('Theme switcher heading not found');
    }

    // Save to localStorage
    localStorage.setItem('selectedTheme', themeData.theme);
}

// Function to go to next theme
function nextTheme() {
    if (!themes) return;
    const nextIndex = (currentThemeIndex + 1) % themes.length;
    switchToTheme(nextIndex);
}

// Function to go to previous theme
function previousTheme() {
    if (!themes) return;
    const prevIndex = (currentThemeIndex - 1 + themes.length) % themes.length;
    switchToTheme(prevIndex);
}

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
