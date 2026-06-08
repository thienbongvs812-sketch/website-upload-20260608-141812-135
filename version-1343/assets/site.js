const menuButton = document.querySelector("[data-menu-button]");
const mobilePanel = document.querySelector("[data-mobile-panel]");

if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", () => {
        mobilePanel.classList.toggle("is-open");
    });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const setSlide = (nextIndex) => {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, current) => {
            slide.classList.toggle("is-active", current === index);
        });
        dots.forEach((dot, current) => {
            dot.classList.toggle("is-active", current === index);
        });
    };

    const startTimer = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => setSlide(index + 1), 5200);
    };

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            setSlide(Number(dot.dataset.heroDot));
            startTimer();
        });
    });

    if (prev) {
        prev.addEventListener("click", () => {
            setSlide(index - 1);
            startTimer();
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            setSlide(index + 1);
            startTimer();
        });
    }

    startTimer();
}

const filterBars = Array.from(document.querySelectorAll("[data-filter-bar], [data-search-page]"));

filterBars.forEach((bar) => {
    const section = bar.closest("section");
    const cards = Array.from(section.querySelectorAll(".movie-card"));
    const textInput = bar.querySelector("[data-filter-text], [data-global-search]");
    const yearSelect = bar.querySelector("[data-filter-year]");
    const typeSelect = bar.querySelector("[data-filter-type]");
    const empty = section.querySelector("[data-filter-empty]");

    const decadeMatch = (year, decade) => {
        const value = Number(year || 0);
        const base = Number(decade || 0);
        if (!base) {
            return true;
        }
        if (base === 1970) {
            return value > 0 && value < 1980;
        }
        return value >= base && value < base + 10;
    };

    const applyFilter = () => {
        const term = (textInput ? textInput.value : "").trim().toLowerCase();
        const year = yearSelect ? yearSelect.value : "";
        const type = typeSelect ? typeSelect.value : "";
        let visible = 0;

        cards.forEach((card) => {
            const haystack = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.tags
            ].join(" ").toLowerCase();
            const textOk = !term || haystack.includes(term);
            const typeOk = !type || (card.dataset.type || "").includes(type);
            const yearOk = !year || (year.length === 4 && section.querySelector("[data-search-page]") ? decadeMatch(card.dataset.year, year) : card.dataset.year === year);
            const show = textOk && typeOk && yearOk;
            card.style.display = show ? "" : "none";
            if (show) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle("is-visible", visible === 0);
        }
    };

    if (textInput) {
        textInput.addEventListener("input", applyFilter);
    }
    if (yearSelect) {
        yearSelect.addEventListener("change", applyFilter);
    }
    if (typeSelect) {
        typeSelect.addEventListener("change", applyFilter);
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q");
    if (query && textInput) {
        textInput.value = query;
    }
    applyFilter();
});
