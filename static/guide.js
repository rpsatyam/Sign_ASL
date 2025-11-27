// Sign Language Guide JavaScript Functions

// Show alphabet based on selected tab (ASL or ISL)
function showAlphabet(language) {
  const aslAlphabet = document.getElementById('asl-alphabet');
  const islAlphabet = document.getElementById('isl-alphabet');
  const tabs = document.querySelectorAll('.tab-btn');
  
  // Remove active class from all tabs
  tabs.forEach(tab => tab.classList.remove('active'));
  
  if (language === 'asl') {
    aslAlphabet.style.display = 'grid';
    islAlphabet.style.display = 'none';
    tabs[0].classList.add('active');
    showNotification('Switched to ASL Alphabet', 'success');
  } else if (language === 'isl') {
    aslAlphabet.style.display = 'none';
    islAlphabet.style.display = 'grid';
    tabs[1].classList.add('active');
    showNotification('Switched to ISL Alphabet', 'success');
  }
}

// Filter signs by category
let currentFilter = 'all';

function filterSigns(category) {
  currentFilter = category;
  const signCards = document.querySelectorAll('.sign-card-demo');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  // Update active filter button
  filterBtns.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  signCards.forEach(card => {
    const cardCategory = card.querySelector('.sign-category').textContent.toLowerCase();
    
    if (category === 'all' || cardCategory.includes(category.toLowerCase())) {
      card.style.display = 'block';
      card.style.animation = 'cardFadeIn 0.6s ease-out';
    } else {
      card.style.display = 'none';
    }
  });
  
  showNotification(`Showing ${category === 'all' ? 'all' : category} signs`, 'success');
}

// Add click sound effect to cards
function playClickSound() {
  // Create a simple beep sound using Web Audio API
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Add click handlers to all sign cards
document.addEventListener('DOMContentLoaded', () => {
  // Letter cards click handler
  const letterCards = document.querySelectorAll('.letter-card');
  letterCards.forEach(card => {
    card.addEventListener('click', () => {
      playClickSound();
      const letter = card.getAttribute('data-letter');
      showLetterDetail(letter, card);
    });
  });
  
  // Sign cards click handler
  const signCards = document.querySelectorAll('.sign-card-demo');
  signCards.forEach(card => {
    card.addEventListener('click', () => {
      playClickSound();
      showSignDetail(card);
    });
  });
  
  // Add category data attributes for filtering
  signCards.forEach(card => {
    const category = card.querySelector('.sign-category').textContent.toLowerCase();
    card.setAttribute('data-category', category.replace(/\s+/g, '-'));
  });
});

// Show detailed letter information in modal
function showLetterDetail(letter, cardElement) {
  const letterName = cardElement.querySelector('.letter-name').textContent;
  const letterDesc = cardElement.querySelector('.letter-desc').textContent;
  const letterVisual = cardElement.querySelector('.letter-visual').textContent;
  
  const modal = document.createElement('div');
  modal.className = 'detail-modal';
  modal.innerHTML = `
    <div class="detail-content glassmorphism-strong">
      <span class="close-detail" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <div class="detail-visual">${letterVisual}</div>
      <h2>${letterName}</h2>
      <p class="detail-description">${letterDesc}</p>
      <div class="detail-tips">
        <h4>💡 Practice Tips:</h4>
        <ul>
          <li>Hold the position steady for 1-2 seconds</li>
          <li>Keep your hand at chest level</li>
          <li>Practice in front of a mirror</li>
          <li>Ensure fingers are clearly positioned</li>
        </ul>
      </div>
      <button class="glass-btn primary" onclick="practiceSign('${letter}')">
        Practice This Sign
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
}

// Show detailed sign information in modal
function showSignDetail(cardElement) {
  const signName = cardElement.querySelector('h4').textContent;
  const signInstruction = cardElement.querySelector('.sign-instruction').textContent;
  const signEmoji = cardElement.querySelector('.sign-emoji').textContent;
  const signCategory = cardElement.querySelector('.sign-category').textContent;
  const badges = Array.from(cardElement.querySelectorAll('.tip-badge')).map(b => b.textContent).join(', ');
  
  const modal = document.createElement('div');
  modal.className = 'detail-modal';
  modal.innerHTML = `
    <div class="detail-content glassmorphism-strong">
      <span class="close-detail" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <div class="sign-category-badge">${signCategory}</div>
      <div class="detail-visual">${signEmoji}</div>
      <h2>${signName}</h2>
      <p class="detail-description">${signInstruction}</p>
      <div class="detail-badges">
        <strong>Available in:</strong> ${badges}
      </div>
      <div class="detail-tips">
        <h4>📝 Step-by-Step Guide:</h4>
        <ol>
          <li>Start with hands in neutral position</li>
          <li>Form the sign slowly and deliberately</li>
          <li>Hold the final position briefly</li>
          <li>Repeat 5-10 times for muscle memory</li>
        </ol>
      </div>
      <div class="detail-actions">
        <button class="glass-btn primary" onclick="practiceSign('${signName}')">
          🎯 Practice Mode
        </button>
        <button class="glass-btn secondary" onclick="addToFavorites('${signName}')">
          ⭐ Add to Favorites
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
}

// Practice mode - integrates with camera
function practiceSign(signName) {
  if (!currentUser) {
    showNotification('Please login to use practice mode', 'error');
    showAuthModal();
    return;
  }
  
  // Close any open modals
  document.querySelectorAll('.detail-modal').forEach(m => m.remove());
  
  // Scroll to translator section
  document.querySelector('#translator').scrollIntoView({ behavior: 'smooth' });
  
  showNotification(`Practice mode activated for: ${signName}`, 'success');
  
  // Start camera if not already running
  setTimeout(() => {
    startCamera();
  }, 1000);
}

// Add to favorites (stored in memory)
const favorites = [];

function addToFavorites(signName) {
  if (!currentUser) {
    showNotification('Please login to save favorites', 'error');
    showAuthModal();
    return;
  }
  
  if (!favorites.includes(signName)) {
    favorites.push(signName);
    showNotification(`${signName} added to favorites!`, 'success');
  } else {
    showNotification(`${signName} is already in favorites`, 'error');
  }
}

// View favorites
function viewFavorites() {
  if (favorites.length === 0) {
    showNotification('No favorites yet. Click on signs to add them!', 'error');
    return;
  }
  
  const modal = document.createElement('div');
  modal.className = 'detail-modal';
  
  const favList = favorites.map(fav => `<li>${fav}</li>`).join('');
  
  modal.innerHTML = `
    <div class="detail-content glassmorphism-strong">
      <span class="close-detail" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h2>⭐ Your Favorite Signs</h2>
      <ul class="favorites-list">
        ${favList}
      </ul>
      <button class="glass-btn secondary" onclick="clearFavorites()">
        Clear All Favorites
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
}

// Clear favorites
function clearFavorites() {
  favorites.length = 0;
  document.querySelectorAll('.detail-modal').forEach(m => m.remove());
  showNotification('Favorites cleared', 'success');
}

// Download alphabet guide as PDF (simulated)
function downloadGuide(language) {
  showNotification(`Downloading ${language.toUpperCase()} guide... (Feature coming soon!)`, 'success');
  
  // In a real implementation, you would generate a PDF here
  // For now, we'll just show a notification
  setTimeout(() => {
    showNotification('PDF generation is not yet implemented', 'error');
  }, 2000);
}

// Print guide
function printGuide() {
  window.print();
  showNotification('Print dialog opened', 'success');
}

// Search signs functionality
function searchSigns() {
  const searchTerm = document.getElementById('signSearch').value.toLowerCase();
  const signCards = document.querySelectorAll('.sign-card-demo');
  const letterCards = document.querySelectorAll('.letter-card');
  
  let foundCount = 0;
  
  // Search in sign cards
  signCards.forEach(card => {
    const signName = card.querySelector('h4').textContent.toLowerCase();
    const signDesc = card.querySelector('.sign-instruction').textContent.toLowerCase();
    
    if (signName.includes(searchTerm) || signDesc.includes(searchTerm)) {
      card.style.display = 'block';
      card.style.animation = 'cardFadeIn 0.6s ease-out';
      foundCount++;
    } else {
      card.style.display = 'none';
    }
  });
  
  // Search in letter cards
  letterCards.forEach(card => {
    const letterName = card.querySelector('.letter-name').textContent.toLowerCase();
    
    if (letterName.includes(searchTerm)) {
      card.style.display = 'block';
      card.style.animation = 'cardFadeIn 0.6s ease-out';
      foundCount++;
    } else if (searchTerm === '') {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
  
  if (searchTerm !== '') {
    showNotification(`Found ${foundCount} results for "${searchTerm}"`, 'success');
  }
}

// Quiz mode - test your knowledge
function startQuiz() {
  if (!currentUser) {
    showNotification('Please login to take the quiz', 'error');
    showAuthModal();
    return;
  }
  
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const randomLetter = letters[Math.floor(Math.random() * letters.length)];
  
  const modal = document.createElement('div');
  modal.className = 'detail-modal';
  modal.innerHTML = `
    <div class="detail-content glassmorphism-strong">
      <span class="close-detail" onclick="this.parentElement.parentElement.remove()">&times;</span>
      <h2>🎓 Sign Language Quiz</h2>
      <p class="quiz-question">What letter is this sign?</p>
      <div class="quiz-visual">✊</div>
      <div class="quiz-options">
        <button class="glass-btn" onclick="checkQuizAnswer('A', '${randomLetter}')">A</button>
        <button class="glass-btn" onclick="checkQuizAnswer('B', '${randomLetter}')">B</button>
        <button class="glass-btn" onclick="checkQuizAnswer('C', '${randomLetter}')">C</button>
        <button class="glass-btn" onclick="checkQuizAnswer('D', '${randomLetter}')">D</button>
      </div>
      <p class="quiz-note">Quiz feature coming soon with full functionality!</p>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
}

function checkQuizAnswer(selected, correct) {
  if (selected === correct) {
    showNotification('Correct! 🎉', 'success');
  } else {
    showNotification(`Incorrect. The correct answer was ${correct}`, 'error');
  }
  
  document.querySelectorAll('.detail-modal').forEach(m => m.remove());
}

// Add CSS for detail modal
const detailModalStyle = document.createElement('style');
detailModalStyle.textContent = `
  .detail-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
    padding: 2rem;
  }
  
  .detail-modal.show {
    opacity: 1;
  }
  
  .detail-content {
    max-width: 600px;
    width: 100%;
    padding: 3rem;
    border-radius: 30px;
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.4s ease;
  }
  
  .close-detail {
    position: absolute;
    right: 20px;
    top: 20px;
    font-size: 2rem;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.8);
    transition: all 0.3s;
    z-index: 1;
  }
  
  .close-detail:hover {
    color: #fff;
    transform: rotate(90deg);
  }
  
  .detail-visual {
    font-size: 5rem;
    text-align: center;
    margin: 2rem 0;
    animation: bounce 1s infinite;
  }
  
  .detail-content h2 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 1rem;
    color: #fff;
  }
  
  .detail-description {
    font-size: 1.2rem;
    text-align: center;
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 2rem;
    line-height: 1.8;
  }
  
  .detail-tips {
    background: rgba(255, 255, 255, 0.05);
    padding: 1.5rem;
    border-radius: 15px;
    margin-bottom: 2rem;
  }
  
  .detail-tips h4 {
    color: #fff;
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }
  
  .detail-tips ul,
  .detail-tips ol {
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.8;
    padding-left: 1.5rem;
  }
  
  .detail-tips li {
    margin-bottom: 0.8rem;
  }
  
  .detail-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .detail-badges {
    text-align: center;
    margin-bottom: 1.5rem;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.1rem;
  }
  
  .sign-category-badge {
    display: inline-block;
    padding: 0.5rem 1.5rem;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8));
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .favorites-list {
    list-style: none;
    padding: 0;
    margin: 2rem 0;
  }
  
  .favorites-list li {
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    margin-bottom: 0.8rem;
    color: #fff;
    font-size: 1.1rem;
  }
  
  .quiz-question {
    font-size: 1.5rem;
    text-align: center;
    margin: 2rem 0 1rem;
    color: #fff;
  }
  
  .quiz-visual {
    font-size: 6rem;
    text-align: center;
    margin: 2rem 0;
  }
  
  .quiz-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin: 2rem 0;
  }
  
  .quiz-note {
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin-top: 1rem;
  }
  
  @media (max-width: 768px) {
    .detail-content {
      padding: 2rem 1.5rem;
    }
    
    .quiz-options {
      grid-template-columns: 1fr;
    }
  }
`;

document.head.appendChild(detailModalStyle);

console.log('🎓 Sign Language Guide System Initialized');
console.log('Available functions: showAlphabet, filterSigns, practiceSign, startQuiz');