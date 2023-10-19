var currentSlide = 1;

function showSlide(slideIndex) {
  var slides = document.getElementsByClassName('carouselImgs');
  if (slideIndex > slides.length) {
    currentSlide = 1;
  }
   else if (slideIndex < 1) {
    currentSlide = slides.length;

  }
  for (var i = 0; i < slides.length; ++i) {
    slides[i].style.display = 'none';
  }
  slides[currentSlide - 1].style.display = 'flex';
}

function nextSlide() {
  showSlide(currentSlide += 1);
}

function previousSlide() {
  showSlide(currentSlide -= 1);
}

window.addEventListener('load', function () {
  showSlide(currentSlide);
  document.getElementById('prev').addEventListener('click', previousSlide);
  document.getElementById('next').addEventListener('click', nextSlide);
});
