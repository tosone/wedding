/* =========================================================
   婚礼邀请 · 交互
   - 舞台等比缩放：高度占满视口，宽度按比例
   - 内容匀缓自动向下滚动
   - 滚轮 / 触摸 / 键盘都可以介入，松手后继续缓慢滚动
   ========================================================= */

(function () {
  "use strict";

  var DESIGN_W = 390;
  var DESIGN_H = 844;
  var AUTO_SCROLL_ENABLED = false; // 暂停自动滚动；想恢复改成 true
  var AUTO_SPEED = 40; // 设计稿像素 / 秒
  var WHEEL_RESUME_DELAY = 1100;
  var TOUCH_RESUME_DELAY = 1200;

  var stage = document.getElementById("stage");
  var viewport = document.getElementById("viewport");
  var content = document.getElementById("content");

  var scale = 1;
  var viewportHeight = DESIGN_H;
  var maxScroll = 0;
  var pos = 0;
  var target = 0;
  var dragging = false;
  var startY = 0;
  var startTarget = 0;
  var dragVelocity = 0;
  var inertia = 0;
  var lastMoveY = 0;
  var lastMoveTime = 0;
  var resumeAt = 0;
  var lastFrame = 0;
  var started = false;

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /* ---------- 舞台缩放 ---------- */

  function fitStage() {
    if (
      document.activeElement &&
      /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)
    ) {
      return;
    }

    var previousMax = maxScroll;
    var progress = previousMax > 0 ? pos / previousMax : 0;

    // 手机上宽度铺满屏幕，取景高度按设备比例补足；
    // 桌面端仍然高度铺满，宽度等比放大。
    if (window.innerWidth <= 600) {
      scale = window.innerWidth / DESIGN_W;
      viewportHeight = scale > 0 ? window.innerHeight / scale : DESIGN_H;
    } else {
      viewportHeight = 700;
      scale = Math.min(
        window.innerWidth / DESIGN_W,
        window.innerHeight / viewportHeight
      );
    }

    if (!isFinite(scale) || scale <= 0) {
      scale = 1;
      viewportHeight = DESIGN_H;
    }

    stage.style.height = viewportHeight + "px";
    stage.style.transform = "scale(" + scale + ")";
    measure();

    if (previousMax > 0) {
      var next = progress * maxScroll;
      pos = next;
      target = next;
    }
  }

  function measure() {
    maxScroll = Math.max(0, content.offsetHeight - viewportHeight);
    target = clamp(target, 0, maxScroll);
    pos = clamp(pos, 0, maxScroll);
  }

  /* ---------- 日历 ---------- */

  function buildCalendar() {
    var grid = document.getElementById("calendar-grid");
    if (!grid) {
      return;
    }

    var firstDay = new Date(2026, 10, 1).getDay(); // 0 = 周日
    var offset = (firstDay + 6) % 7; // 周一为一周第一天

    for (var i = 0; i < offset; i += 1) {
      var blank = document.createElement("span");
      blank.className = "calendar__day is-empty";
      grid.appendChild(blank);
    }

    for (var day = 1; day <= 30; day += 1) {
      var cell = document.createElement("span");
      cell.className =
        "calendar__day" + (day === 28 ? " is-active" : "");
      cell.textContent = String(day);
      grid.appendChild(cell);
    }
  }

  /* ---------- 倒计时 ---------- */

  function startCountdown() {
    var wedding = new Date("2026-11-28T00:00:00+08:00").getTime();
    var nums = {};
    var nodes = document.querySelectorAll(".cd-num");

    for (var i = 0; i < nodes.length; i += 1) {
      nums[nodes[i].getAttribute("data-unit")] = nodes[i];
    }

    function pad(value) {
      return String(value).padStart(2, "0");
    }

    function update() {
      var diff = Math.max(0, wedding - Date.now());
      var totalSeconds = Math.floor(diff / 1000);
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);

      if (nums.days) nums.days.textContent = pad(days);
      if (nums.hours) nums.hours.textContent = pad(hours);
    }

    update();
    window.setInterval(update, 1000);
  }

  /* ---------- 滚动引擎 ---------- */

  function frame(now) {
    if (!lastFrame) {
      lastFrame = now;
    }

    var dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;

    if (!dragging) {
      // 松手后的惯性
      if (inertia !== 0) {
        target += inertia * dt;
        inertia *= Math.exp(-dt * 3.2);
        if (Math.abs(inertia) < 12) {
          inertia = 0;
        }
      }

      if (now >= resumeAt) {
        var autoSpeed =
          AUTO_SCROLL_ENABLED &&
          !(reduceMotion && reduceMotion.matches)
            ? AUTO_SPEED
            : 0;
        target += autoSpeed * dt;
      }
    }

    target = clamp(target, 0, maxScroll);

    if (target <= 0 && inertia < 0) {
      inertia = 0;
    }
    if (target >= maxScroll && inertia > 0) {
      inertia = 0;
    }
    var easing = dragging ? 26 : 9;
    pos += (target - pos) * (1 - Math.exp(-dt * easing));

    if (Math.abs(target - pos) < 0.04) {
      pos = target;
    }

    content.style.transform = "translate3d(0, " + (-pos) + "px, 0)";
    window.requestAnimationFrame(frame);
  }

  function startEngine() {
    if (started) {
      return;
    }
    started = true;
    lastFrame = 0;
    resumeAt = performance.now() + 2400;
    window.requestAnimationFrame(frame);
  }

  function nudgeBy(delta) {
    target = clamp(target + delta, 0, maxScroll);
    resumeAt = performance.now() + WHEEL_RESUME_DELAY;
  }

  function normalizeWheel(event) {
    var delta = event.deltaY;
    if (event.deltaMode === 1) {
      delta *= 16;
    } else if (event.deltaMode === 2) {
      delta *= DESIGN_H;
    }
    return delta;
  }

  /* ---------- 滚轮 ---------- */

  window.addEventListener(
    "wheel",
    function (event) {
      if (event.ctrlKey) {
        return;
      }
      event.preventDefault();
      nudgeBy(normalizeWheel(event) / scale);
      playMusicSoon();
    },
    { passive: false }
  );

  /* ---------- 触摸拖动 ---------- */

  viewport.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "mouse") {
      return;
    }
    if (
      event.target.closest("input, textarea, button, a, select, label")
    ) {
      return;
    }

    dragging = true;
    startY = event.clientY;
    startTarget = target;
    target = pos;
    inertia = 0;
    dragVelocity = 0;
    lastMoveY = event.clientY;
    lastMoveTime = performance.now();

    if (viewport.setPointerCapture) {
      try {
        viewport.setPointerCapture(event.pointerId);
      } catch (error) {
        /* ignore */
      }
    }
  });

  viewport.addEventListener("pointermove", function (event) {
    if (!dragging) {
      return;
    }
    event.preventDefault();

    var now = performance.now();
    var dt = (now - lastMoveTime) / 1000;
    var dy = lastMoveY - event.clientY;

    if (dt > 0 && dt < 0.2 && Math.abs(dy) > 0.5) {
      var velocity = dy / scale / dt;
      dragVelocity = dragVelocity * 0.65 + velocity * 0.35;
      dragVelocity = clamp(dragVelocity, -5000, 5000);
    }

    lastMoveY = event.clientY;
    lastMoveTime = now;

    target = clamp(
      startTarget + (startY - event.clientY) / scale,
      0,
      maxScroll
    );
  });

  function endDrag() {
    if (!dragging) {
      return;
    }

    dragging = false;

    var idle = performance.now() - lastMoveTime;
    var velocity = idle < 140 ? dragVelocity : 0;

    inertia = clamp(velocity, -2600, 2600);
    if (Math.abs(inertia) < 60) {
      inertia = 0;
    }

    resumeAt = performance.now() + TOUCH_RESUME_DELAY;
  }


  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  /* ---------- 键盘 ---------- */

  window.addEventListener("keydown", function (event) {
    if (
      event.target &&
      event.target.matches &&
      event.target.matches("input, textarea")
    ) {
      return;
    }

    var step = DESIGN_H * 0.55;

    if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
      event.preventDefault();
      nudgeBy(step);
    } else if (event.key === "ArrowUp" || event.key === "PageUp") {
      event.preventDefault();
      nudgeBy(-step);
    } else if (event.key === "Home") {
      event.preventDefault();
      target = 0;
      resumeAt = performance.now() + WHEEL_RESUME_DELAY;
    } else if (event.key === "End") {
      event.preventDefault();
      target = maxScroll;
      resumeAt = performance.now() + WHEEL_RESUME_DELAY;
    }
  });

  /* ---------- 背景音乐 ---------- */

  var audio = document.getElementById("music");
  var musicButton = document.getElementById("music-btn");
  var musicPending = false;

  function syncMusic() {
    var paused = audio.paused;
    musicButton.classList.toggle("is-paused", paused);
    musicButton.setAttribute("aria-pressed", String(!paused));
  }

  function playMusic() {
    if (!audio.paused) {
      return;
    }
    var promise = audio.play();
    if (promise && promise.catch) {
      promise.catch(function () {
        musicPending = false;
        syncMusic();
      });
    }
  }

  function playMusicSoon() {
    if (!musicPending && audio.paused) {
      musicPending = true;
      playMusic();
    }
  }

  function toggleMusic() {
    if (audio.paused) {
      playMusic();
    } else {
      audio.pause();
    }
  }

  if (audio) {
    audio.volume = 0.55;
    audio.addEventListener("play", function () {
      musicPending = false;
      syncMusic();
    });
    audio.addEventListener("pause", syncMusic);
    audio.addEventListener("ended", syncMusic);

    musicButton.addEventListener("click", toggleMusic);

    ["pointerdown", "keydown"].forEach(function (name) {
      window.addEventListener(
        name,
        function (event) {
          if (
            event.target &&
            event.target.closest &&
            event.target.closest("#music-btn")
          ) {
            return;
          }
          playMusicSoon();
        },
        { once: true, passive: name === "pointerdown" }
      );
    });

    window.addEventListener("load", function () {
      playMusic();
      syncMusic();
    });

    syncMusic();
  }

  /* ---------- 初始化 ---------- */

  /* ---------- 婚礼视频 ---------- */

  function initVideos() {
    var items = Array.prototype.slice.call(
      document.querySelectorAll(".video-item")
    );
    if (!items.length) {
      return;
    }

    var media = [];
    items.forEach(function (item) {
      var video = item.querySelector("video");
      if (video) {
        media.push(video);
      }
    });

    items.forEach(function (item) {
      var video = item.querySelector("video");
      var playButton = item.querySelector(".video-item__play");
      var progress = item.querySelector(".video-item__progress");
      var fill = item.querySelector(".video-item__fill");
      if (!video || !playButton || !progress || !fill) {
        return;
      }

      function updatePlayState() {
        var playing = !video.paused && !video.ended;
        item.classList.toggle("is-playing", playing);
        playButton.setAttribute(
          "aria-label",
          playing ? "暂停视频" : "播放视频"
        );
      }

      function updateProgress() {
        var ratio = video.duration
          ? video.currentTime / video.duration
          : 0;
        ratio = Math.min(1, Math.max(0, ratio));
        fill.style.width = ratio * 100 + "%";
        progress.setAttribute(
          "aria-valuenow",
          String(Math.round(ratio * 100))
        );
      }

      playButton.addEventListener("click", function (event) {
        event.stopPropagation();
        if (video.paused || video.ended) {
          if (video.ended) {
            video.currentTime = 0;
          }
          var promise = video.play();
          if (promise && promise.catch) {
            promise.catch(function () {});
          }
        } else {
          video.pause();
        }
      });

      video.addEventListener("click", function () {
        if (!video.paused) {
          video.pause();
        }
      });

      video.addEventListener("play", function () {
        media.forEach(function (other) {
          if (other !== video) {
            other.pause();
          }
        });

        var bgMusic = document.getElementById("music");
        if (bgMusic && !bgMusic.paused) {
          bgMusic.pause();
        }

        updatePlayState();
      });

      video.addEventListener("pause", updatePlayState);
      video.addEventListener("ended", function () {
        updatePlayState();
        updateProgress();
      });
      video.addEventListener("timeupdate", updateProgress);
      video.addEventListener("loadedmetadata", updateProgress);

      progress.addEventListener("click", function (event) {
        if (!video.duration) {
          return;
        }
        var rect = progress.getBoundingClientRect();
        var ratio = (event.clientX - rect.left) / rect.width;
        ratio = Math.min(1, Math.max(0, ratio));
        video.currentTime = ratio * video.duration;
        updateProgress();
      });

      updateProgress();
      updatePlayState();
    });
  }

  function boot() {
    buildCalendar();
    startCountdown();
    initVideos();
    fitStage();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        measure();
        startEngine();
      });
    } else {
      window.setTimeout(function () {
        measure();
        startEngine();
      }, 300);
    }
  }

  window.addEventListener("resize", fitStage);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
