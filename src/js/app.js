import Utils from "./utils.js";

class Carousel {
  constructor() {
    this.carousel = document.querySelector(".carousel");
    this.slides = document.querySelectorAll(".carousel-slide");
    this.slideWidth = Utils.getCSSVariableAsNum("--carousel-slide-width");
    this.slideMargin = Utils.getCSSVariableAsNum("--carousel-slide-margin");
    this.carouselTrackWidth =
      this.slides.length * (this.slideWidth + 2 * this.slideMargin);
    this.currentSlideElem;
  }

  run() {
    Utils.setCSSVariable("--carousel-track-width", this.carouselTrackWidth);
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
    Utils.setCSSVariable("--carousel-track-x-translate", newXPosition);
  }
}

new Carousel().run();
