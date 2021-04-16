///////////////////////////////////////////////////////////////////////////////////////////////////////
//Прелоадер
window.onload = function () {
  document.body.classList.add('loaded_hiding');
  window.setTimeout(function () {
    document.body.classList.add('loaded');
    document.body.classList.remove('loaded_hiding');
  }, 500);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Парсинг меню из эксель
fetch(`./assets/menu/menus.xlsx`).then(function (res) {
  if (!res.ok) throw new Error("fetch failed");
  return res.arrayBuffer();
})
.then(function (ab) {
  const data = new Uint8Array(ab);
  const workbook = XLSX.read(data, {
      type: "array"
  });

  const menuNames = [];
  const menusArr = [];

  workbook.SheetNames.forEach(function(name){
    menuNames.push(name);

    const worksheet = workbook.Sheets[name];
    const _products = XLSX.utils.sheet_to_json(worksheet, { raw: true });
    menusArr.push(_products);
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Создание табов для выбора Меню
  menuNames.forEach(function(menu, i){
  if(i === 0){
    document.getElementById('tabs').innerHTML += `
    <li class="catalog__tab active" id="catalog__tab_${menu}">
      <div class="tabcontent" data-toggle="tab">${menu}</div>
    </li>
    `;
  }else{
    document.getElementById('tabs').innerHTML += `
    <li class="catalog__tab " id="catalog__tab_${menu}">
      <div class="tabcontent" data-toggle="tab">${menu}</div>
    </li>
    `;
  }
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Создание содержимого меню

  menuNames.forEach(function(menu, i){
    if(i === 0){
      document.getElementById('content').innerHTML += `
        <div class="catalog__menu" id="catalog__menu_${menu}" style="display: block">
            
        </div>
      `;
    }else{
      document.getElementById('content').innerHTML += `
        <div class="catalog__menu" id="catalog__menu_${menu}" style="display: none">
            
        </div>
      `;
    }
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Функционал табов
  const tabs = document.getElementsByClassName('catalog__tab');

  for(let i = 0; i < tabs.length; i++){
    tabs[i].addEventListener('click', function(){

      let tabcontent, tablinks;
      // Get all elements with class="tabcontent" and hide them
      tabcontent = document.getElementsByClassName("catalog__menu");
      for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
      }

      // Get all elements with class="tablinks" and remove the class "active"
      tablinks = document.getElementsByClassName("catalog__tab");
      for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
      }

      // Show the current tab, and add an "active" class to the button that opened the tab
      document.getElementById(`catalog__menu_${tabs[i].firstElementChild.textContent}`).style.display = "block";
      tabs[i].className += " active";

    })
  }
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Coздание разметки продуктов и категорий
  menuNames.forEach(function(menuName, i){
    
    document.getElementById(`catalog__menu_${menuName}`).innerHTML += `
    <ul class="product__categories" id="product__categories_${menuName}">
    
    </ul>
    <div class="product__container" id="product__container_${menuName}">
      <div class="close-product__wrapper">
        <div class="close-product">×</div>
      </div>
    </div>
    `;
  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Создание категорий  
  menusArr.forEach(function(menu, i){
    const categoriesArr = [];
    //поиск уникальных категорий
    menu.forEach(function(product){
      if(categoriesArr.indexOf(product.category) == -1){
        categoriesArr.push(product.category);

        //создание
        document.getElementById(`product__categories_${menuNames[i]}`).innerHTML += `
        <li data-name='${product.category}' class="product__category"><div>${product.category}</div></li>
        `;
      }

      //Загрузка картинки для бэкграунда
      const categoryStyle = document.querySelector(`[data-name = '${product.category}']`);

      categoryStyle.style.cssText = `
        background-image: url('./assets/img/${product.category}.jpg');
      `;
    })

  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  //Вывод продуктов в HTML
  menusArr.forEach(function(menu, i){
    menu.forEach(function(product){
      document.getElementById(`product__container_${menuNames[i]}`).innerHTML += `
      <div data-category='${product.category}' class="product">
        <div class="product__title">${product.title}</div>
        <div class="product__right">
          <div class="product__records">
            ${product.capacity !== undefined ? `<div class="product__capacity">${product.capacity + 'g/'}</div>` : ''}
            <div class="product__price">${product.price + 'р'}</div>
          </div>

          <div class="product__buttons">
            <button class="product__minus">-</button>
            <div class="product__amount">0</div>
            <button class="product__plus">+</button>
          </div>
        
        </div>
      </div>
    `;   
    
    
    });
  });

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //Открыть модальное окно
  const categoriesArr = document.getElementsByClassName('product__category');

  for(i = 0; i < categoriesArr.length; i++){
    const productContainer = categoriesArr[i].parentElement.nextElementSibling.getAttribute('id')
    const dataCategory = categoriesArr[i].getAttribute('data-name');
    
    categoriesArr[i].addEventListener('click', function(){
      document.getElementById(productContainer).style.display = "flex";
      
      document.querySelectorAll(`[data-category="${dataCategory}"]`).forEach(function(element){
        element.style.display = 'flex';
      });
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //Закрыть модальное окно

  const closeModal = document.querySelectorAll('.close-product__wrapper');

  for(let i = 0; i < closeModal.length; i++){
    closeModal[i].addEventListener('click', function(){

      const products = document.getElementsByClassName('product');
      for(let j = 0; j < products.length; j++){
        products[j].style.display = 'none';
      }
   
      closeModal[i].parentElement.style.display = 'none';
      createCart();
    });
  }
  

  /////////////////////////////////////////////////////////////////////////////////////////////////////
  //Функционал кнопок заказа
  const plus = document.querySelectorAll('.product__plus');
  const minus = document.querySelectorAll('.product__minus');

  //Уменьшить кол-во позиций
  for(let i = 0; i < minus.length; i++){
    minus[i].addEventListener('click', function(){
      let amount = parseInt(minus[i].nextElementSibling.textContent);

      if(amount > 0){
        amount--;
        minus[i].nextElementSibling.textContent = amount;
      }
    })
  }

  //Увеличить кол-во позиций
  for(let i = 0; i < plus.length; i++){
    plus[i].addEventListener('click', function(){
      let amount = parseInt(plus[i].previousElementSibling.textContent);
      amount++;
      plus[i].previousElementSibling.textContent = amount;
    })
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Слайдер
  let headerState = false;
  document.getElementById('slider').addEventListener('click', function(){

    if(headerState){
      headerState = false;
      //вернуть обратно наверх
      document.getElementById('header').style.transform = 'translateY(-100%)';

      //поменять иконку
      document.getElementsByClassName('cartBtn__close')[0].style.display = 'none';
      document.getElementsByClassName('cartBtn__icon')[0].style.display = 'block';

    }else{
      headerState = true;
      //опустить
      document.getElementById('header').style.transform = 'translateX(0%)';
      //поменять иконку
      document.getElementsByClassName('cartBtn__close')[0].style.display = 'block';
      document.getElementsByClassName('cartBtn__icon')[0].style.display = 'none';
    }
  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Создание корзины
  let finalPrice = 0; //итоговая стоимость заказа
  let finalAmount = 0; //кол-во товаров в заказе
  const orderedProductsArr = []; //массив объектов с заказанными товарами

  function createCart(){

    //Очистка старого заказа
    document.getElementById('cartProducts').innerHTML = '';
    document.getElementById('orderFinal').innerHTML = '';
    orderedProductsArr.length = 0;
    finalAmount = 0;
    finalPrice = 0;

    //Вывод выбранных товаров в корзину
    const amountArr = document.getElementsByClassName('product__amount');
    for(let i = 0; i < amountArr.length; i++){
      if(amountArr[i].textContent !== '0'){
        
        //Подсчет финального количества товаров
        finalAmount += parseInt(amountArr[i].textContent);

        //Вывод товаров на страницу заказа
        document.getElementById('cartProducts').innerHTML += `
          <div class="order__product">
            <div class="order__product-title">${document.getElementsByClassName('product__title')[i].textContent}</div>
            <div class="order__product-wrapper">
              <div class="order__product-amount">${amountArr[i].textContent}</div>
              <span>x</span>
              <div class="order__product-price">${document.getElementsByClassName('product__price')[i].textContent}</div>
            </div>
          </div>
        `;
      }
        //Вывод финального количества товаров
      document.getElementsByClassName('cartBtn__amount')[0].textContent = finalAmount;
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //Создаем массив выбранных товаров на основе .order
    const orderedProductsHTML = document.getElementsByClassName('order__product');

    for(let i = 0; i < orderedProductsHTML.length; i++){
      let orderedProduct = {};
      orderedProduct.title = orderedProductsHTML[i].getElementsByClassName('order__product-title')[0].textContent;
      orderedProduct.price = orderedProductsHTML[i].getElementsByClassName('order__product-price')[0].textContent;
      orderedProduct.amount = orderedProductsHTML[i].getElementsByClassName('order__product-amount')[0].textContent;
      orderedProductsArr.push(orderedProduct);
    }

    
    //Создание финальной суммы заказа
    orderedProductsArr.forEach(function(orderedProduct){
      let productPrice = parseInt(orderedProduct.price.slice(0, -1));
      finalPrice += productPrice * orderedProduct.amount;
    });

    document.getElementById('orderFinal').innerHTML += `
      <div class="order__final-wrapper">
        <div class="order__final-text">Итог: </div>
        <div class="order__final-price">${finalPrice}р</div>
      </div>
      <div class="order__final-btn">Оформить заказ</div>
    `
  }
  
});