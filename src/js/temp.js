///////////////////////////////////////////////////////////////////////////////////////////////
//Выбор столика
document.body.innerHTML = `
  <section class="start">
    <div class="container">
      <div class="start__title">Ваш столик: </div>
      <form id="startForm" class="start__form" action="#">
        <input name="table" required type="number">
        <input type="submit" value="Отправить">
        <button class="start__submitBtn">Сделать заказ</button>
      </form>
    </div>
  </section>
`

let tableNum = '';
document.querySelector('#startForm').addEventListener('submit', function(e){
  e.preventDefault();
  document.querySelector('.start__form').style.display = 'none';
});
