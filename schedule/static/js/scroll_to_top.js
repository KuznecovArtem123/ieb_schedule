// Кнопка возврата наверх страницы с анимацией появления
// Требует элемент с id="scrollToTopBtn"
document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('scrollToTopBtn');
    let lastScroll = window.scrollY;
    function toggleBtn() {
        if (window.scrollY > 200) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
        lastScroll = window.scrollY;
    }
    window.addEventListener('scroll', toggleBtn);
    btn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggleBtn();
});
