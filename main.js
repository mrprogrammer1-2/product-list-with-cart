const productsListHtml = document.getElementById("products-list")
const cartHtml = document.getElementById("cart-list")
let quantitySpan = document.querySelector(".total-quantity")
let modalContainer = document.querySelector(".modal-container")
let modal = document.querySelector(".modal")
let order = document.querySelector('.order')
let productsList = []
let carts = []


const initApp = async ()=> {
   await fetch("data.json")
    .then(resbonse=> resbonse.json())
    .then(data=>{
        productsList = data
        if (localStorage.getItem("products")) {
            carts = JSON.parse(localStorage.getItem("products"))
            addCartToHtml()
            addQuantityToHtml()
        } else {
            addProductsToHtml()
        }
    })
}

initApp()
const addProductsToHtml = ()=> {
    if (productsList.length > 0) {
        productsListHtml.innerHTML = ""
        productsList.forEach((product)=> {
            let newProduct = document.createElement("div");
            let image;
            if (window.innerWidth < 768) {
                image = product.image.mobile
            } else if (window.innerWidth < 1024) {
                image = product.image.tablet;
            } else if (window.innerWidth >= 1024) {
                image = product.image.desktop
            }
            newProduct.classList.add("item");
            newProduct.dataset.id = product.id;
            newProduct.innerHTML = `
                <div class="image">
                    <img src="${image}" alt="${product.name}" />
                    <div class="addCart">
                    <div class="add">
                        <img class="minus" src="assets/images/icon-decrement-quantity.svg" />
                        <div class="quantity">${product.quantity}</div>
                        <img class="plus" src="assets/images/icon-increment-quantity.svg" />
                    </div>
                    <div class="normal">
                        <img src="assets/images/icon-add-to-cart.svg" alt="" />
                        Add to Cart
                    </div>
                    </div>
                </div>
                <div class="info">
                <div class="category">${product.category}</div>
                <div class="name">${product.name}</div>
                <div class="price">$${product.price}</div>
                </div>
            `
            productsListHtml.appendChild(newProduct)
        })
    }
}


productsListHtml.addEventListener("click", (e)=> {
    if (e.target.parentElement.classList.contains("image")) {
        e.target.parentElement.classList.toggle("active")
    }
    if (e.target.classList.contains("normal")) {
        e.target.parentElement.parentElement.classList.toggle("active")
    }
    if (e.target.classList.contains("plus") || e.target.classList.contains("minus")) {
        let item = e.target.parentElement.parentElement.parentElement.parentElement
        let product_id = item.dataset.id
        let type = 'minus';
        if (e.target.classList.contains("plus")) {
            type = 'plus'
        }
        changeQuantity(product_id, type, item)
    }
})


const changeQuantity = (product_id, type, item)=> {
    let positionInCart = carts.findIndex((value)=> value.product_id == product_id)
    let productQuantity = item.querySelector(".quantity")
    switch (type) {
        case "plus":
            productQuantity.innerText++
            if (positionInCart >= 0) {
                carts[positionInCart].quantity++                
            } else {
                carts.push({
                    product_id: product_id,
                    quantity: 1
                })
            }
            break
        default:
            if (carts.length > 0) {
                let changeValue = carts[positionInCart].quantity - 1
                if ( changeValue > 0) {
                    carts[positionInCart].quantity--
                    productQuantity.innerText--
                } else  if (changeValue == 0) {
                    productQuantity.innerText--
                    carts.splice(positionInCart, 1)
                }
            }
            break
    }
    addToMemory()
    addCartToHtml()
}


const addToCart = (product_id)=> {
    let productCartPosition = carts.findIndex((value)=> value.product_id == product_id);

    if (carts.length == 0) {
        carts = [{
            product_id: product_id,
            quantity: 1
        }]
    } else if (productCartPosition < 0) {
        carts.push({
            product_id: product_id,
            quantity: 1
        })
    } else {
        carts[productCartPosition].quantity++
    }
    addCartToHtml()
    addToMemory()
}

const addCartToHtml = ()=> {
    cartHtml.innerHTML = ""
    if (carts.length == 0) {
        cartHtml.innerHTML = `
        <img src="assets/images/illustration-empty-cart.svg" alt="empty" />
        <p>Your added items will appear here</p>
        `
    }
    let totalQuantity = 0
    let totalPrice = 0
    if (carts.length > 0) {
        carts.forEach((cart)=> {
            totalQuantity += cart.quantity
            let positionInProductList = productsList.findIndex((value)=>  value.id == cart.product_id)
            let info = productsList[positionInProductList]
            totalPrice += info.price * cart.quantity;
            let newCart = document.createElement("div");
            newCart.className = "item";
            newCart.dataset.id = cart.product_id
            newCart.innerHTML = `
            <div class="info">
              <div class="name">${info.name}</div>
              <div class="nums">
                <span class="quantity">${cart.quantity}x</span>
                <span class="price">@ $${info.price}</span>
                <span class="total-price">$${info.price * cart.quantity}</span>
              </div>
            </div>
            <svg class="icon"
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              fill="none"
              viewBox="0 0 10 10"
            >
              <path
                fill="#CAAFA7"
                d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"
              />
            </svg>
            `
            cartHtml.appendChild(newCart)
        })
        const allPrices = document.createElement("div")
        allPrices.className = "allPrices";
        let txtSpan = document.createElement("span")
        let txt = document.createTextNode("Order Total")
        txtSpan.appendChild(txt)
        let PriceSpan = document.createElement("span");
        let nodePrice = document.createTextNode('$'+totalPrice)
        PriceSpan.appendChild(nodePrice)
        allPrices.appendChild(txtSpan)
        allPrices.appendChild(PriceSpan)
        cartHtml.appendChild(allPrices)

        const carbon = document.createElement("div")
        carbon.className = "carbon"
        let icon = '<svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" fill="none" viewBox="0 0 21 20"><path fill="#1EA575" d="M8 18.75H6.125V17.5H8V9.729L5.803 8.41l.644-1.072 2.196 1.318a1.256 1.256 0 0 1 .607 1.072V17.5A1.25 1.25 0 0 1 8 18.75Z"/><path fill="#1EA575" d="M14.25 18.75h-1.875a1.25 1.25 0 0 1-1.25-1.25v-6.875h3.75a2.498 2.498 0 0 0 2.488-2.747 2.594 2.594 0 0 0-2.622-2.253h-.99l-.11-.487C13.283 3.56 11.769 2.5 9.875 2.5a3.762 3.762 0 0 0-3.4 2.179l-.194.417-.54-.072A1.876 1.876 0 0 0 5.5 5a2.5 2.5 0 1 0 0 5v1.25a3.75 3.75 0 0 1 0-7.5h.05a5.019 5.019 0 0 1 4.325-2.5c2.3 0 4.182 1.236 4.845 3.125h.02a3.852 3.852 0 0 1 3.868 3.384 3.75 3.75 0 0 1-3.733 4.116h-2.5V17.5h1.875v1.25Z"/></svg>'
        let carbontTxt = document.createTextNode("This is a carbon-neutral delivery")
        carbon.innerHTML = icon
        carbon.appendChild(carbontTxt)
        cartHtml.appendChild(carbon)

        const confBtn = document.createElement("button")
        confBtn.className = "confirm"
        confBtn.innerHTML = "Confirm Order"
        cartHtml.appendChild(confBtn)
    }
    quantitySpan.innerText = totalQuantity
}

const addToMemory = ()=> {
    localStorage.setItem("products", JSON.stringify(carts))
}

const addQuantityToHtml = ()=> {
    if (carts.length > 0) {
        carts.forEach((cart)=> {
            let productInList = productsList.findIndex((value)=> value.id == cart.product_id);
            if (productInList >= 0 ) {
                productsList[productInList].quantity = cart.quantity
            }
        })
    }
    addProductsToHtml()
}


cartHtml.addEventListener("click", (e)=> {
    if (e.target.parentElement.classList.contains("icon") || e.target.classList.contains("icon")) {
        let cartProduct_id;
        
        if (carts.length > 0) {
            if (e.target.parentElement.classList.contains("icon")) {
                cartProduct_id = e.target.parentElement.parentElement.dataset.id
            } else if (e.target.classList.contains("icon")) {
                cartProduct_id = e.target.parentElement.dataset.id
            }
            let deletedProduct = carts.findIndex((value)=> value.product_id == cartProduct_id)
            if (deletedProduct >= 0) {
                carts.splice(deletedProduct, 1)
                let item = productsListHtml.children[cartProduct_id - 1]
                let productQuantity = item.querySelector(".quantity")
                productQuantity.innerText = 0
            }
        }
        addCartToHtml()
        addToMemory()
    }
})



cartHtml.addEventListener("click", (e)=> {
    if (e.target.classList.contains("confirm")) {
        modalContainer.style.display = "block"
        addToModal()
    }
})

const addToModal = ()=> {
    order.innerHTML = ""
    let totalPrice = 0
    if (carts.length > 0) {
        carts.forEach((cart)=> {
            let positionInProductList = productsList.findIndex((value)=> value.id == cart.product_id)
            let info = productsList[positionInProductList];
            totalPrice += cart.quantity * info.price

            let newConferm = document.createElement("div")
            newConferm.className = "item";
            newConferm.innerHTML = `
            <img src="${info.image.thumbnail}" />
            <div class="info">
              <div class="name">${info.name}</div>
              <div>
                <span class="quantity">${cart.quantity}x</span>
                <span class="price">@ $${info.price}</span>
              </div>
            </div>
            <div class="total-price">$${cart.quantity * info.price}</div>
            `
            order.appendChild(newConferm)
        })
        let totalDiv = document.createElement("div")
        totalDiv.className = "totalPrice"
        let txtSpan = document.createElement("span")
        let txt = document.createTextNode("Order Total")
        txtSpan.appendChild(txt)
        let totalSpan = document.createElement("span")
        totalSpan.append('$'+totalPrice)

        totalDiv.appendChild(txtSpan)
        totalDiv.appendChild(totalSpan)

        order.appendChild(totalDiv)        
    }
}

modal.addEventListener('click', (e)=> {
    if (e.target.classList.contains("new")) {
        modalContainer.style.display = "none"
        carts = []
        addCartToHtml()
        addProductsToHtml()
        addToMemory()
    }
})
