let tableNum = '';
document.querySelector('#startForm').addEventListener('submit', function(e){
  e.preventDefault();
  document.querySelector('.start').style.display = 'none';
  document.querySelector('.preview').style.display = 'block';
  document.querySelector('.catalog').style.display = 'block';
  tableNum = document.querySelector('[name=table]').value;
  document.querySelector('.header__table').textContent = 'Столик ' + tableNum;
});
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
  //Создание табов для выбора Меню
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
  //Создание содержимого меню

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
  //Функционал табов
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
  //Открыть модальное окно категории
  const categoriesArr = document.getElementsByClassName('product__category');

  for(i = 0; i < categoriesArr.length; i++){
    const productContainer = categoriesArr[i].closest('.catalog__menu').querySelector('.product__container');
    const dataCategory = categoriesArr[i].getAttribute('data-name');
    
    categoriesArr[i].addEventListener('click', function(){
      productContainer.style.display = "flex";
      
      productContainer.querySelectorAll(`[data-category="${dataCategory}"]`).forEach(function(element){
        element.style.display = 'flex';
      });
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////
  //Закрыть модальное окно категории 
  
  const modal = document.getElementsByClassName('product__container');

  for(let i = 0; i < modal.length; i++){
    const closeBtn = modal[i].querySelector('.close-product__wrapper');

    closeBtn.addEventListener('click', function(){
      const products = modal[i].querySelectorAll('.product');

      for(let j = 0; j < products.length; j++){
        products[j].style.display = 'none';
      }

      modal[i].style.display = 'none';
      createCart();
    });
  }
  
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Модальное окно авторизации  
  // When the user clicks on the button, open the modal
  const loginModal = document.querySelector('#loginModal');
  document.getElementsByClassName('header__loginBtn')[0].addEventListener('click', function(){
    loginModal.style.display = "block";
  });
  
  // When the user clicks on <span> (x), close the modal
  document.getElementsByClassName("loginModal__close")[0].addEventListener('click', function(){
    loginModal.style.display = "none";
    loginModal.getElementsByClassName('loginModal__mail')[0].value = '';
    loginModal.getElementsByClassName('loginModal__password')[0].value = '';
  });

  loginModal.addEventListener('submit', function(e){
    e.preventDefault();
    e.target.querySelector('.loginModal__submit').disabled = true;
    const email = e.target.querySelector('.loginModal__mail').value;
    const password = e.target.querySelector('.loginModal__password').value;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//авотризация
    authWithEmailAndPassword(email, password)
      .then(token => {
        if(!token){
          console.log('Uncorrect login');
          e.target.querySelector('.loginModal__submit').disabled = false;
        }else{
          console.log('Correct');
          e.target.querySelector('.loginModal__submit').disabled = false;

          getOrder(token);
          let r = setInterval(function(){
            getOrder(token);
          }, 30000)
          
        }
        
      })
      
  });
  loginModal.getElementsByClassName('loginModal__submit')[0].addEventListener('click', function(){
    console.log('submit');
  });
  function getOrder(token){
    return fetch(`https://smartorders-200c8-default-rtdb.firebaseio.com/Praktika/gruzinka/orders.json?auth=${token}`)
    .then(response => response.json())
    .then(response => {
      if(response && response.error){
        return '<p class="error">Неверный логин или пароль</p>'
      }

      return response ? Object.keys(response).map(key => ({
        ...response[key],
        id: key
      })) : []
    })
    .then(renderModalAfterAuth)
  }
  /////////////////////////////////////////////////////
  //авторизация через почту и пароль
  function authWithEmailAndPassword(email, password){
    const apiKey = 'AIzaSyDK4uSbO1e3Wuzgl24q_j4lsYGV4gqr5Oo';
    return fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      method: 'POST',
      body: JSON.stringify({
        email, password,
        returnSecureToken: true
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => data.idToken)
  }
  //////////////////////////////////////////////////////////////////////
  //Рендер модального окна после авторизации
  function renderModalAfterAuth(content){
    if(typeof content === 'string'){
      document.getElementsByClassName('loginModal__text')[0].innerHTML = content;
    }else{
      //создание разметки
      document.body.innerHTML = `
      <section class="order">
        <div class="container">
          <div class="order__container" id="orderContainer"></div>
        </div>
      </section>
      `
      //обертка каждого заказа + номер столика
      content.forEach(function(order){
        document.getElementById('orderContainer').innerHTML += `
          <div class="order__wrapper">
            <div class="order__table">Столик ${order[0]}</div>
          </div>
        `
        //содержимое заказа
        for(let j = 1; j < Object.keys(order).length-1; j++){
          document.querySelector('.order__wrapper:last-child').innerHTML+= `
            <div class="order__product">
              <div class="order__title">${order[j].title}</div>
              <div class="order__amount">${order[j].amount}</div>
            </div>
          `
        }
      })


      const titleOnClick = document.getElementsByClassName('order__title');
      for(let i = 0; i < titleOnClick.length; i++){
        let titleIsClick = false;
        titleOnClick[i].addEventListener('click', function(){
          if(!titleIsClick){
            titleOnClick[i].style.textDecoration = 'line-through';
            titleIsClick = true;
          }else{
            titleOnClick[i].style.textDecoration = 'none';
            titleIsClick = false;
          }
          
        });
      }
    }
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
  //Корзина с заказами

  //опустить
  document.querySelector('.header__check-orderBtn').addEventListener('click', function(){
    document.getElementById('preview').style.transform = 'translateX(0%)';  
  });
  
  //вернуть обратно наверх
  document.querySelector('.preview__close').addEventListener('click', function(){
    document.getElementById('preview').style.transform = 'translateY(-120%)';
  });


  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Создание корзины
  let finalPrice = 0; //итоговая стоимость заказа
  let finalAmount = 0; //кол-во товаров в заказе
  const orderedProductsArr = []; //массив объектов с заказанными товарами

  function createCart(){
    //Создание итоговой суммы кнопки принятия заказа
    document.getElementsByClassName('preview__final-wrapper')[0].style.display = 'flex';
    document.getElementById('submitBtn').style.display = 'block';

    //Очистка старого заказа
    document.getElementsByClassName('header__product-amount')[0].textContent = '';
    document.getElementById('cartProducts').innerHTML = '';
    orderedProductsArr.length = 0;
    finalAmount = 0;
    finalPrice = 0;

    //Вывод выбранных товаров в корзину
    const amountArr = document.getElementsByClassName('product__amount');
    for(let i = 0; i < amountArr.length; i++){
      if(amountArr[i].textContent !== '0'){
        
        //Подсчет финального количества товаров
        finalAmount += parseInt(amountArr[i].textContent);
        //Вывод финального количества товаров
        document.getElementsByClassName('header__product-amount')[0].textContent = finalAmount;

        //Вывод товаров на страницу заказа
        document.getElementById('cartProducts').innerHTML += `
          <div class="preview__product">
            <div class="preview__product-title">${document.getElementsByClassName('product__title')[i].textContent}</div>
            <div class="preview__product-wrapper">
              <div class="preview__product-amount">${amountArr[i].textContent}</div>
              <span>x</span>
              <div class="preview__product-price">${document.getElementsByClassName('product__price')[i].textContent}</div>
            </div>
          </div>
        `;
      }
        
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    //Создаем массив выбранных товаров на основе .preview__order
    const orderedProductsHTML = document.getElementsByClassName('preview__product');

    for(let i = 0; i < orderedProductsHTML.length; i++){
      let orderedProduct = {};
      orderedProduct.title = orderedProductsHTML[i].getElementsByClassName('preview__product-title')[0].textContent;
      orderedProduct.price = orderedProductsHTML[i].getElementsByClassName('preview__product-price')[0].textContent;
      orderedProduct.amount = orderedProductsHTML[i].getElementsByClassName('preview__product-amount')[0].textContent;
      orderedProductsArr.push(orderedProduct);
    }

    //Создание финальной суммы заказа
    orderedProductsArr.forEach(function(orderedProduct){
      let productPrice = parseInt(orderedProduct.price.slice(0, -1));
      finalPrice += productPrice * orderedProduct.amount;
    });

    document.getElementById('finalPrice').textContent = finalPrice + 'р'; 
    
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Проверка заказанных товаров на наличие в таблице (на случай изменений в коде элемента)
  const submitBtn = document.getElementById('submitBtn').addEventListener('click', function(){
    //Отключаем кнопку для предотвращения спама
    document.querySelector('#submitBtn').setAttribute("disabled", "disabled");

    const productsPush = []; //финальный массив, который будет отправлен на сервер
    productsPush.push(tableNum);

    orderedProductsArr.forEach(function(orderedProduct){
      let titleIs = false;
      let priceIs = false;

      menusArr.forEach(function(menu){
        menu.forEach(function(product){
          if(orderedProduct.title === product.title){

            console.log(`${orderedProduct.title} was finded`);
            titleIs = true;

            if(parseInt(orderedProduct.price.slice(0, -1)) == product.price){
              console.log(`${orderedProduct.price} is correct price`);
              priceIs = true;
            }
          }
        });
      });

      if(titleIs && priceIs){
        productsPush.push(orderedProduct);
        console.log('Продукт прошел проверку');
      }else{
        console.log('Внешнее вмешательство в код');
      }

    });

    //////////////////////////////////////////////////
    //Отправка заказа в базу данных
    fetch('https://smartorders-200c8-default-rtdb.firebaseio.com/Praktika/gruzinka/orders.json', {
      method: 'POST',
      body: JSON.stringify(productsPush),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(response => {
      
      let date1 = new Date();

      let x = setInterval(function(){
        let now = new Date().getTime();

        let distance = now - date1;

        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.body.innerHTML = `
        <section class="timer">
          <div class="container">
              <div class="timer__title">Время ожидания заказа:</div>
              <div class="timer__time">
                ${minutes < 10 ? '0' + minutes : minutes}
                :
                ${seconds < 10 ? '0' + seconds : seconds}
              </div>
          </div>
        </section>
      `

      }, 1000);

    })

  });
  
});
