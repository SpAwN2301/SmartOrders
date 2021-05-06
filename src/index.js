//IP address
/*
let apiKey = '1be9a6884abd4c3ea143b59ca317c6b2';
$.getJSON('https://ipgeolocation.abstractapi.com/v1/?api_key=' + apiKey, function(data) {
  console.log(JSON.stringify(data, null, 2))
  const ipAdd = JSON.stringify(data.ip_address, null, 2);
  if (ipAdd !== '"178.176.78.175"'){
    try {
      throw new Error('Уупс!');
    } catch (e) {
      document.body.innerHTML = `
        <div class="error">
          <div class="error__title">Подключитесь в Wi-Fi сети ресторана</div>
        </div>
      `;
    }
  }
});
*/

let tableNum = '';
document.getElementById('startForm').addEventListener('submit', function(e){
  e.preventDefault();
  document.getElementsByClassName('start')[0].style.display = 'none';
  document.getElementsByClassName('header')[0].style.display = 'block';
  document.getElementsByClassName('catalog')[0].style.display = 'block';
  tableNum = document.querySelector('[name=table]').value;
  document.getElementsByClassName('header__table')[0].textContent = 'Столик ' + tableNum;
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Парсинг меню из эксель
const id = '1-z4OlGXqByTAl-IzLweBWruDB0XE4ZLg658BXi7DaPg'
const menusURL = `https://spreadsheets.google.com/feeds/worksheets/${id}/public/basic?alt=json` //ссылка на таблицу

const getMenus = async (url) => {
  const obj = await fetch(url)
  const result = await obj.json()
  const responseArr = result.feed.entry

  let resultObj = {}

  //Цикл по каждому меню
  await Promise.all(
    responseArr.map(async function (menu) {
      let parsedMenuUrl = menu.link[0].href;//ссылка на меню для дальнейшего запроса
      parsedMenuUrl += '?alt=json';

      const item = await getProductList(parsedMenuUrl);
      resultObj[item.title] = item.items;
    })
  )

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Создание табов для выбора Меню
  Object.keys(resultObj).forEach(function(menu, i){
    if(i === 0){
      document.getElementById('catalogTabs').innerHTML += `
      <li class="catalog__tab active" id="catalog__tab_${menu}">${menu}</li>
      `;
    }else{
      document.getElementById('catalogTabs').innerHTML += `
      <li class="catalog__tab " id="catalog__tab_${menu}">${menu}</li>
      `;
    }
  });

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Создание содержимого меню
  Object.keys(resultObj).forEach(function(menu, i){
    if(i === 0){
      document.getElementById('catalogContent').innerHTML += `
        <div class="catalog__menu" id="catalog__menu_${menu}" style="display: block">
            
        </div>
      `;
    }else{
      document.getElementById('catalogContent').innerHTML += `
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
      document.getElementById(`catalog__menu_${tabs[i].textContent}`).style.display = "block";
      tabs[i].className += " active";

    })
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Coздание разметки продуктов и категорий
  Object.keys(resultObj).forEach(function(menuName){
    
    document.getElementById(`catalog__menu_${menuName}`).innerHTML += `
    <ul class="product__categories" id="product__categories_${menuName}">
    
    </ul>
    `;
  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Создание категорий  и подкатегорий
  Object.values(resultObj).forEach(function(menu, i){
    const catAndSubcatObj = {};
    menu.forEach(function(product){
      //поиск уникальных категорий
      if(Object.keys(catAndSubcatObj).indexOf(product.category) == -1){
        //добавление категории
        catAndSubcatObj[`${product.category}`] = [];

      }

      //поиск уникальных подкатегорий
      if(product.country !== undefined && catAndSubcatObj[`${product.category}`].indexOf(product.country) == -1){
        //добавление подкатегории
        catAndSubcatObj[`${product.category}`].push(product.country);
      }
    })

    //создание категорий
    Object.keys(catAndSubcatObj).forEach(function(category){
      document.getElementById(`product__categories_${Object.keys(resultObj)[i]}`).innerHTML += `
        <li data-name='${category}' class="product__category">${category}
          <div class="product__container">
      
          </div>
        </li>
      `;

      //создание подкатегорий
      for(let i = 0; i < catAndSubcatObj[`${category}`].length; i++){
        document.querySelector(`[data-name='${category}']`).innerHTML += `
        <div data-country="${catAndSubcatObj[category][i]}" class="product__subcategory">${catAndSubcatObj[category][i]}
          <div class="product__container">
        
          </div>
        </div>
        `;
      }
    })
  });

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  //Вывод продуктов в HTML
  Object.values(resultObj).forEach(function(menu, i){
    menu.forEach(function(product){
      if(product.available == undefined){
        if(product.country !== undefined){
          document.querySelector(`[data-name='${product.category}']`).querySelector(`[data-country='${product.country}']`).getElementsByClassName('product__container')[0].innerHTML += `
          <div class="product__wrapper">
          <div data-category='${product.category}' class="product">
            <div class="product__img">
              <img src="./assets/img/${product.article}.png" alt="">
            </div>
            <div class="product__title">${product.title}</div class="product__category-name">  
            <button class="product__price">${product.price + 'р'}</button>
              
              <div class="product__bottom">
                <div class="product__buttons">
                  <button class="product__minus">−</button>
                  <div class="product__amount">0</div>
                  <button class="product__plus">+</button>
                </div>
              </div>
          </div>
          </div>
          `;
        }else{
          document.querySelector(`[data-name='${product.category}']`).getElementsByClassName('product__container')[0].innerHTML += `
          <div class="product__wrapper">
          <div data-category='${product.category}' class="product">
            <div class="product__img">
              <img src="./assets/img/${product.article}.png" alt="">
            </div>
            <div class="product__title">${product.title}</div class="product__category-name">  
            <button class="product__price">${product.price + 'р'}</button>
              
              <div class="product__bottom">
                <div class="product__buttons">
                  <button class="product__minus">−</button>
                  <div class="product__amount">0</div>
                  <button class="product__plus">+</button>
                </div>
              </div>
          </div>
          </div>
          `;
        }
      }
    });
  });

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Модальное окно авторизации  
  // When the user clicks on the button, open the modal
  const loginModal = document.getElementById('loginModal');
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
          document.getElementsByClassName('loginModal__text')[0].innerHTML = `
            <p class="error">Неверный логин или пароль</p>
          `
          e.target.querySelector('.loginModal__submit').disabled = false;
        }else{
          console.log('Correct');
          e.target.querySelector('.loginModal__submit').disabled = false;

          getOrder(token);
          
          //создание разметки
          document.body.innerHTML = `
          <section class="order">
            <div class="container">
              <div class="order__container" id="orderContainer"></div>
            </div>
          </section>
          `
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
      console.log(content);
      
      
      content.forEach(function(order){
        if(document.getElementById(order.id)){
          //не добавляем заказ, если он уже добавлен
          console.log(document.getElementById(order.id).getAttribute('id'));

        }else{
          //обертка каждого заказа + номер столика
          document.getElementById('orderContainer').innerHTML += `
          <div id='${order.id}' class="order__wrapper">
            <div class="order__table">Столик ${order[0]}</div>
            <div class="order__delete">X</div>
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
        }     
      })
    }

    //удалить заказ
    const deleteOrder = document.getElementsByClassName('order__delete');
    for(let i = 0; i < deleteOrder.length; i++){
      deleteOrder[i].addEventListener('click', function(){
        let id = deleteOrder[i].parentElement.getAttribute('id');
        console.log(`id is ${id}`)
        deleteOrderFromDB(id);
        
        deleteOrder[i].parentElement.style.display = 'none';
      });
    }
    function deleteOrderFromDB(id){
      return fetch(`https://smartorders-200c8-default-rtdb.firebaseio.com/Praktika/gruzinka/orders/${id}.json`, {
        method: 'DELETE'
      })
    }

    //зачеркнуть нажатое название
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

  /////////////////////////////////////////////////////////////////////////////////////////////////////
  //Функционал кнопок заказа
  const priceBtn = document.getElementsByClassName('product__price');
  const plus = document.getElementsByClassName('product__plus');
  const minus = document.getElementsByClassName('product__minus');

  //Выбрать позицию
  for(let i = 0; i < priceBtn.length; i++){
    priceBtn[i].addEventListener('click', function(){
      priceBtn[i].style.display = 'none';
      priceBtn[i].nextElementSibling.style.display = 'block';
      priceBtn[i].nextElementSibling.getElementsByClassName('product__amount')[0].textContent = 1;
      createCart();
    });
  }

  //Уменьшить кол-во позиций
  for(let i = 0; i < minus.length; i++){
    minus[i].addEventListener('click', function(){

      let amount = parseInt(minus[i].nextElementSibling.textContent);

      if(amount > 0){
        amount--;
        minus[i].nextElementSibling.textContent = amount;
        createCart();
      }
    })
  }

  //Увеличить кол-во позиций
  for(let i = 0; i < plus.length; i++){
    plus[i].addEventListener('click', function(){
      let amount = parseInt(plus[i].previousElementSibling.textContent);
      amount++;
      plus[i].previousElementSibling.textContent = amount;
      createCart();
    })
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Корзина с заказами
  //опустить
  document.getElementsByClassName('header__check-orderBtn')[0].addEventListener('click', function(){
    document.getElementById('preview').style.transform = 'translateX(0%)';  
  });
  
  //вернуть обратно наверх
  document.getElementsByClassName('preview__close')[0].addEventListener('click', function(){
    document.getElementById('preview').style.transform = 'translateY(-150%)';
  });


  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Создание корзины
  let finalPrice = 0; //итоговая стоимость заказа
  let finalAmount = 0; //кол-во товаров в заказе
  const orderedProductsArr = []; //массив объектов с заказанными товарами

  function createCart(){
    //Создание итоговой суммы кнопки принятия заказа
    document.getElementById('orderFinal').style.display = 'block';

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
    document.querySelector('[name=amount]').setAttribute('value', finalPrice)

    document.getElementById('finalPrice').textContent = finalPrice + 'р'; 
    
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Проверка заказанных товаров на наличие в таблице (на случай изменений в коде элемента)
  const submitBtn = document.getElementById('submitBtn').addEventListener('click', function(){
    //Отключаем кнопку для предотвращения спама
    document.getElementById('submitBtn').setAttribute("disabled", "disabled");

    const productsPush = []; //финальный массив, который будет отправлен на сервер
    productsPush.push(tableNum);

    orderedProductsArr.forEach(function(orderedProduct){
      let titleIs = false;
      let priceIs = false;

      Object.values(resultObj).forEach(function(menu){
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







}

const getProductList = async (url) => {
  const obj = await fetch(url);
  const result = await obj.json();
  const products = result.feed.entry;

  const menuProducts = []; //массив продуктов определенного меню
  products.forEach(function (product) {
    //Приводим строку для корректного парса
    let str = product.content.$t.replaceAll(/"/g, "'");
    str = '{"' + str.replaceAll(/,\s\w{0,}:/g, '"$&') + '"}';
    str = str.replaceAll('", ', '","');
    str = str.replaceAll(': ', '":"');

    menuProducts.push(JSON.parse(str)); //парсим строку в объект и передаем в массив объектов
  })
  return {
    title: result.feed.title.$t,
    items: menuProducts,
  }
}

getMenus(menusURL);