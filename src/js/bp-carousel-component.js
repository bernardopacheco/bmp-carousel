import Utils from "./utils.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      display: block;
      --carousel-slide-width: 187;
      --carousel-slide-margin: 10;
      --carousel-track-width: 5000; /* A high number. It'll be calculated depending on the num of slides */
      --carousel-track-x-translate: 0; /* It'll be calculated depending on the active slide */
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
      width: calc(var(--carousel-track-width) * 1px);
      transform: translate3d(
        calc(var(--carousel-track-x-translate) * 1px),
        0px,
        0px
      );
      transition: 500ms ease-in-out;
    }

    .carousel-slide {
      float: left;
      height: 100%;
      min-height: 1px;
      margin: calc(var(--carousel-slide-margin) * 1px);
      width: calc(var(--carousel-slide-width) * 1px);
      transition: transform 0.4s ease;
    }
    
    .carousel-slide > div {
      background: var(--white-color);
      color: var(--curious-blue-color);
      font-size: 36px;
      line-height: 100px;
      position: relative;
      text-align: center;
    }
    
    .carousel-slide.current {
      transform: scale(1.08);
      transition: transform 0.4s cubic-bezier(0.48, -0.28, 0.41, 1.4);
    }
  </style>

  <div class="carousel">
    <div class="carousel-track">
      <div class="carousel-slide" id="1"><div>1</div></div>
      <div class="carousel-slide" id="2"><div>2</div></div>
      <div class="carousel-slide" id="3"><div>3</div></div>
      <div class="carousel-slide" id="4"><div>4</div></div>
      <div class="carousel-slide" id="5"><div>5</div></div>
      <div class="carousel-slide" id="6"><div>6</div></div>
      <div class="carousel-slide" id="7"><div>7</div></div>
      <div class="carousel-slide" id="8"><div>8</div></div>
      <div class="carousel-slide" id="9"><div>9</div></div>
      <div class="carousel-slide" id="10"><div>10</div></div>
      <div class="carousel-slide" id="11"><div>11</div></div>
      <div class="carousel-slide" id="12"><div>12</div></div>
      <div class="carousel-slide" id="13"><div>13</div></div>
      <div class="carousel-slide" id="14"><div>14</div></div>
      <div class="carousel-slide" id="15"><div>15</div></div>
    </div>
  </div>
`;

export class Carousel extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
    this.root.appendChild(template.content.cloneNode(true));

    this.carousel = this.root.querySelector(".carousel");
    this.slides = this.root.querySelectorAll(".carousel-slide");
    this.slideWidth = Utils.getCSSVariableAsNum(this.root, "--carousel-slide-width");
    this.slideMargin = Utils.getCSSVariableAsNum(this.root, "--carousel-slide-margin");
    this.carouselTrackWidth =
      this.slides.length * (this.slideWidth + 2 * this.slideMargin);
    this.currentSlideElem;
  }

  connectedCallback() {
    Utils.setCSSVariable(this.root, "--carousel-track-width", this.carouselTrackWidth);
    this.currentSlideElem = this.slides[0];
    this.currentSlideElem.classList.add("current");

    this.slides.forEach(slide => {
      slide.addEventListener("click", this.onSlideSelected.bind(this));
    });
  }

  onSlideSelected(e) {
    const index = parseInt(e.target.parentNode.id, 10);

    const toBeTheFirst = (index - 1) * 207;
    const toBeInTheMiddle = this.carousel.offsetWidth / 2;
    const halfSlide = 207 / 2;

    let newXPosition = -toBeTheFirst + toBeInTheMiddle - halfSlide;

    if (newXPosition > 0) {
      newXPosition = 0;
    } else if (
      newXPosition <
      -this.carouselTrackWidth + this.carousel.offsetWidth
    ) {
      newXPosition = -this.carouselTrackWidth + this.carousel.offsetWidth;
    }

    this.currentSlideElem.classList.remove("current");
    this.currentSlideElem = e.target.parentNode;
    this.currentSlideElem.classList.add("current");
    Utils.setCSSVariable(this.root, "--carousel-track-x-translate", newXPosition);
  }
}

customElements.define("bp-carousel", Carousel);
