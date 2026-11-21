
(() => {
  "use strict";

  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;

  let ctx = null;
  let musicTimer = null;
  let musicOn = false;
  let soundEnabled = false;
  let step = 0;

  // Giai điệu game dễ thương, sáng tác riêng
  const melody = [
    523.25, 659.25, 783.99, 659.25,
    587.33, 698.46, 880.00, 698.46,
    659.25, 783.99, 987.77, 783.99,
    587.33, 659.25, 783.99, 523.25
  ];

  function engine() {
    if (!ctx) ctx = new AudioEngine();
    return ctx;
  }

  function playNote(frequency, duration = 0.2, volume = 0.08) {
    const audio = engine();
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      volume, audio.currentTime + 0.015
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001, audio.currentTime + duration
    );

    oscillator.connect(gain);
    gain.connect(audio.destination);

    oscillator.start();
    oscillator.stop(audio.currentTime + duration + 0.02);
  }

  function updateButton() {
    const button = document.getElementById("music-toggle");
    if (!button) return;

    button.textContent = musicOn ? "🎵 Nhạc: Bật" : "🔇 Nhạc: Tắt";
    button.setAttribute("aria-pressed", String(musicOn));
  }

  function stopMusic() {
    musicOn = false;
    if (musicTimer !== null) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
    updateButton();
  }

  async function startMusic() {
    const audio = engine();
    await audio.resume();

    if (musicOn) return;
    musicOn = true;
    soundEnabled = true;

    function nextNote() {
      if (!musicOn) return;
      playNote(melody[step], 0.25, 0.07);

      if (step % 4 === 0) {
        playNote(melody[step] / 2, 0.35, 0.025);
      }
      step = (step + 1) % melody.length;
    }

    nextNote();
    musicTimer = setInterval(nextNote, 340);
    updateButton();
  }

  function celebration() {
    if (!soundEnabled) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((frequency, index) => {
      setTimeout(() => {
        if (ctx && ctx.state === "running") {
          playNote(frequency, 0.3, 0.12);
        }
      }, index * 160);
    });
  }

  function createMusicButton() {
    if (document.getElementById("music-toggle")) return;

    const button = document.createElement("button");
    button.id = "music-toggle";
    button.type = "button";
    button.textContent = "🔇 Nhạc: Tắt";
    button.setAttribute("aria-pressed", "false");

    button.addEventListener("click", () => {
      if (musicOn) stopMusic();
      else startMusic();
    });

    document.body.appendChild(button);
  }

  // Phát âm thanh khi phần kết quả xuất hiện
  function watchResults() {
    let alreadyPlayed = false;

    const observer = new MutationObserver(() => {
      const score = document.querySelector(".score");

      if (score && !alreadyPlayed) {
        alreadyPlayed = true;
        stopMusic();
        celebration();
      }

      if (!score) alreadyPlayed = false;
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    createMusicButton();
    watchResults();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
