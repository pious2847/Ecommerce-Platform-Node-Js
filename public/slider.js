const show_popout = document.querySelector(".show_popout");
const downPopout = document.getElementById('#downPopout')

show_popout.addEventListener('click', () => {
  downPopout.classList.toggle('toggle');
})