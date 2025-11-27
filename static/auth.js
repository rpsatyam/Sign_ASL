// Predefined user credentials
const users = {
  'himanshu@signspeak.com': {
    password: 'demo123',
    name: 'Himanshu'
  },
  'user@test.com': {
    password: 'test456',
    name: 'Test User'
  }
};

// Store registered users in memory
const registeredUsers = {};

// Current logged-in user
let currentUser = null;

// Check if user is logged in on page load
window.addEventListener('DOMContentLoaded', () => {
  checkLoginStatus();
  initLazyLoading();
  
  // Show login modal after 10 seconds if not logged in
  setTimeout(() => {
    if (!currentUser) {
      showAuthModal();
    }
  }, 10000);
});

// Check login status
function checkLoginStatus() {
  const userData = sessionStorage.getItem('signspeakUser');
  if (userData) {
    currentUser = JSON.parse(userData);
    updateUIForLoggedInUser();
  }
}

// Show authentication modal
function showAuthModal() {
  const modal = document.getElementById('authModal');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// Close authentication modal
function closeAuthModal() {
  const modal = document.getElementById('authModal');
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
}

// Show login form
function showLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
}

// Show signup form
function showSignup() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
}

// Handle login
function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  // Check predefined users
  if (users[email] && users[email].password === password) {
    currentUser = {
      email: email,
      name: users[email].name
    };
    loginSuccess();
    return;
  }
  
  // Check registered users
  if (registeredUsers[email] && registeredUsers[email].password === password) {
    currentUser = {
      email: email,
      name: registeredUsers[email].name
    };
    loginSuccess();
    return;
  }
  
  // Invalid credentials
  showNotification('Invalid email or password', 'error');
}

// Handle signup
function handleSignup(event) {
  event.preventDefault();
  
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  
  // Check if user already exists
  if (users[email] || registeredUsers[email]) {
    showNotification('User already exists. Please login.', 'error');
    return;
  }
  
  // Validate password
  if (password.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }
  
  // Register user
  registeredUsers[email] = {
    name: name,
    password: password
  };
  
  currentUser = {
    email: email,
    name: name
  };
  
  showNotification('Account created successfully!', 'success');
  setTimeout(() => {
    loginSuccess();
  }, 1500);
}

// Login success handler
function loginSuccess() {
  sessionStorage.setItem('signspeakUser', JSON.stringify(currentUser));
  updateUIForLoggedInUser();
  closeAuthModal();
  showNotification(`Welcome back, ${currentUser.name}!`, 'success');
}

// Update UI for logged-in user
function updateUIForLoggedInUser() {
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userGreeting').style.display = 'inline';
  document.getElementById('authButton').textContent = 'Logout';
  document.getElementById('authButton').onclick = handleLogout;
}

// Handle logout
function handleLogout() {
  sessionStorage.removeItem('signspeakUser');
  currentUser = null;
  document.getElementById('userGreeting').style.display = 'none';
  document.getElementById('authButton').textContent = 'Login';
  document.getElementById('authButton').onclick = handleAuthClick;
  showNotification('Logged out successfully', 'success');
}

// Handle auth button click
function handleAuthClick() {
  if (currentUser) {
    handleLogout();
  } else {
    showAuthModal();
  }
}

// Show notification
function showNotification(message, type) {
  // Remove existing notification
  const existing = document.querySelector('.notification');
  if (existing) {
    existing.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  const styles = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 1rem 2rem;
    border-radius: 12px;
    background: ${type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
    backdrop-filter: blur(10px);
    color: white;
    font-weight: 600;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideInRight 0.4s ease, fadeOut 0.4s ease 2.6s;
  `;
  
  notification.style.cssText = styles;
  document.body.appendChild(notification);
  
  // Add animations
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes fadeOut {
      to {
        opacity: 0;
        transform: translateX(400px);
      }
    }
  `;
  document.head.appendChild(styleSheet);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Lazy Loading Implementation
function initLazyLoading() {
  const lazyElements = document.querySelectorAll('[data-lazy]');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('loaded');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  lazyElements.forEach(element => {
    observer.observe(element);
  });
}

// Theme switcher
function switchTheme(theme) {
  const body = document.body;
  
  // Remove all theme classes
  body.classList.remove('ocean-theme', 'sunset-theme', 'forest-theme', 'neon-theme');
  
  // Add selected theme
  if (theme !== 'purple') {
    body.classList.add(`${theme}-theme`);
  }
  
  // Update shapes colors based on theme
  const shapes = document.querySelectorAll('.shape');
  const themeColors = {
    purple: ['#667eea', '#764ba2', '#f093fb', '#3a47d5'],
    ocean: ['#00d2ff', '#3a47d5', '#0ba360', '#3cba92'],
    sunset: ['#fa709a', '#fee140', '#f093fb', '#f5576c'],
    forest: ['#0ba360', '#3cba92', '#00d2ff', '#667eea'],
    neon: ['#00f5ff', '#ff00e5', '#00d2ff', '#f093fb']
  };
  
  const colors = themeColors[theme] || themeColors.purple;
  shapes.forEach((shape, index) => {
    shape.style.background = colors[index % colors.length];
  });
  
  showNotification(`Theme changed to ${theme}`, 'success');
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('authModal');
  if (event.target === modal) {
    closeAuthModal();
  }
}

// Prevent modal close on Escape for first 10 seconds
let canCloseWithEscape = false;
setTimeout(() => {
  canCloseWithEscape = true;
}, 10000);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && canCloseWithEscape) {
    closeAuthModal();
  }
});

// Camera functions (placeholders - to be integrated with your existing script.js)
function startCamera() {
  if (!currentUser) {
    showNotification('Please login to use the camera', 'error');
    showAuthModal();
    return;
  }
  
  showNotification('Camera starting...', 'success');
  // Add your camera initialization code here
}

function stopCamera() {
  showNotification('Camera stopped', 'success');
  // Add your camera stop code here
}

function toggleFullscreen() {
  const videoContainer = document.getElementById('video-container');
  
  if (!document.fullscreenElement) {
    videoContainer.requestFullscreen().catch(err => {
      showNotification('Fullscreen not available', 'error');
    });
  } else {
    document.exitFullscreen();
  }
}

function changeResolution(resolution) {
  showNotification(`Resolution changed to ${resolution}`, 'success');
  // Add your resolution change code here
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add parallax effect to hero section
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.transform = `translateY(${scrolled * 0.5}px)`;
  }
});

// Add mouse move effect to floating cards
document.querySelectorAll('.floating-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
  });
});

// Add 3D tilt effect to cards
document.querySelectorAll('.step-card, .feature-card, .sign-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
  });
});

// Animate stats on scroll
const animateStats = () => {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const finalValue = target.textContent;
        const isPercentage = finalValue.includes('%');
        const numValue = parseInt(finalValue.replace(/[^\d]/g, ''));
        
        let current = 0;
        const increment = numValue / 50;
        const duration = 2000;
        const stepTime = duration / 50;
        
        const counter = setInterval(() => {
          current += increment;
          if (current >= numValue) {
            target.textContent = finalValue;
            clearInterval(counter);
          } else {
            if (isPercentage) {
              target.textContent = Math.floor(current) + '%';
            } else if (finalValue.includes('K')) {
              target.textContent = Math.floor(current) + 'K+';
            } else if (finalValue.includes('M')) {
              target.textContent = (current / 1000).toFixed(1) + 'M+';
            } else {
              target.textContent = Math.floor(current);
            }
          }
        }, stepTime);
        
        observer.unobserve(target);
      }
    });
  }, { threshold: 0.5 });
  
  statNumbers.forEach(stat => observer.observe(stat));
};

// Initialize stat animation
window.addEventListener('DOMContentLoaded', animateStats);

// Add cursor trail effect (optional)
let cursorTrail = [];
const maxTrailLength = 10;

document.addEventListener('mousemove', (e) => {
  cursorTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
  
  if (cursorTrail.length > maxTrailLength) {
    cursorTrail.shift();
  }
  
  // Remove old trail elements
  document.querySelectorAll('.cursor-trail').forEach(trail => {
    if (Date.now() - parseInt(trail.dataset.time) > 500) {
      trail.remove();
    }
  });
  
  // Optionally create trail elements (commented out to avoid performance issues)
  /*
  const trail = document.createElement('div');
  trail.className = 'cursor-trail';
  trail.dataset.time = Date.now();
  trail.style.cssText = `
    position: fixed;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    pointer-events: none;
    z-index: 9999;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    animation: fadeTrail 0.5s ease-out forwards;
  `;
  document.body.appendChild(trail);
  */
});

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add scroll-based header background change
const handleScroll = throttle(() => {
  const header = document.querySelector('header');
  if (window.scrollY > 100) {
    header.style.background = 'rgba(255, 255, 255, 0.15)';
  } else {
    header.style.background = 'rgba(255, 255, 255, 0.1)';
  }
}, 100);

window.addEventListener('scroll', handleScroll);

// Add loading screen
window.addEventListener('load', () => {
  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    transition: opacity 0.5s ease;
  `;
  
  const loaderContent = document.createElement('div');
  loaderContent.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 4rem; animation: wave 1s infinite;">🤟</div>
      <h2 style="color: white; margin-top: 1rem; font-size: 2rem;">signspeak</h2>
      <p style="color: rgba(255, 255, 255, 0.8); margin-top: 0.5rem;">Loading...</p>
    </div>
  `;
  
  loader.appendChild(loaderContent);
  
  // Fade out 
  setTimeout(() => {
    loader.style.opacity = '0';
    setTimeout(() => {
      loader.remove();
    }, 500);
  }, 1000);
});

console.log('🤟 signspeak Authentication System Initialized');
console.log('Demo Credentials:');
console.log('Email: demo@signspeak.com | Password: demo123');
console.log('Email: user@test.com | Password: test456');