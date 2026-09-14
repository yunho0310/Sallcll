(function () {
  const root = document.getElementById("revolver");
  if (!root) return;

  const cards = Array.from(root.querySelectorAll(".rev-card"));
  const n = cards.length;
  if (!n) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const now = document.getElementById("rev-now");
  const dotsRoot = document.getElementById("rev-dots");
  let index = 0;
  let timer = 0;
  let dir = 0;
  let intro = true;

  if (dotsRoot) {
    cards.forEach(function (el, i) {
      const dot = document.createElement("button");
      dot.type = "button";
      const name = el.querySelector(".rev-cover");
      dot.setAttribute("aria-label", name ? name.textContent.trim() : "화면 " + (i + 1));
      dot.addEventListener("click", function () {
        stopSpin();
        rotateTo(i);
      });
      dotsRoot.appendChild(dot);
    });
  }

  function offset(i) {
    return ((i - index) % n + n) % n;
  }

  function paint() {
    cards.forEach(function (el, i) {
      const d = offset(i);
      el.classList.toggle("is-front", d === 0);
      el.classList.toggle("is-right", d === 1);
      el.classList.toggle("is-back", d === 2);
      el.classList.toggle("is-left", d === 3);
    });
    const front = cards[index];
    const label = front && front.querySelector(".rev-cover");
    if (now && label) now.textContent = label.textContent.trim();
    if (dotsRoot) {
      Array.from(dotsRoot.children).forEach(function (dot, i) {
        dot.classList.toggle("is-on", i === index);
      });
    }
  }

  function step(delta) {
    index = (index + delta + n) % n;
    paint();
  }

  function rotateTo(i) {
    index = i;
    paint();
  }

  function stopSpin() {
    if (timer) {
      window.clearInterval(timer);
      timer = 0;
    }
    dir = 0;
  }

  function startSpin(next) {
    if (intro || reduce || next === 0) {
      stopSpin();
      return;
    }
    if (dir === next && timer) return;
    stopSpin();
    dir = next;
    step(next);
    timer = window.setInterval(function () {
      step(next);
    }, 560);
  }

  root.addEventListener("pointermove", function (e) {
    const rect = root.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    if (x < 0.22) {
      root.style.cursor = "w-resize";
      startSpin(-1);
    } else if (x > 0.78) {
      root.style.cursor = "e-resize";
      startSpin(1);
    } else {
      root.style.cursor = "pointer";
      stopSpin();
    }
  });

  root.addEventListener("pointerleave", stopSpin);

  cards.forEach(function (el, i) {
    el.addEventListener("click", function (e) {
      if (offset(i) === 0) return;
      e.preventDefault();
      stopSpin();
      rotateTo(i);
    });
  });

  function introSpin() {
    paint();
    if (reduce) {
      intro = false;
      root.classList.add("is-settled");
      return;
    }
    root.classList.add("is-intro");
    window.setTimeout(function () {
      intro = false;
      root.classList.remove("is-intro");
      root.classList.add("is-settled");
    }, 980);
  }

  introSpin();
})();
