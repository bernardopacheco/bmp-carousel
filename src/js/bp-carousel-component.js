const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
    }

    .carousel {
      position: relative;
      display: block;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }

    .carousel-track {
      position: relative;
      top: 0;
      left: 0;
      display: block;
      margin-left: auto;
      margin-right: auto;
      width: 5000px; /* A high number. It'll be calculated depending on the num of slides */
      transform: translate3d(0px, 0px, 0px); /* It'll be calculated depending on the active slide */
      transition: 500ms ease-in-out;
    }

    ::slotted(.carousel-slide) {
      float: left;
      height: 100%;
      min-height: 1px;
      transition: transform 0.4s ease;
    }

    ::slotted(.carousel-slide.active) {
      transform: scale(1.08);
      transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) 0s;
    }
  </style>

  <div class="carousel">
    <div class="carousel-track">
      <slot></slot>
    </div>
  </div>
`;

const WEB_COMPONENT_NAME = "bp-carousel";

export class Carousel extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
    this.root.appendChild(template.content.cloneNode(true));

    /** @type {HTMLDivElement} - The main carousel element. */
    this.carouselElement = this.root.querySelector(".carousel");

    /** @type {HTMLDivElement} - The track to be slided. */
    this.carouselTrackElement = this.root.querySelector(".carousel-track");

    /** @type {NodeList} - List of all slides in the carousel. */
    this.slides;

    /** @type {HTMLDivElement} - The active slide. */
    this.activeSlideElement;

    /** @type {number} - The slide width. */
    this.slideWidth;

    /** @type {number} - The carousel track width. */
    this.carouselTrackWidth;

    /** @type {Object[]} - User's items used to create carousel slides. */
    this.items;

    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  /**
   * Select a slide on a click event.
   *
   * @private
   * @param {MouseEvent} event - The event containing which slide was selected.
   * @return {void}
   */
  onSlideSelect(event) {
    this.selectSlide(event.currentTarget);
  }

  /**
   * Update carousel position on windows resize.
   *
   * @private
   * @return {void}
   */
  onWindowResize() {
    this.updateCarouselElements();
    this.moveCarousel(this.activeSlideElement);
  }

  /**
   * Update carousel elements width.
   *
   * @private
   * @return {void}
   */
  updateCarouselElements() {
    this.slideWidth = this.children[0].getBoundingClientRect().width;
    this.carouselTrackWidth = this.items.length * this.slideWidth;
    //  Triple width to avoid stacking really large slides on windows resize.
    this.carouselTrackElement.style.width = `${this.carouselTrackWidth * 3}px`;
  }

  /**
   * Move the carousel track when a slide is selected.
   *
   * @private
   * @param {HTMLDivElement} slideElement - Slide that has just been selected.
   * @return {void}
   */
  selectSlide(slideElement) {
    //  Update carousel position.
    this.moveCarousel(slideElement);

    //  Set a new active slide.
    this.activeSlideElement.classList.remove("active");
    this.activeSlideElement = slideElement;
    this.activeSlideElement.classList.add("active");

    this.notifySlideSelect();
  }

  /**
   * Update the carousel position from the chosen slide.
   *
   * @private
   * @param {HTMLDivElement} slideElement - Slide that has just been selected.
   * @return {void}
   */
  moveCarousel(slideElement) {
    /** @const {number} - Slide index. */
    const slideIndex = parseInt(slideElement.id, 10);

    /** @const {number} - Offset to place this slide as the first left visible slide. */
    const asFirstSlideOffset = slideIndex * this.slideWidth;

    /** @const {number} - Offset to place this slide in the middle of the carousel. */
    const halfCarouselWidth = this.carouselElement.offsetWidth / 2;

    /** @const {number} - Offset to center the slide. */
    const halfSlideWidth = this.slideWidth / 2;

    /** @type {number} - Candidate for the next carousel track position. */
    let carouselTrackPosition =
      -asFirstSlideOffset + halfCarouselWidth - halfSlideWidth;

    /** @const {number} - At the most left slide. */
    const exceededLeftBoundary = carouselTrackPosition > 0;

    /** @const {number} - At the most right slide. */
    const exceededRightBoundary =
      carouselTrackPosition <
      -this.carouselTrackWidth + this.carouselElement.offsetWidth;

    //  Check left and right boundaries.
    if (exceededLeftBoundary) {
      carouselTrackPosition = 0;
    } else if (exceededRightBoundary) {
      carouselTrackPosition =
        -this.carouselTrackWidth + this.carouselElement.offsetWidth;
    }

    //  Move the carousel track.
    this.carouselTrackElement.style.transform = `translate3d(${carouselTrackPosition}px, 0px, 0px)`;
  }

  /**
   * For each item object, create a slide element.
   *
   * @param {Object[]} items - User's items used to create carousel slides.
   * @return {void}
   */
  setItems(items) {
    if (!items.length) {
      return;
    }

    this.items = items;

    /** @type {HTMLElement} - The web component element. */
    let webComponentElement = this;

    /** @type {HTMLElement} - A detached element that represents a user's item template. It's known as Light DOM. */
    let slideTemplateElement = webComponentElement.children[0].cloneNode(true);
    //  Clean up the attached user's element template.
    webComponentElement.removeChild(webComponentElement.children[0]);

    //  Bind each item to a slide element into carousel.
    this.items.forEach((item, index) => {
      /** @const {HTMLElement} - Slide to be added. */
      const slideElement = slideTemplateElement.cloneNode(true);

      /** @type {NodeList} - Element list to be bound. */
      let nodes = slideElement.querySelectorAll("[data-carousel-bind]");

      nodes.forEach(
        /** @type {HTMLElement} - Element to be bound. */
        node => {
          /** @const {string} - Attribute value. */
          const value = item[node.getAttribute("data-carousel-bind")];

          if (node.nodeName.toLowerCase() === "img") {
            node.src = value;
          } else {
            node.innerHTML = value;
          }
        }
      );

      /** @type {HTMLElement} - Slide container. */
      let div = document.createElement("div");
      div.setAttribute("id", index); //  items are numbered from 0 to N - 1
      div.classList.add("carousel-slide");
      div.appendChild(slideElement);
      webComponentElement.appendChild(div);
    });

    this.updateCarouselElements();

    this.slides = webComponentElement.querySelectorAll(".carousel-slide");

    this.activeSlideElement = this.slides[0];
    this.activeSlideElement.classList.add("active");

    this.slides.forEach(slide => {
      slide.addEventListener("click", this.onSlideSelect.bind(this));
    });
  }

  /**
   * Dispatch a slide selected event.
   *
   * @private
   * @return {void}
   */
  notifySlideSelect() {
    /** @const {number} - Active slide index. */
    const slideIndex = parseInt(this.activeSlideElement.id, 10);

    this.dispatchEvent(
      new CustomEvent("slide-select", {
        detail: {
          item: this.items[slideIndex]
        }
      })
    );
  }

  /**
   * Select the next slide.
   * @returns {void}
   */
  next() {
    let activeSlideIndex = parseInt(this.activeSlideElement.id, 10);
    const hasNextSlide = activeSlideIndex + 1 < this.items.length;

    if (hasNextSlide) {
      this.selectSlide(this.slides[activeSlideIndex + 1]);
    }
  }

  /**
   * Select the previous slide.
   * @returns {void}
   */
  previous() {
    let activeSlideIndex = parseInt(this.activeSlideElement.id, 10);
    const hasPreviousSlide = activeSlideIndex - 1 >= 0;

    if (hasPreviousSlide) {
      this.selectSlide(this.slides[activeSlideIndex - 1]);
    }
  }
}

//  Define the web component
customElements.define(WEB_COMPONENT_NAME, Carousel);
