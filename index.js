////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Создание табов для выбора Меню

const menu = ['Основное меню', 'Постное меню', 'Винная карта'];

menu.forEach(function(tab, i){
  if(i === 0){
    document.getElementById('tabs').innerHTML += `
    <li class="catalog__tab active" onclick="openTab(event, 'menu${i+1}')">
      <div class="tabcontent" data-toggle="tab">${tab}</div>
    </li>
    `;
  }else{
    document.getElementById('tabs').innerHTML += `
    <li class="catalog__tab " onclick="openTab(event, 'menu${i+1}')">
      <div class="tabcontent" data-toggle="tab">${tab}</div>
    </li>
    `;
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Создание содержимого меню

menu.forEach(function(tab, i){
  if(i === 0){
    document.getElementById('content').innerHTML += `
      <div class="catalog__menu" id="menu${i+1}" style="display: block">
          
      </div>
    `;
  }else{
    document.getElementById('content').innerHTML += `
      <div class="catalog__menu" id="menu${i+1}" style="display: none">
          
      </div>
    `;
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Функционал табов

function openTab(evt, id) {
  // Declare all variables
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
  document.getElementById(id).style.display = "block";
  evt.currentTarget.className += " active";
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Парсинг меню из эксель
menu.forEach(function(file, i){
  fetch(`./assets/menu/menu${i+1}.xlsx`).then(function (res) {
    if (!res.ok) throw new Error("fetch failed");
    return res.arrayBuffer();
  })
  .then(function (ab) {
    const data = new Uint8Array(ab);
    const workbook = XLSX.read(data, {
        type: "array"
    });
  
    const first_sheet_name = workbook.SheetNames[0];
  
    const worksheet = workbook.Sheets[first_sheet_name];
  
    const _products = XLSX.utils.sheet_to_json(worksheet, { raw: true });
  
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Coздание разметки продуктов и категорий
    document.getElementById(`menu${i+1}`).innerHTML += `
    <ul class="product__categories" id="categories${i+1}">
    
    </ul>
    <div class="product__container" id="productContainer${i+1}">
  
    </div>
    `;
  
    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Создание категорий
    const _productCategories = [];
    
    //поиск уникальных категорий
    _products.forEach(function(_product){
      if (_productCategories.indexOf(_product.category) == -1) {
        _productCategories.push(_product.category);
  
        //создание
        document.getElementById(`categories${i+1}`).innerHTML += `
          <li data-name='${_product.category}' class="product__category">${_product.category}</li>
        `;
  
      }
    }); 
  
    ///////////////////////////////////////////////////////////////////////////////////////////////////
    //Вывод продуктов в HTML
   
    document.querySelector(`[data-name="Закуски и салаты"]`).addEventListener('click', function(){
      document.getElementById('productContainer1').style.display = "flex";
      

      _products.forEach(function(_product){
        if (_product.category === "Закуски и салаты"){
          document.getElementById(`productContainer${i+1}`).innerHTML += `
          <div data-category='${_product.category}' class="product">
            <div class="product__title">${_product.title}</div>
            <div class="product__records">
              <div class="product__price">${_product.price}₽</div>
              <div class="product__capacity">${_product.capacity}g</div>
            </div>
            <button class="product__btn">Заказать</button>
          </div>
          `;   
        }
         
      })
    });

    document.getElementById('productContainer1').addEventListener('click', function(){
      document.getElementById('productContainer1').style.display = "none";
    });
    
  });
});


