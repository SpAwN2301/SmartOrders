////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Создание табов для выбора Меню

const tabs = ['Основное меню', 'Постное меню', 'Винная карта'];
const tabsFragment = document.createDocumentFragment();

tabs.forEach(function(tab, i){
    const item = document.createElement('li');
    item.classList.add('catalog__tab');    
    item.setAttribute('onclick', `openTab(event, 'menu${i+1}')`);

    const div = document.createElement('div');
    div.classList.add('tabcontent');
    div.setAttribute('data-toggle', 'tab');
    div.textContent = tab;

    item.appendChild(div);
    if(i === 0) item.classList.add('active');
    tabsFragment.appendChild(item);
});

document.getElementById('tabs').appendChild(tabsFragment);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Создание содержимого меню

const menuFragment = document.createDocumentFragment();

tabs.forEach(function(tab, i){
    const item = document.createElement('div');
    item.classList.add('catalog__menu');
    item.setAttribute('id', `menu${i+1}`);

    if(i === 0) item.style.display = 'block';
    menuFragment.appendChild(item);
});

document.getElementById('content').appendChild(menuFragment);

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

fetch('./assets/menu/menu1.xlsx').then(function (res) {
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
  const productCategories = document.createElement('ul');
  productCategories.classList.add('product__categories');
  productCategories.setAttribute('id', 'categories');
  document.getElementById('menu1').appendChild(productCategories);

  const productContainer = document.createElement('div');
  productContainer.classList.add('product__container');
  productContainer.setAttribute('id', 'productContainer');
  document.getElementById('menu1').appendChild(productContainer);

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //создание и вывод категорий
  const categoryFragment = document.createDocumentFragment();
  const _productCategories = [];
  
  //поиск уникальных категорий
  _products.forEach(function(_product, i){
    if (_productCategories.indexOf(_product.category) == -1) {
      _productCategories.push(_product.category);
      
      const productCategory = document.createElement('li');
      productCategory.classList.add('product__category');
      productCategory.textContent = _product.category;

      categoryFragment.appendChild(productCategory);
    }
  });  
  //вывод категорий
  console.log(_productCategories);
  document.getElementById('categories').appendChild(categoryFragment);

  ///////////////////////////////////////////////////////////////////////////////////////////////////
  //Вывод продуктов в HTML
  _products.forEach(function(_product, i){

    const productFragment = document.createDocumentFragment();

    //product
    const product = document.createElement('div');
    product.classList.add('product');

    //product__title
    const productTitle = document.createElement('div');
    productTitle.classList.add('product__title');
    productTitle.textContent = _product.title;
    product.appendChild(productTitle);

    
    //product__price
    const productPrice = document.createElement('div');
    productPrice.classList.add('product__price');
    productPrice.textContent = `${_product.price}₽`;

    //product__capacity
    const productCapacity = document.createElement('div');
    productCapacity.classList.add('product__capacity');
    productCapacity.textContent = `${_product.capacity}g`

    //product__records
    const productRecords = document.createElement('div');
    productRecords.classList.add('product__records');
    productRecords.appendChild(productPrice);
    productRecords.appendChild(productCapacity);
    product.appendChild(productRecords);

    //product__btn
    const productBtn = document.createElement('button');
    productBtn.classList.add('product__btn');
    productBtn.textContent = "Заказать";
    product.appendChild(productBtn);
    
    productContainer.appendChild(product);
    productFragment.appendChild(productContainer);
    document.getElementById('menu1').appendChild(productFragment);
  })
});